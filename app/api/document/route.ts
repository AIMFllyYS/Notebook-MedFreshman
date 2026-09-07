import type { NextRequest } from "next/server";
import type { CustomProvider } from "@/lib/ai/provider";
import { resolveLanguageModel } from "@/lib/ai/sdk/languageModel";
import { streamDocument } from "@/lib/ai/document";
import { validateDocumentSpec } from "@/lib/ai/agent/documentTool";
import { getModelInfoWithCustom, type CustomApiGroup } from "@/lib/ai/models";
import type { DocumentApiRequest } from "@/lib/documents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<DocumentApiRequest>;
  const documentId = String(body.id ?? "");
  const modelId = typeof body.modelId === "string" ? body.modelId : undefined;
  const customApiGroups: CustomApiGroup[] = Array.isArray(body.customApiGroups)
    ? (body.customApiGroups as CustomApiGroup[])
    : [];
  const customProvider: CustomProvider | undefined =
    body.customProvider && typeof body.customProvider === "object" ? (body.customProvider as CustomProvider) : undefined;

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
        if (!documentId) {
          send({ type: "document", id: "", status: "error", message: "缺少 document id" });
          return;
        }
        if (!body.spec || typeof body.spec !== "object") {
          send({ type: "document", id: documentId, status: "error", message: "缺少文档参数 spec" });
          return;
        }
        const validated = validateDocumentSpec(body.spec);
        if (!validated.ok) {
          send({ type: "document", id: documentId, status: "error", message: validated.error });
          return;
        }
        const spec = validated.spec;

        const resolved = resolveLanguageModel(modelId, customApiGroups.length > 0 ? customApiGroups : customProvider);
        const { model, provider } = resolved;
        const info = getModelInfoWithCustom(provider.registryId, customApiGroups);
        if (info?.type === "image") {
          send({ type: "document", id: documentId, status: "error", message: "当前生图模型不支持长文档撰写，请切换文本模型后重试。" });
          return;
        }
        if (!provider.configured) {
          send({ type: "document", id: documentId, status: "error", message: "AI 暂未配置，请先配置 AI_BASE_URL / AI_API_KEY 或自定义模型。" });
          return;
        }

        const request: DocumentApiRequest = {
          id: documentId,
          spec,
          modelId,
          customApiGroups,
          customProvider,
          phase: body.phase ?? "outline",
          ...(body.phase === "section"
            ? {
                outline: Array.isArray(body.outline) ? body.outline : [],
                sectionIndex: typeof body.sectionIndex === "number" ? body.sectionIndex : 0,
                previousMarkdown: typeof body.previousMarkdown === "string" ? body.previousMarkdown : "",
              }
            : {}),
        } as DocumentApiRequest;

        const timeoutMs = info?.thinkingRequired ? Math.max(provider.timeoutMs, 120_000) : provider.timeoutMs;

        await streamDocument({
          send,
          id: documentId,
          request,
          model,
          signal,
          timeoutMs,
        });
      } catch (err) {
        send({
          type: "document",
          id: documentId,
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
