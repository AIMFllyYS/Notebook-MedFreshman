import type { NextRequest } from "next/server";
import { TOOL_DEFS, runTool } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AI_BASE_URL || "";
const KEY = process.env.AI_API_KEY || "";
const MODEL_PRO = process.env.AI_MODEL_PRO || "v4-pro";
const MODEL_FLASH = process.env.AI_MODEL_FLASH || "v4-flash";
const REASONING_FIELD = process.env.AI_REASONING_FIELD || "reasoning_content";

const SYSTEM_PROMPT = `你是「概率论与数理统计」课程的 AI 学习助教，陪伴正在网页左侧阅读笔记的学生。

要求：
1. 用简体中文回答，语气亲切、循循善诱，但保持数学严谨。
2. 所有数学公式必须用 KaTeX 语法：行内用 $...$，独立公式用 $$...$$。绝不要用 \\( \\) 或纯文本写公式。
3. 善用 Markdown 结构（标题、列表、表格、加粗、引用）让回答清晰易读。
4. 你可以调用工具了解学生在看什么：
   - 当问题涉及"这一节/这页/当前/上面这段/这里"等指代时，调用 get_current_page 读取当前小节正文后再答；
   - 需要课程全貌或定位其他知识点时，调用 get_outline；
   - 需要某一具体小节正文时，调用 get_section；需要按关键词查找时，调用 search_notes。
5. 先建立直觉，再给严格表述与推导，必要时举例。回答要扎实、有深度，但不啰嗦。`;

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messages: ClientMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const model: string = body.model === "flash" ? "flash" : "pro";
  const chapterId: string = String(body.chapterId ?? "");
  const sectionId: string = String(body.sectionId ?? "");
  const modelId = model === "flash" ? MODEL_FLASH : MODEL_PRO;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));
      try {
        if (!BASE || !KEY || BASE.includes("your-endpoint")) {
          send({
            type: "content",
            delta:
              "⚙️ **AI 暂未配置**。请在项目根目录 `.env.local` 填写 `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL_PRO` / `AI_MODEL_FLASH`（自定义 OpenAI 兼容端点）后重启 `pnpm dev`。\n\n配置后我就能调用工具读取左侧当前页面与全书大纲来回答问题。框架其余部分（笔记、动画小窗、交互、划词）现在已可正常使用。",
          });
          send({ type: "done" });
          controller.close();
          return;
        }

        const convo: Record<string, unknown>[] = [
          {
            role: "system",
            content:
              SYSTEM_PROMPT +
              `\n\n【当前上下文】学生正在阅读小节 ${sectionId || "(未指定)"}（章 ${chapterId || "(未指定)"}）。`,
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const ctx = { chapterId, sectionId };
        const endpoint = `${BASE.replace(/\/$/, "")}/chat/completions`;

        for (let turn = 0; turn < 6; turn++) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${KEY}`,
            },
            body: JSON.stringify({
              model: modelId,
              messages: convo,
              tools: TOOL_DEFS,
              tool_choice: "auto",
              stream: true,
              temperature: 0.6,
            }),
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
              let json: any;
              try {
                json = JSON.parse(data);
              } catch {
                continue;
              }
              const choice = json.choices?.[0];
              if (!choice) continue;
              const delta = choice.delta || {};
              const reasoning = delta[REASONING_FIELD] ?? delta.reasoning;
              if (reasoning) send({ type: "reasoning", delta: reasoning });
              if (delta.content) {
                contentBuf += delta.content;
                send({ type: "content", delta: delta.content });
              }
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
              try {
                parsed = c.args ? JSON.parse(c.args) : {};
              } catch {
                parsed = {};
              }
              send({ type: "tool", id: c.id, name: c.name, args: parsed, status: "call" });
              const result = await runTool(c.name, parsed, ctx);
              send({ type: "tool", id: c.id, name: c.name, status: "result" });
              convo.push({ role: "tool", tool_call_id: c.id, content: result });
            }
            continue; // 带着工具结果再次请求模型
          }

          send({ type: "done" });
          controller.close();
          return;
        }

        send({ type: "done" });
        controller.close();
      } catch (err) {
        try {
          send({ type: "error", message: String((err as Error)?.message ?? err) });
          send({ type: "done" });
          controller.close();
        } catch {
          /* already closed */
        }
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
