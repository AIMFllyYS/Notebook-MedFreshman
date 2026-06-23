import type { NextRequest } from "next/server";
import { resolveProvider, type CustomProvider } from "@/lib/ai/provider";
import { streamInteractiveArtifact } from "@/lib/ai/artifact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const artifactId = String(body.id ?? "");
  const title = String(body.title ?? "交互演示");
  const prompt = String(body.prompt ?? "");
  const modelId = typeof body.modelId === "string" ? body.modelId : undefined;
  const customProvider: CustomProvider | undefined =
    body.customProvider && typeof body.customProvider === "object" ? body.customProvider : undefined;
  const provider = resolveProvider(modelId, customProvider);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));
      const pingTimer = setInterval(() => {
        send({ type: "ping", t: Date.now() });
      }, 15000);

      try {
        if (!artifactId) {
          send({ type: "artifact", id: "", status: "error", message: "缺少 artifact id" });
          return;
        }
        if (!provider.configured) {
          send({
            type: "artifact",
            id: artifactId,
            status: "error",
            message: "AI 暂未配置，请先配置 AI_BASE_URL / AI_API_KEY 或自定义模型。",
          });
          return;
        }

        await streamInteractiveArtifact({
          send,
          artifactId,
          args: { title, prompt },
          provider,
          signal: req.signal,
        });
      } catch (err) {
        send({
          type: "artifact",
          id: artifactId,
          status: "error",
          message: String((err as Error)?.message ?? err),
        });
      } finally {
        clearInterval(pingTimer);
        controller.close();
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
