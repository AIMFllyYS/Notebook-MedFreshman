import type { NextRequest } from "next/server";
import {
  resolveImageProvider,
  imagesGenerationsUrl,
} from "@/lib/ai/provider";
import type { CustomApiGroup } from "@/lib/ai/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const modelId = typeof body.modelId === "string" ? body.modelId : "";
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const size = typeof body.size === "string" ? body.size : "1024x1024";
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 4);
  const customGroups: CustomApiGroup[] = Array.isArray(body.customApiGroups)
    ? body.customApiGroups
    : [];
  const defaultImageModelId =
    typeof body.defaultImageModelId === "string" ? body.defaultImageModelId : null;

  if (!prompt.trim()) {
    return Response.json({ error: "缺少生图提示词" }, { status: 400 });
  }

  const provider = resolveImageProvider(modelId, customGroups, defaultImageModelId);

  if (!provider.configured) {
    return Response.json(
      { error: "生图 API 未配置，请在 .env.local 填写 AI_BASE_URL / AI_API_KEY，或在设置中添加自定义生图模型。" },
      { status: 500 },
    );
  }

  const endpoint = imagesGenerationsUrl(provider.baseUrl);

  const abortCtrl = new AbortController();
  const timeoutId = setTimeout(() => abortCtrl.abort(), 120_000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.apiModelId,
        prompt: prompt.trim(),
        image_size: size,
        batch_size: count,
      }),
      signal: abortCtrl.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return Response.json(
        { error: `生图 API 返回 ${res.status}：${errText.slice(0, 300)}` },
        { status: res.status },
      );
    }

    const data = await res.json().catch(() => null);
    if (!data || !Array.isArray(data.images)) {
      return Response.json({ error: "生图 API 返回格式异常" }, { status: 500 });
    }

    return Response.json({
      images: data.images as { url: string }[],
      seed: data.seed,
      model: provider.apiModelId,
      isCustom: provider.isCustom,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return Response.json(
      { error: isAbort ? "生图超时，请重试" : String((err as Error)?.message ?? err) },
      { status: 500 },
    );
  }
}
