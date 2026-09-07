import type { NextRequest } from "next/server";
import type { CustomProvider } from "@/lib/ai/provider";
import { resolveLanguageModel } from "@/lib/ai/sdk/languageModel";
import { streamInteractiveArtifact } from "@/lib/ai/artifact";
import { getModelInfoWithCustom, type CustomApiGroup } from "@/lib/ai/models";

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
  const customApiGroups: CustomApiGroup[] = Array.isArray(body.customApiGroups)
    ? body.customApiGroups
    : [];
  const customProvider: CustomProvider | undefined =
    body.customProvider && typeof body.customProvider === "object" ? body.customProvider : undefined;
  const resolved = resolveLanguageModel(modelId, customApiGroups.length > 0 ? customApiGroups : customProvider);
  const { model, provider } = resolved;
  const info = getModelInfoWithCustom(provider.registryId, customApiGroups);
  // 思考不可关的模型不带 reasoning_effort 会空转或拒请；其余模型保持 thinking off 以便尽快出 HTML。
  const thinking = info?.thinkingRequired ? resolved.thinkingSettings("low") : undefined;
  const timeoutMs = info?.thinkingRequired ? Math.max(provider.timeoutMs, 90_000) : provider.timeoutMs;

  const encoder = new TextEncoder();
  const abortController = new AbortController();
  const signal = AbortSignal.any([req.signal, abortController.signal]);
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => {
        if (!cancelled) controller.enqueue(encoder.encode(sse(o)));
      };
      const pingTimer = setInterval(() => {
        send({ type: "ping", t: Date.now() });
      }, 15000);

      try {
        if (!artifactId) {
          send({ type: "artifact", id: "", status: "error", message: "缺少 artifact id" });
          return;
        }
        if (modelId && getModelInfoWithCustom(modelId, customApiGroups)?.type === "image") {
          send({
            type: "artifact",
            id: artifactId,
            status: "error",
            message: "当前生图模型不支持 HTML 交互组件生成，请切换文本模型后重试。",
          });
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
          model,
          signal,
          timeoutMs,
          thinking,
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
        if (!cancelled) controller.close();
      }
    },
    cancel(reason) {
      cancelled = true;
      abortController.abort(reason);
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
