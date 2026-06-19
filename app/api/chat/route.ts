import type { NextRequest } from "next/server";
import { SYSTEM_PROMPT_TEMPLATE } from "@/lib/constants/prompts";
import { SUBJECTS } from "@/lib/constants/subjects";
import { getContextManager } from "@/lib/context";
import type { ChatContext, ChatOptions } from "@/lib/types/chat";
import { getActiveTools } from "@/lib/types/tools";
import { runTool } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AI_BASE_URL || "";
const KEY = process.env.AI_API_KEY || "";
const MODEL_PRO = process.env.AI_MODEL_PRO || "v4-pro";
const MODEL_FLASH = process.env.AI_MODEL_FLASH || "v4-flash";
const REASONING_FIELD = process.env.AI_REASONING_FIELD || "reasoning_content";
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

function buildSystemPrompt(chatCtx: ChatContext): string {
  const subjectName = SUBJECTS[chatCtx.subjectId as keyof typeof SUBJECTS] || chatCtx.subjectId;
  let prompt = SYSTEM_PROMPT_TEMPLATE.replace("{subjectName}", subjectName);
  prompt += `\n\n【当前上下文】科目：${subjectName} | 分类：${chatCtx.categoryId} | 内容项：${chatCtx.itemId}`;
  if (chatCtx.currentTopic) {
    prompt += ` | 主题：${chatCtx.currentTopic}`;
  }
  return prompt;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messages: ClientMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const model: string = body.model === "flash" ? "flash" : "pro";

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
  const modelId = model === "flash" ? MODEL_FLASH : MODEL_PRO;
  const toolDefs = getActiveTools(options.enableSearch ?? false);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));

      try {
        if (!BASE || !KEY || BASE.includes("your-endpoint")) {
          send({
            type: "content",
            content:
              "AI 暂未配置。请在 .env.local 填写 AI_BASE_URL / AI_API_KEY 后重启 pnpm dev。",
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

        const systemPrompt = buildSystemPrompt(chatCtx);
        const contextHint = ctxResult.context
          ? `\n\n【参考材料】\n${ctxResult.context}`
          : "";

        const convo: Record<string, unknown>[] = [
          { role: "system", content: systemPrompt + contextHint },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const endpoint = `${BASE.replace(/\/$/, "")}/chat/completions`;

        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const reqBody: Record<string, unknown> = {
            model: modelId,
            messages: convo,
            tools: toolDefs,
            tool_choice: "auto",
            stream: true,
            temperature: 0.6,
          };

          // 深度思考参数
          if (options.enableThinking) {
            reqBody.thinking = { type: "enabled", budget_tokens: 10000 };
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${KEY}`,
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
              const reasoning = delta[REASONING_FIELD] ?? delta.reasoning;
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
              send({ type: "tool", id: c.id, name: c.name, args: parsed, status: "call" });
              const result = await runTool(c.name, parsed, {
                chapterId: subjectId,
                sectionId: itemId,
              });
              send({ type: "tool", id: c.id, status: "result" });
              convo.push({ role: "tool", tool_call_id: c.id, content: result });
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
