import type { NextRequest } from "next/server";
import {
  resolveImageProvider,
  imagesGenerationsUrl,
} from "@/lib/ai/provider";
import { parseUpstreamErrorBody } from "@/lib/ai/upstream";
import type { CustomApiGroup } from "@/lib/ai/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 根据 apiModelId 判断生图 API 风格。
 * - OpenAI 官方生图模型（gpt-image-*, dall-e-*）走 OpenAI Image API 标准：
 *   请求体用 size/n，响应为 { data: [{url|b64_json}] }，gpt-image-1 只返回 b64_json。
 * - 其他模型（如 SiliconFlow 的 Z-Image-Turbo）走 SiliconFlow 风格：
 *   请求体用 image_size/batch_size，响应为 { images: [{url}] }。
 */
function detectImageApiStyle(apiModelId: string): "openai" | "siliconflow" {
  if (/^(gpt-image|dall-e)/i.test(apiModelId)) return "openai";
  return "siliconflow";
}

/** 归一化后的图片项，兼容 OpenAI（url 或 b64_json）与 SiliconFlow（url）。 */
interface NormalizedImage {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

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
  const apiStyle = detectImageApiStyle(provider.apiModelId);

  // 构造请求体：OpenAI 风格用 size/n，SiliconFlow 风格用 image_size/batch_size。
  // gpt-image-1 不接受 response_format 字段（发送会 400），固定返回 b64_json；
  // dall-e-2/3 支持 response_format，统一请求 b64_json 避免 url 60 分钟过期。
  const requestBody: Record<string, unknown> = {
    model: provider.apiModelId,
    prompt: prompt.trim(),
  };

  if (apiStyle === "openai") {
    requestBody.n = count;
    requestBody.size = size;
    if (/^dall-e/i.test(provider.apiModelId)) {
      requestBody.response_format = "b64_json";
    }
    // gpt-image-1 默认返回 b64_json，无需 response_format
  } else {
    requestBody.image_size = size;
    requestBody.batch_size = count;
  }

  const abortCtrl = new AbortController();
  // gpt-image-1 高质量图片可能需要 2-3 分钟，延长到 180s
  const timeoutId = setTimeout(() => abortCtrl.abort(), 180_000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: abortCtrl.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      const parsed = parseUpstreamErrorBody(errText);
      const message = parsed.message || errText.slice(0, 300);
      return Response.json(
        { error: `生图 API 返回 ${res.status}：${message}` },
        { status: res.status },
      );
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      return Response.json({ error: "生图 API 返回格式异常" }, { status: 500 });
    }

    // 兼容 OpenAI (data.data) 与 SiliconFlow (data.images) 两种响应格式
    const rawImages: unknown[] = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.images)
        ? data.images
        : [];

    if (rawImages.length === 0) {
      return Response.json({ error: "生图 API 返回格式异常" }, { status: 500 });
    }

    // 归一化图片项：统一提取 url / b64_json / revised_prompt
    const images: NormalizedImage[] = rawImages
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const obj = item as Record<string, unknown>;
        const img: NormalizedImage = {};
        if (typeof obj.url === "string") img.url = obj.url;
        if (typeof obj.b64_json === "string") img.b64_json = obj.b64_json;
        if (typeof obj.revised_prompt === "string") img.revised_prompt = obj.revised_prompt;
        return img.url || img.b64_json ? img : null;
      })
      .filter((x): x is NormalizedImage => x !== null);

    if (images.length === 0) {
      return Response.json({ error: "生图 API 未返回可用图片" }, { status: 500 });
    }

    // usage（gpt-image-1 按 token 计费；dall-e 系列与 SiliconFlow 无此字段）
    let usage:
      | { input_tokens?: number; output_tokens?: number; total_tokens?: number }
      | undefined;
    if (data.usage && typeof data.usage === "object") {
      const u = data.usage as Record<string, unknown>;
      usage = {
        input_tokens: typeof u.input_tokens === "number" ? u.input_tokens : undefined,
        output_tokens: typeof u.output_tokens === "number" ? u.output_tokens : undefined,
        total_tokens: typeof u.total_tokens === "number" ? u.total_tokens : undefined,
      };
    }

    return Response.json({
      images,
      usage,
      seed: data.seed, // SiliconFlow 专用，OpenAI 无
      model: provider.apiModelId,
      registryId: provider.registryId,
      isCustom: provider.isCustom,
      apiStyle,
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
