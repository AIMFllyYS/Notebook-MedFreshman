// 独立 SSE 端点：前端在主对话流结束后，对每个 artifactId 发起
// GET /api/artifact-stream?id=xxx 建立连接，接收子智能体的流式输出。
//
// 流程：
// 1. 从 artifactRegistry 读取会话状态
// 2. 先回放已有 chunks（解决"主对话先结束、前端后连接"的追赶问题）
// 3. 如果已完成/出错，直接发 done/error 后关闭
// 4. 如果还在进行中，subscribe emitter 持续推送新 delta
import { NextRequest } from "next/server";
import { get } from "@/lib/ai/artifactRegistry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = get(id);
  if (!session) {
    return new Response(
      sse({ type: "artifact", id, status: "error", message: "产物会话不存在或已过期" }),
      { headers: { "Content-Type": "text/event-stream" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (o: unknown) => {
        try {
          controller.enqueue(encoder.encode(sse(o)));
        } catch {
          // controller 可能已关闭
        }
      };

      // 1. 发送 start 事件
      send({ type: "artifact", id, status: "start", title: session.title });

      // 2. 回放已有 chunks
      for (const chunk of session.chunks) {
        send({ type: "artifact", id, status: "delta", delta: chunk });
      }

      // 3. 如果已经完成或出错，直接结束
      if (session.done) {
        if (session.error) {
          send({ type: "artifact", id, status: "error", message: session.error });
        } else if (session.html !== undefined) {
          send({ type: "artifact", id, status: "done", html: session.html });
        }
        controller.close();
        return;
      }

      // 4. 还在进行中：subscribe emitter 持续推送
      const onDelta = (delta: string) => {
        send({ type: "artifact", id, status: "delta", delta });
      };
      const onDone = (html: string) => {
        send({ type: "artifact", id, status: "done", html });
        cleanup();
        controller.close();
      };
      const onError = (message: string) => {
        send({ type: "artifact", id, status: "error", message });
        cleanup();
        controller.close();
      };

      const cleanup = () => {
        session.emitter.off("delta", onDelta);
        session.emitter.off("done", onDone);
        session.emitter.off("error", onError);
      };

      session.emitter.on("delta", onDelta);
      session.emitter.on("done", onDone);
      session.emitter.on("error", onError);

      // 客户端断开时清理
      req.signal.addEventListener("abort", () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });
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
