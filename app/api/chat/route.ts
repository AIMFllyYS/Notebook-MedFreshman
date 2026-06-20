import type { NextRequest } from "next/server";
import { buildSystemPrompt, buildLocationLine } from "@/lib/ai/prompts";
import { getContextManager } from "@/lib/context";
import type { ChatContext, ChatOptions } from "@/lib/types/chat";
import { getToolDefs, runTool } from "@/lib/ai/tools";
import {
  resolveProvider,
  chatCompletionsUrl,
  thinkingBudget,
  ENV_MODEL_PRO,
  ENV_MODEL_FLASH,
  type CustomProvider,
} from "@/lib/ai/provider";
import { getModelInfo } from "@/lib/ai/models";
import { streamInteractiveArtifact } from "@/lib/ai/artifact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOOL_TURNS = 6;

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
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
interface StreamChunk {
  choices?: Array<{ delta?: StreamDelta; finish_reason?: string }>;
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
  const disabledTools: string[] = Array.isArray(body.disabledTools)
    ? body.disabledTools.map(String)
    : [];

  // 多科上下文参数
  const subjectId: string = String(body.subjectId ?? "probability");
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
  const provider = resolveProvider(modelId, customProvider);
  const reasoningField = provider.reasoningField;
  const toolDefs = getToolDefs({ enableSearch: options.enableSearch ?? false, disabled: disabledTools });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));

      try {
        if (!provider.configured) {
          send({
            type: "content",
            content:
              "AI 暂未配置。请在 .env.local 填写 AI_BASE_URL / AI_API_KEY，或在「设置」中填入自定义 API 后重试。",
          });
          send({ type: "done" });
          controller.close();
          return;
        }

        // 构建上下文
        const ctxManager = getContextManager(options.contextMode ?? "full");
        const ctxResult = await ctxManager.buildContext(chatCtx, messages[messages.length - 1]?.content || "");

        if (ctxResult.overflow) {
          send({ type: "error", message: "上下文内容过长，已超出模型处理限制，请缩小阅读范围或切换为语义检索模式。" });
          send({ type: "done" });
          controller.close();
          return;
        }

        // 稳定前缀（global + 学科），利于 prefix 缓存命中。
        const systemPrompt = buildSystemPrompt(chatCtx);
        // 易变上下文（当前定位 + 参考材料）后置为独立 system 消息，避免破坏前缀缓存。
        const volatile = buildLocationLine(chatCtx) +
          (ctxResult.context ? `\n\n【参考材料】\n${ctxResult.context}` : "");

        const convo: Record<string, unknown>[] = [
          { role: "system", content: systemPrompt },
          { role: "system", content: volatile },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const endpoint = chatCompletionsUrl(provider.baseUrl);

        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const reqBody: Record<string, unknown> = {
            model: provider.model,
            messages: convo,
            tools: toolDefs,
            tool_choice: "auto",
            stream: true,
            temperature: 0.6,
          };

          // 深度思考参数（仅在模型支持思考时下发，避免不支持的端点报未知参数）。
          if (options.enableThinking) {
            const info = provider.isCustom ? undefined : getModelInfo(provider.model);
            const supportsThinking = provider.isCustom || !info || info.thinking;
            if (supportsThinking) {
              reqBody.enable_thinking = true;
              reqBody.thinking_budget = thinkingBudget(options.thinkingEffort);
            }
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify(reqBody),
          });

          if (!res.ok || !res.body) {
            const t = await res.text().catch(() => "");
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
              const choice = json.choices?.[0];
              if (!choice) continue;
              const delta: StreamDelta = choice.delta || {};

              // 深度思考增量
              const reasoning = delta[reasoningField] ?? delta.reasoning;
              if (reasoning) send({ type: "reasoning", delta: reasoning });

              // 内容增量
              if (delta.content) {
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
              let parsed: Record<string, unknown> = {};
              try { parsed = c.args ? JSON.parse(c.args) : {}; } catch { parsed = {}; }

              // renderInteractive 的产物 id 在调用伊始即确定并随 "call" 事件下发，
              // 让前端能从流式一开始就把内嵌产物卡片挂到这条消息上（边生成边看代码）。
              const artifactId = c.name === "renderInteractive" ? `art_${c.id}` : undefined;
              send({
                type: "tool",
                id: c.id,
                name: c.name,
                args: parsed,
                status: "call",
                meta: artifactId ? { artifactId } : undefined,
              });

              // renderInteractive：交由"子智能体"流式生成 HTML 产物（消息内卡片实时展示）。
              if (c.name === "renderInteractive") {
                const summary = await streamInteractiveArtifact(
                  send,
                  artifactId!,
                  { title: String(parsed.title ?? ""), prompt: String(parsed.prompt ?? "") },
                  provider,
                );
                send({ type: "tool", id: c.id, status: "result", meta: { artifactId } });
                convo.push({ role: "tool", tool_call_id: c.id, content: summary });
                continue;
              }

              const result = await runTool(c.name, parsed, {
                subjectId,
                categoryId,
                itemId,
              });
              send({ type: "tool", id: c.id, status: "result", meta: result.meta });
              convo.push({ role: "tool", tool_call_id: c.id, content: result.content });
            }
            continue;
          }

          send({ type: "done" });
          controller.close();
          return;
        }

        // 超过最大工具调用轮次
        send({ type: "done" });
        controller.close();
      } catch (err) {
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
    },
  });
}
