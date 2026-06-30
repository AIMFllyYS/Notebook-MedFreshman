import type { NextRequest } from "next/server";
import { buildSystemPrompt, buildLocationLine } from "@/lib/ai/prompts";
import { getContextManager } from "@/lib/context";
import type { ChatContext, ChatOptions } from "@/lib/types/chat";
import { getToolDefs, runTool, IMAGE_SEARCH_MAX_TOTAL } from "@/lib/ai/tools";
import {
  resolveProvider,
  resolveNextProvider,
  chatCompletionsUrl,
  buildThinkingRequestParams,
  extractReasoningDelta,
  ENV_MODEL_PRO,
  ENV_MODEL_FLASH,
  type CustomProvider,
  type ResolvedProvider,
} from "@/lib/ai/provider";
import { getModelInfo, getModelInfoWithCustom, type CustomApiGroup } from "@/lib/ai/models";
import {
  parseUpstreamErrorBody,
  isRecoverableUpstreamFailure,
  isFetchAbortError,
} from "@/lib/ai/upstream";
import { estimateTokens } from "@/lib/context/estimateTokens";
import type { Skill } from "@/lib/types/skill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOOL_TURNS = 6;

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

type MessageContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ClientMessage {
  role: "user" | "assistant";
  content: string | MessageContentPart[];
}

// 上游 SSE 流式增量的最小结构（OpenAI 兼容 chat/completions 流格式）。
interface StreamToolCall {
  index?: number;
  id?: string;
  function?: { name?: string; arguments?: string };
}
interface StreamDelta {
  content?: string;
  reasoning?: string;
  tool_calls?: StreamToolCall[];
  // 深度思考字段名可由环境变量（REASONING_FIELD）配置，故保留字符串索引签名。
  [key: string]: unknown;
}
interface StreamUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
}
interface StreamChunk {
  choices?: Array<{ delta?: StreamDelta; finish_reason?: string }>;
  usage?: StreamUsage;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messages: ClientMessage[] = Array.isArray(body.messages) ? body.messages : [];

  // 模型选择：优先 modelId（新菜单）；兼容旧式 model:'flash'/'pro'（如划词浮窗）。
  let modelId: string | undefined =
    typeof body.modelId === "string" ? body.modelId : undefined;
  if (!modelId && typeof body.model === "string") {
    modelId = body.model === "pro" ? ENV_MODEL_PRO : body.model === "flash" ? ENV_MODEL_FLASH : undefined;
  }
  const customProvider: CustomProvider | undefined =
    body.customProvider && typeof body.customProvider === "object" ? body.customProvider : undefined;
  const customApiGroups: CustomApiGroup[] = Array.isArray(body.customApiGroups)
    ? body.customApiGroups
    : [];
  const defaultImageModelId: string | null =
    typeof body.defaultImageModelId === "string" ? body.defaultImageModelId : null;
  const imageModeTextModel: string =
    typeof body.imageModeTextModel === "string" ? body.imageModeTextModel : "mimo-v2.5";
  const imageModeTextModelFallback: string =
    typeof body.imageModeTextModelFallback === "string" ? body.imageModeTextModelFallback : "Pro/moonshotai/Kimi-K2.6";
  const disabledTools: string[] = Array.isArray(body.disabledTools)
    ? body.disabledTools.map(String)
    : [];

  // 全局补充上下文 + 技能库（前端本地存储，随请求携带）
  const globalContext: string =
    typeof body.globalContext === "string" ? body.globalContext.trim() : "";
  const skills: Skill[] = (Array.isArray(body.skills) ? body.skills : [])
    .filter((s: unknown): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s: Record<string, unknown>) => ({
      id: String(s.id ?? ""),
      name: String(s.name ?? "").trim(),
      description: String(s.description ?? ""),
      content: String(s.content ?? ""),
      pinned: s.pinned === true,
      createdAt: Number(s.createdAt ?? 0),
    }))
    .filter((s: Skill) => s.name && s.content)
    // 稳定排序，保证拼装的系统前缀逐字节一致、利于缓存命中
    .sort((a: Skill, b: Skill) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const pinnedSkills = skills.filter((s) => s.pinned);
  const menuSkills = skills.filter((s) => !s.pinned);

  // 多科上下文参数
  const subjectId: string = String(body.subjectId ?? "other");
  const categoryId: string = String(body.categoryId ?? "detail");
  const itemId: string = String(body.itemId ?? "");
  const currentTopic: string = String(body.currentTopic ?? "");

  // 对话选项
  const options: ChatOptions = {
    enableThinking: body.enableThinking === true,
    enableSearch: body.enableSearch === true,
    thinkingEffort: body.thinkingEffort || "medium",
    contextMode: body.contextMode === "semantic" ? "semantic" : "full",
  };

  const chatCtx: ChatContext = { subjectId, categoryId, itemId, currentTopic };

  // 生图模式检测：用户选择了生图模型时，文本对话使用 imageModeTextModel
  const selectedModelInfo = modelId
    ? getModelInfoWithCustom(modelId, customApiGroups)
    : undefined;
  const isImageMode = selectedModelInfo?.type === "image";

  // 实际用于 chat/completions 的 modelId：生图模式下切换到文本模型
  const effectiveModelId = isImageMode ? imageModeTextModel : modelId;
  const effectiveCustom = customApiGroups.length > 0 ? customApiGroups : customProvider;
  const provider = resolveProvider(effectiveModelId, effectiveCustom);
  const reasoningField = provider.reasoningField;
  const modelInfo = effectiveModelId ? getModelInfoWithCustom(effectiveModelId, customApiGroups) : undefined;
  const modelSupportsTools = modelInfo?.tools !== false;
  const toolDefs = getToolDefs({
    enableSearch: options.enableSearch ?? false,
    disabled: disabledTools,
    skillNames: menuSkills.map((s) => s.name),
  });

  // 检测消息中是否包含图片
  const hasVisionContent = messages.some(
    (m) => Array.isArray(m.content) && m.content.some((p) => p.type === "image_url"),
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));

      // SSE 心跳保活：在 LLM 首 token 延迟期间定期发送注释行，
      // 防止 EdgeOne 边缘节点 idle timeout 断开连接。
      let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
      let firstContentSent = false;
      const startHeartbeat = () => {
        if (heartbeatTimer) return;
        heartbeatTimer = setInterval(() => {
          if (!firstContentSent) {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          }
        }, 15000);
      };
      const stopHeartbeat = () => {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      };
      startHeartbeat();

      try {
        if (!provider.configured) {
          stopHeartbeat();
          send({
            type: "content",
            content:
              "AI 暂未配置。请在 .env.local 填写 AI_BASE_URL / AI_API_KEY，或在「设置」中填入自定义 API 后重试。",
          });
          send({ type: "done" });
          controller.close();
          return;
        }

        // 视觉模型检查：含图片但模型不支持 vision 时拒绝
        if (hasVisionContent && modelInfo && !modelInfo.vision && !provider.isCustom) {
          stopHeartbeat();
          send({ type: "error", message: `当前模型 ${modelInfo.label} 不支持图片理解，请切换到支持视觉的模型（如 MiMo V2.5）。` });
          send({ type: "done" });
          controller.close();
          return;
        }

        // 构建上下文（从最后一条消息中提取纯文本）
        const lastMsg = messages[messages.length - 1];
        const lastMsgText = typeof lastMsg?.content === "string"
          ? lastMsg.content
          : Array.isArray(lastMsg?.content)
            ? lastMsg.content.filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join(" ")
            : "";
        const ctxManager = getContextManager(options.contextMode ?? "full");
        const ctxResult = await ctxManager.buildContext(chatCtx, lastMsgText);

        if (ctxResult.overflow) {
          stopHeartbeat();
          send({ type: "error", message: "上下文内容过长，已超出模型处理限制，请缩小阅读范围或切换为语义检索模式。" });
          send({ type: "done" });
          controller.close();
          return;
        }

        // 稳定前缀（global + 学科），利于 prefix 缓存命中。
        const baseSystemPrompt = buildSystemPrompt(chatCtx);

        // 会话内稳定的用户内容（全局上下文 / 固定技能全文 / 可调用技能菜单）一并拼入稳定前缀，
        // 多轮间逐字节一致 → 命中缓存；仅在用户改动设置后失效一次再恢复。
        const skillsMenuText = menuSkills.length
          ? menuSkills.map((s) => `- ${s.name}：${s.description || "（无描述）"}`).join("\n")
          : "";
        const pinnedSkillsText = pinnedSkills.length
          ? pinnedSkills.map((s) => `### ${s.name}\n${s.content}`).join("\n\n")
          : "";

        const promptExtras: string[] = [];
        if (globalContext) {
          promptExtras.push(`## 全局补充上下文（用户提供，始终适用）\n${globalContext}`);
        }
        if (pinnedSkillsText) {
          promptExtras.push(`## 已固定启用的技能（用户手动开启，请始终遵循其指导）\n${pinnedSkillsText}`);
        }
        if (skillsMenuText) {
          promptExtras.push(
            `## 可调用的技能库\n当下列技能与用户问题相关时，调用 useSkill 工具（参数 name 用技能名）加载其完整内容；一次只调用最相关的一个：\n${skillsMenuText}`,
          );
        }
        const systemPrompt = promptExtras.length
          ? `${baseSystemPrompt}\n\n---\n\n${promptExtras.join("\n\n---\n\n")}`
          : baseSystemPrompt;

        // 易变上下文（当前定位 + 参考材料）。
        const volatile = buildLocationLine(chatCtx) +
          (ctxResult.context ? `\n\n【参考材料】\n${ctxResult.context}` : "");

        // 工具结果归类用：tool_call_id → 工具名（跨轮累积，供上下文分项统计）。
        const toolNameById = new Map<string, string>();

        // 必须只有「一条」system 消息且在最前：部分模型（如硅基流动 Qwen3）会对第二条
        // system 报 20015「System message must be at the beginning.」。故把稳定前缀与易变
        // 上下文合并为单条 system（同页多轮内两部分均稳定 → 仍可命中前缀缓存）。
        const systemMessage = volatile ? `${systemPrompt}\n\n${volatile}` : systemPrompt;
        const convo: Record<string, unknown>[] = [
          { role: "system", content: systemMessage },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        let activeProvider: ResolvedProvider = provider;
        let endpoint = chatCompletionsUrl(activeProvider.baseUrl);
        let imageModeFailoverAttempted = false;

        const tryFailover = (): boolean => {
          const next = resolveNextProvider(
            activeProvider.registryId,
            activeProvider.endpointIndex,
            effectiveCustom,
          );
          if (!next) return false;
          activeProvider = next;
          endpoint = chatCompletionsUrl(activeProvider.baseUrl);
          send({
            type: "info",
            message: `主端点不可用，已切换到备用 API（${next.apiModelId}）`,
          });
          return true;
        };

        // 跨工具调用轮次累加 usage：每轮向 LLM 的独立请求都产生 token 消耗，
        // 必须全部累加才能反映真实计费。之前只发最后一轮导致工具场景少算 40%+。
        const totalUsage: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cached_tokens: number;
        } = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cached_tokens: 0 };

        const imageSearchFetchedCount = { value: 0 };

        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const effectiveToolDefs = imageSearchFetchedCount.value >= IMAGE_SEARCH_MAX_TOTAL
            ? toolDefs.filter((t) => t.function.name !== "imageSearch")
            : toolDefs;
          const reqBody: Record<string, unknown> = {
            model: activeProvider.apiModelId,
            messages: convo,
            stream: true,
            stream_options: { include_usage: true },
            temperature: 0.6,
          };
          if (modelSupportsTools && effectiveToolDefs.length > 0) {
            reqBody.tools = effectiveToolDefs;
            reqBody.tool_choice = "auto";
          }

          // 深度思考参数（仅在模型支持思考时下发，避免不支持的端点报未知参数）。
          if (options.enableThinking) {
            const info = activeProvider.isCustom
              ? getModelInfoWithCustom(activeProvider.registryId, customApiGroups)
              : getModelInfo(activeProvider.registryId);
            const supportsThinking = info?.thinking === true;
            if (supportsThinking) {
              Object.assign(
                reqBody,
                buildThinkingRequestParams(activeProvider.thinkingRequestStyle, options.thinkingEffort),
              );
            }
          }

          const abortCtrl = new AbortController();
          const fetchTimeoutId = setTimeout(() => abortCtrl.abort(), activeProvider.timeoutMs);

          let res: Response;
          try {
            res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${activeProvider.apiKey}`,
              },
              body: JSON.stringify(reqBody),
              signal: abortCtrl.signal,
            });
          } catch (err) {
            // 生图模式文本模型容灾降级：Mimo v2.5 失败时切换到 Kimi K2.6
            if (isImageMode && !imageModeFailoverAttempted) {
              imageModeFailoverAttempted = true;
              const fallbackProvider = resolveProvider(imageModeTextModelFallback, effectiveCustom);
              if (fallbackProvider.configured) {
                activeProvider = fallbackProvider;
                endpoint = chatCompletionsUrl(activeProvider.baseUrl);
                send({ type: "info", message: `${imageModeTextModel} 不可用，已降级到 ${imageModeTextModelFallback}` });
                turn--;
                continue;
              }
            }
            if (isFetchAbortError(err) && tryFailover()) {
              turn--;
              continue;
            }
            throw err;
          } finally {
            clearTimeout(fetchTimeoutId);
          }

          if (!res.ok || !res.body) {
            const t = await res.text().catch(() => "");
            const upstreamErr = parseUpstreamErrorBody(t);
            // 生图模式文本模型容灾降级（HTTP 错误时）
            if (isImageMode && !imageModeFailoverAttempted) {
              imageModeFailoverAttempted = true;
              const fallbackProvider = resolveProvider(imageModeTextModelFallback, effectiveCustom);
              if (fallbackProvider.configured) {
                activeProvider = fallbackProvider;
                endpoint = chatCompletionsUrl(activeProvider.baseUrl);
                send({ type: "info", message: `${imageModeTextModel} 不可用，已降级到 ${imageModeTextModelFallback}` });
                turn--;
                continue;
              }
            }
            if (isRecoverableUpstreamFailure(res.status, upstreamErr.errorCode) && tryFailover()) {
              turn--;
              continue;
            }
            stopHeartbeat();
            send({ type: "error", message: `接口返回 ${res.status}：${t.slice(0, 300)}` });
            send({ type: "done" });
            controller.close();
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let contentBuf = "";
          const toolCalls: Record<number, { id: string; name: string; args: string }> = {};
          let finish = "";
          let lastUsage: StreamUsage | undefined;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, nl).trim();
              buf = buf.slice(nl + 1);
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              let json: StreamChunk;
              try { json = JSON.parse(data); } catch { continue; }

              if (json.usage) lastUsage = json.usage;

              const choice = json.choices?.[0];
              if (!choice) continue;
              const delta: StreamDelta = choice.delta || {};

              // 深度思考增量
              const reasoning = extractReasoningDelta(delta, reasoningField);
              if (reasoning) send({ type: "reasoning", delta: reasoning });

              // 内容增量
              if (delta.content) {
                firstContentSent = true;
                stopHeartbeat();
                contentBuf += delta.content;
                send({ type: "content", delta: delta.content });
              }

              // 工具调用增量
              if (Array.isArray(delta.tool_calls)) {
                for (const tc of delta.tool_calls) {
                  const i = tc.index ?? 0;
                  toolCalls[i] ??= { id: tc.id || `call_${i}`, name: "", args: "" };
                  if (tc.id) toolCalls[i].id = tc.id;
                  if (tc.function?.name) toolCalls[i].name += tc.function.name;
                  if (tc.function?.arguments) toolCalls[i].args += tc.function.arguments;
                }
              }
              if (choice.finish_reason) finish = choice.finish_reason;
            }
          }

          // 累加本轮 usage 到跨轮总计（工具调用中间轮的 token 也计入）
          if (lastUsage) {
            totalUsage.prompt_tokens += lastUsage.prompt_tokens ?? 0;
            totalUsage.completion_tokens += lastUsage.completion_tokens ?? 0;
            totalUsage.total_tokens += lastUsage.total_tokens ?? 0;
            totalUsage.cached_tokens += lastUsage.prompt_tokens_details?.cached_tokens ?? 0;
          }

          // 工具调用循环
          const calls = Object.values(toolCalls).filter((c) => c.name);
          if (calls.length > 0 && finish !== "stop") {
            convo.push({
              role: "assistant",
              content: contentBuf || null,
              tool_calls: calls.map((c) => ({
                id: c.id,
                type: "function",
                function: { name: c.name, arguments: c.args || "{}" },
              })),
            });
            for (const c of calls) {
              toolNameById.set(c.id, c.name);
              let parsed: Record<string, unknown> = {};
              try {
                parsed = c.args ? JSON.parse(c.args) : {};
              } catch {
                send({ type: "tool", id: c.id, name: c.name, args: {}, status: "result", meta: {} });
                convo.push({
                  role: "tool",
                  tool_call_id: c.id,
                  content: `工具 ${c.name} 的参数格式错误（JSON 解析失败），请检查参数后重试。原始参数：${(c.args || "").slice(0, 200)}`,
                });
                continue;
              }

              // renderInteractive 的产物 id 随 tool call 下发，前端卡片拿到 title/prompt 后
              // 独立请求 /api/artifact 流式生成 HTML，不再阻塞主聊天 SSE。
              const artifactId = c.name === "renderInteractive" ? `art_${c.id}` : undefined;
              // generateImage 同理：随 tool call 下发 imageGenId，前端展示批准卡片，
              // 用户批准后独立请求 /api/image-gen 生图，不阻塞主聊天 SSE。
              const imageGenId = c.name === "generateImage" ? `img_${c.id}` : undefined;
              send({
                type: "tool",
                id: c.id,
                name: c.name,
                args: parsed,
                status: "call",
                meta: artifactId
                  ? { artifactId }
                  : imageGenId
                    ? { imageGenId }
                    : undefined,
              });

              if (c.name === "renderInteractive") {
                const title = String(parsed.title ?? "");
                send({ type: "tool", id: c.id, status: "result", meta: { artifactId } });
                convo.push({
                  role: "tool",
                  tool_call_id: c.id,
                  content: `交互演示「${title || "交互演示"}」已开始在前端独立生成。请用一两句话说明这个演示将帮助理解什么，然后继续你的讲解。`,
                });
                continue;
              }

              if (c.name === "generateImage") {
                const title = String(parsed.title ?? "");
                send({ type: "tool", id: c.id, status: "result", meta: { imageGenId } });
                convo.push({
                  role: "tool",
                  tool_call_id: c.id,
                  content: `生图请求「${title || "AI 生图"}」已提交，等待用户批准后才会实际生成。请用一两句话说明这张图将帮助理解什么，然后继续你的讲解。`,
                });
                continue;
              }

              const result = await runTool(c.name, parsed, {
                subjectId,
                categoryId,
                itemId,
                skills,
                imageSearchFetchedCount,
              });
              send({ type: "tool", id: c.id, status: "result", meta: result.meta });
              convo.push({ role: "tool", tool_call_id: c.id, content: result.content });
            }
            continue;
          }

          // FollowUp 兜底：模型未输出 <FollowUp> 标签时，调用轻量模型生成追问
          if (contentBuf && !/<FollowUp>[\s\S]*?<\/FollowUp>/i.test(contentBuf)) {
            try {
              const lastUserMsg = messages.filter((m) => m.role === "user").pop();
              const userText = typeof lastUserMsg?.content === "string"
                ? lastUserMsg.content
                : Array.isArray(lastUserMsg?.content)
                  ? lastUserMsg!.content.filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join(" ")
                  : "";
              const fuEndpoint = chatCompletionsUrl(provider.baseUrl);
              const fuModel = provider.isCustom ? provider.apiModelId : ENV_MODEL_FLASH;
              const fuCtrl = new AbortController();
              const fuTimer = setTimeout(() => fuCtrl.abort(), 10000);
              const fuRes = await fetch(fuEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${provider.apiKey}`,
                },
                body: JSON.stringify({
                  model: fuModel,
                  messages: [
                    {
                      role: "system",
                      content: "你是学习助教。根据学生的提问和助教的回答，生成3个学生可能想继续追问的问题。只输出问题本身，用|分隔，不要编号或额外说明。问题应简洁（15字以内）、有针对性、层层递进。",
                    },
                    {
                      role: "user",
                      content: `学生提问：${userText.slice(0, 500)}\n\n助教回答（摘要）：${contentBuf.slice(0, 1000)}\n\n请生成3个追问：`,
                    },
                  ],
                  temperature: 0.5,
                  max_tokens: 200,
                  stream: false,
                }),
                signal: fuCtrl.signal,
              });
              clearTimeout(fuTimer);
              if (fuRes.ok) {
                const fuJson = await fuRes.json().catch(() => null);
                const fuText = fuJson?.choices?.[0]?.message?.content?.trim();
                if (fuText) {
                  // 清理可能的编号前缀（1. 2. 3.）和换行，只保留 | 分隔的问题
                  const cleaned = fuText
                    .replace(/^\d+[.、)]\s*/gm, '')
                    .replace(/\n+/g, '|')
                    .replace(/\|+/g, '|')
                    .trim();
                  const questions = cleaned
                    .split("|")
                    .map((q: string) => q.trim())
                    .filter(Boolean)
                    .slice(0, 3);
                  if (questions.length > 0) {
                    send({ type: "followup", questions });
                  }
                }
              } else {
                console.warn("[FollowUp fallback] API returned", fuRes.status);
              }
            } catch (fuErr) {
              console.warn("[FollowUp fallback] failed:", (fuErr as Error)?.message);
            }
          }

          // 上下文分项统计（服务端按真实拼装精确计算）。system 各组成由源变量单独累计，
          // 对话与工具结果（convo[0] 为合并后的单条 system，故 i≥1）按工具名归类。
          const tk = (v: unknown) => estimateTokens(typeof v === "string" ? v : JSON.stringify(v ?? ""));
          const breakdown = {
            tools: tk(baseSystemPrompt) + tk(globalContext) + tk(JSON.stringify(toolDefs)),
            skills: tk(skillsMenuText) + tk(pinnedSkillsText),
            conversation: 0,
            pages: tk(volatile),
            webSearch: 0,
            total: 0,
          };
          for (let i = 1; i < convo.length; i++) {
            const msg = convo[i] as { role?: string; content?: unknown; tool_call_id?: string; tool_calls?: unknown };
            const t = tk(msg.content);
            if (msg.role === "tool") {
              const tn = msg.tool_call_id ? toolNameById.get(msg.tool_call_id) : undefined;
              if (tn === "useSkill") breakdown.skills += t;
              else if (tn === "webSearch" || tn === "imageSearch") breakdown.webSearch += t;
              else if (tn === "getCurrentPage" || tn === "getSection" || tn === "searchNotes") breakdown.pages += t;
              else breakdown.conversation += t;
            } else {
              breakdown.conversation += t;
              if (msg.tool_calls) breakdown.conversation += tk(JSON.stringify(msg.tool_calls));
            }
          }
          breakdown.total =
            breakdown.tools + breakdown.skills + breakdown.conversation + breakdown.pages + breakdown.webSearch;
          send({ type: "context_breakdown", breakdown });

          if (totalUsage.prompt_tokens > 0 || totalUsage.completion_tokens > 0) {
            send({
              type: "usage",
              usage: {
                promptTokens: totalUsage.prompt_tokens,
                completionTokens: totalUsage.completion_tokens,
                cachedTokens: totalUsage.cached_tokens,
                totalTokens: totalUsage.total_tokens || (totalUsage.prompt_tokens + totalUsage.completion_tokens),
              },
            });
          }
          stopHeartbeat();
          send({ type: "done" });
          controller.close();
          return;
        }

        // 超过最大工具调用轮次——仍发送已累加的 usage，避免计费丢失
        if (totalUsage.prompt_tokens > 0 || totalUsage.completion_tokens > 0) {
          send({
            type: "usage",
            usage: {
              promptTokens: totalUsage.prompt_tokens,
              completionTokens: totalUsage.completion_tokens,
              cachedTokens: totalUsage.cached_tokens,
              totalTokens: totalUsage.total_tokens || (totalUsage.prompt_tokens + totalUsage.completion_tokens),
            },
          });
        }
        stopHeartbeat();
        send({ type: "done" });
        controller.close();
      } catch (err) {
        stopHeartbeat();
        try {
          send({ type: "error", message: String((err as Error)?.message ?? err) });
          send({ type: "done" });
          controller.close();
        } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
