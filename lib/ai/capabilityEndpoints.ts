/** 用户在设置里自配的能力端点。每一项空字符串 = 用平台默认。 */

export const IMAGE_API_STYLES = ["auto", "openai", "siliconflow"] as const;
export type ImageApiStyle = (typeof IMAGE_API_STYLES)[number];

export interface CapabilityEndpoints {
  imageBaseUrl: string;
  imageApiKey: string;
  imageModelId: string;
  imageApiStyle: ImageApiStyle;
  embeddingBaseUrl: string;
  embeddingApiKey: string;
  embeddingModelId: string;
  rerankBaseUrl: string;
  rerankApiKey: string;
  rerankModelId: string;
  webSearchApiKey: string;
  unsplashAccessKey: string;
}

export function trimEndpointField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeImageApiStyle(value: unknown): ImageApiStyle {
  return value === "openai" || value === "siliconflow" || value === "auto" ? value : "auto";
}

export function normalizeCapabilityEndpoints(raw: unknown): CapabilityEndpoints {
  const src = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
  return {
    imageBaseUrl: trimEndpointField(src.imageBaseUrl),
    imageApiKey: trimEndpointField(src.imageApiKey),
    imageModelId: trimEndpointField(src.imageModelId),
    imageApiStyle: normalizeImageApiStyle(src.imageApiStyle),
    embeddingBaseUrl: trimEndpointField(src.embeddingBaseUrl),
    embeddingApiKey: trimEndpointField(src.embeddingApiKey),
    embeddingModelId: trimEndpointField(src.embeddingModelId),
    rerankBaseUrl: trimEndpointField(src.rerankBaseUrl),
    rerankApiKey: trimEndpointField(src.rerankApiKey),
    rerankModelId: trimEndpointField(src.rerankModelId),
    webSearchApiKey: trimEndpointField(src.webSearchApiKey),
    unsplashAccessKey: trimEndpointField(src.unsplashAccessKey),
  };
}

export const EMPTY_CAPABILITY_ENDPOINTS: CapabilityEndpoints = normalizeCapabilityEndpoints({});

export function overlayOptional(userValue: string | undefined, platformValue: string): string {
  const user = trimEndpointField(userValue);
  return user || platformValue;
}

export function capabilitySecretValues(ep: CapabilityEndpoints | undefined | null): string[] {
  if (!ep) return [];
  return [
    ep.imageApiKey,
    ep.embeddingApiKey,
    ep.rerankApiKey,
    ep.webSearchApiKey,
    ep.unsplashAccessKey,
  ].filter((value) => !!value);
}

/**
 * 用户填了 apiKey 才视为自备凭证。
 * 只填 baseUrl 不填 key 时忽略该 URL，避免把平台 key 发到用户控制的主机。
 */
export function resolveCapabilityEndpoint(input: {
  userBaseUrl?: string;
  userApiKey?: string;
  platformBaseUrl: string;
  platformApiKey: string;
}): {
  baseUrl: string;
  apiKey: string;
  usedPlatformCredentials: boolean;
  customBaseUrl: boolean;
} {
  const userKey = trimEndpointField(input.userApiKey);
  const userBase = trimEndpointField(input.userBaseUrl);
  if (userKey) {
    return {
      baseUrl: userBase || input.platformBaseUrl,
      apiKey: userKey,
      usedPlatformCredentials: false,
      customBaseUrl: !!userBase,
    };
  }
  return {
    baseUrl: input.platformBaseUrl,
    apiKey: input.platformApiKey,
    usedPlatformCredentials: true,
    customBaseUrl: false,
  };
}

export function resolveCapabilitySecret(userValue: string | undefined, platformValue: string): {
  value: string;
  usedPlatformCredentials: boolean;
} {
  const user = trimEndpointField(userValue);
  if (user) return { value: user, usedPlatformCredentials: false };
  return { value: trimEndpointField(platformValue), usedPlatformCredentials: true };
}

/** 本次请求可能真正打到的 sidecar。只剥密钥，baseUrl / modelId / style 原样保留。 */
export type CapabilityNeed = "image" | "embedding" | "rerank" | "webSearch" | "imageSearch";

const NEED_TO_SECRET: Record<CapabilityNeed, keyof CapabilityEndpoints> = {
  image: "imageApiKey",
  embedding: "embeddingApiKey",
  rerank: "rerankApiKey",
  webSearch: "webSearchApiKey",
  imageSearch: "unsplashAccessKey",
};

/**
 * chat 侧判据（宁多勿少）：
 * - embedding / rerank：searchNotes 未禁用，或 contextMode=semantic（都会走 hybridSearch）
 * - webSearch / imageSearch：enableSearch 打开且该工具未禁用
 * - image：generateImage 只出批准卡，真正出图走 /api/image-gen，chat 不带生图密钥
 */
export function capabilityNeedsForChat(input: {
  enableSearch?: boolean;
  disabledTools?: readonly string[];
  contextMode?: "full" | "semantic";
}): CapabilityNeed[] {
  const disabled = new Set(input.disabledTools ?? []);
  const needs: CapabilityNeed[] = [];
  if (!disabled.has("searchNotes") || input.contextMode === "semantic") {
    needs.push("embedding", "rerank");
  }
  if (input.enableSearch && !disabled.has("webSearch")) needs.push("webSearch");
  if (input.enableSearch && !disabled.has("imageSearch")) needs.push("imageSearch");
  return needs;
}

export function capabilityNeedsForImageGen(): CapabilityNeed[] {
  return ["image"];
}

export function selectCapabilityEndpointsForRequest(
  raw: unknown,
  needs: readonly CapabilityNeed[],
): CapabilityEndpoints {
  const full = normalizeCapabilityEndpoints(raw);
  const allow = new Set(needs.map((need) => NEED_TO_SECRET[need]));
  return {
    ...full,
    imageApiKey: allow.has("imageApiKey") ? full.imageApiKey : "",
    embeddingApiKey: allow.has("embeddingApiKey") ? full.embeddingApiKey : "",
    rerankApiKey: allow.has("rerankApiKey") ? full.rerankApiKey : "",
    webSearchApiKey: allow.has("webSearchApiKey") ? full.webSearchApiKey : "",
    unsplashAccessKey: allow.has("unsplashAccessKey") ? full.unsplashAccessKey : "",
  };
}
