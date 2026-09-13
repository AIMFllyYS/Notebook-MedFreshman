// AI Provider 解析层：集中决定 base / key / 上游 apiModelId。
// 注册 id（registryId）与上游 apiModelId 分离；endpoints 链由 models.ts 声明。
// 仅服务端导入（读取 process.env）。

import {
  getModelInfo,
  getLandedModelInfo,
  getFetchTimeoutMs,
  hasNextEndpoint,
  normalizeRegistryId,
  CUSTOM_PREFIX,
  CUSTOM_OPENAI_MODEL_ID,
  buildCustomModelRegistryId,
  findCustomModelGroup,
  type ProviderKind,
  type CustomApiGroup,
  type CustomApiProtocol,
  type ThinkingRequestStyle,
} from "@/lib/ai/models";
import { DEFAULT_CHAT_TIMEOUT_MS } from "@/lib/ai/upstream";
import { assertSafeCustomBaseUrl } from "@/lib/ai/customBaseUrl";
import { normalizeOpenAIBaseUrl } from "@/lib/ai/openaiBaseUrl";
import {
  overlayOptional,
  resolveCapabilityEndpoint,
  type CapabilityEndpoints,
  type ImageApiStyle as CapabilityImageApiStyle,
} from "@/lib/ai/capabilityEndpoints";

// 本模块在加载时读一次 env（BASE / KEY / MIMO_* / RELAY_* / ENV_MODEL_*）。改 env 必须重启进程。
// 对比：app/api/chat-title/route.ts 的 titleProvider() 每次请求读 env。两套语义不要混改。
// AI_BASE_URL 不再参与本模块的 base 解析：它曾是生图端点的兜底，而那正是
// 「配了中转站 → 生图 404」的来源。向量 / 重排仍在 embedding.ts 里各自读它。
const KEY = process.env.AI_API_KEY || "";
/** 生图端点的真实默认值。见 credentialsFor("siliconflow")：不拿 AI_BASE_URL 当兜底。 */
const SILICONFLOW_DEFAULT_BASE = "https://api.siliconflow.cn/v1";
const REASONING_FIELD = process.env.AI_REASONING_FIELD || "reasoning_content";

export type { ThinkingRequestStyle };
export type ImageApiStyle = CapabilityImageApiStyle;
export { normalizeOpenAIBaseUrl };

/**
 * 三选一协议 → 底层 style/reasoningField 自动装配。
 * 这是"业界最佳实践"的核心表：用户只在 UI 挑一个，其余自动。
 */
export function autoConfigFromProtocol(protocol: CustomApiProtocol | undefined): {
  thinkingRequestStyle: ThinkingRequestStyle;
  reasoningField: string;
} {
  switch (protocol) {
    case "anthropic":
      return { thinkingRequestStyle: "anthropic-thinking", reasoningField: "thinking" };
    case "siliconflow":
      return { thinkingRequestStyle: "siliconflow", reasoningField: "reasoning_content" };
    case "openai":
    default:
      // OpenAI 官方 o1/o3、DeepSeek-R1、One-API/OpenRouter 转发普遍返回 "reasoning" 或 "reasoning_content"。
      // 用 REASONING_FIELD 作为兜底（其内部会尝试多个别名）。
      return { thinkingRequestStyle: "openai-reasoning-effort", reasoningField: "reasoning" };
  }
}

const MIMO_BASE = process.env.MIMO_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1";
const MIMO_KEY = process.env.MIMO_API_KEY || "";

const ZHIPU_BASE = process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const ZHIPU_KEY = process.env.ZHIPU_API_KEY || "";

// 桌面端会显式注入 RELAY_BASE_URL（可能为空字符串）。空字符串必须视为「未配置」，
// 不能回落到项目中转站，否则用户无法使用自己的网关。
const RELAY_BASE = normalizeOpenAIBaseUrl(
  "RELAY_BASE_URL" in process.env ? process.env.RELAY_BASE_URL || "" : "https://relay.protocom.org/v1",
);
const RELAY_KEY = process.env.RELAY_API_KEY || "";
const RELAY_MODEL_ID = (process.env.RELAY_MODEL_ID || "").trim();

export const ENV_MODEL_PRO = process.env.AI_MODEL_PRO || "gpt-5.6-sol";
export const ENV_MODEL_FLASH = process.env.AI_MODEL_FLASH || "z-ai/glm-5.3-flash";

export interface CustomProvider {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

export interface ResolvedProvider {
  /** 注册 id（菜单/设置），用于 getModelInfo、计费展示 */
  registryId: string;
  /** 发给上游 chat/completions 的 model 字段 */
  apiModelId: string;
  baseUrl: string;
  apiKey: string;
  reasoningField: string;
  thinkingRequestStyle: ThinkingRequestStyle;
  /** 三选一协议：决定请求路径与消息体格式；内置模型固定为 openai。 */
  apiProtocol: CustomApiProtocol;
  isCustom: boolean;
  configured: boolean;
  /** 当前使用的 endpoints 链索引 */
  endpointIndex: number;
  timeoutMs: number;
}

const THINKING_REQUEST_STYLES: ThinkingRequestStyle[] = [
  "none",
  "siliconflow",
  "openai-reasoning-effort",
  "openrouter-reasoning",
  "anthropic-thinking",
  "gemini-thinking-level",
  "deepseek-thinking",
  "mimo-thinking",
];

function normalizeThinkingRequestStyle(value: unknown, fallback: ThinkingRequestStyle): ThinkingRequestStyle {
  return THINKING_REQUEST_STYLES.includes(value as ThinkingRequestStyle)
    ? (value as ThinkingRequestStyle)
    : fallback;
}

/** 老配置向新协议字段的迁移推断：thinkingRequestStyle → apiProtocol。 */
function inferProtocolFromLegacy(style: unknown): CustomApiProtocol {
  if (style === "anthropic-thinking") return "anthropic";
  if (style === "siliconflow") return "siliconflow";
  return "openai";
}

function normalizeImageApiStyle(value: unknown): ImageApiStyle {
  return value === "openai" || value === "siliconflow" || value === "auto" ? value : "auto";
}

function applyUserImageEndpoint(
  platform: ResolvedImageProvider,
  capability?: CapabilityEndpoints | null,
): ResolvedImageProvider {
  if (!capability) return platform;
  const resolved = resolveCapabilityEndpoint({
    userBaseUrl: capability.imageBaseUrl,
    userApiKey: capability.imageApiKey,
    platformBaseUrl: platform.baseUrl,
    platformApiKey: platform.apiKey,
  });
  let baseUrl = resolved.baseUrl;
  if (resolved.customBaseUrl) {
    baseUrl = normalizeOpenAIBaseUrl(assertSafeCustomBaseUrl(baseUrl));
  }
  const apiModelId = overlayOptional(capability.imageModelId, platform.apiModelId);
  const imageApiStyle = capability.imageApiStyle !== "auto"
    ? capability.imageApiStyle
    : platform.imageApiStyle;
  return {
    ...platform,
    baseUrl,
    apiKey: resolved.apiKey,
    apiModelId,
    configured: !!(baseUrl && resolved.apiKey && !baseUrl.includes("your-endpoint")),
    isCustom: platform.isCustom || !resolved.usedPlatformCredentials,
    imageApiStyle,
  };
}

// 部分中转网关（尤其把 Claude extended thinking 转成 OpenAI 格式的代理）不会把 reasoning
// 增量发成纯字符串，而是 { type: "thinking", thinking: "..." } 这类结构化对象，甚至是
// block 数组。只按字符串判断会把这些内容静默丢弃，导致思考面板对这类自定义 API "看起来没生效"。
function extractReasoningText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractReasoningText).join("");
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.thinking === "string") return obj.thinking;
    if (typeof obj.content === "string") return obj.content;
    if (Array.isArray(obj.content)) return extractReasoningText(obj.content);
  }
  return "";
}

export function extractReasoningDelta(
  delta: Record<string, unknown>,
  preferredField = REASONING_FIELD,
): string | undefined {
  const fields = [preferredField, "reasoning_content", "reasoning", "reasoning_text", "thinking"]
    .filter((field, index, arr) => field && arr.indexOf(field) === index);

  for (const field of fields) {
    const text = extractReasoningText(delta[field]);
    if (text) return text;
  }

  const text = extractReasoningText(delta.reasoning_details);
  return text || undefined;
}

function safeNormalizedCustomBaseUrl(url: string): string {
  return normalizeOpenAIBaseUrl(assertSafeCustomBaseUrl(url));
}

function customTimeoutMs(modelTimeout?: number, groupTimeout?: number): number {
  for (const raw of [modelTimeout, groupTimeout]) {
    if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  }
  return DEFAULT_CHAT_TIMEOUT_MS;
}

export function detectImageApiStyle(
  apiModelId: string,
  configuredStyle: ImageApiStyle = "auto",
): "openai" | "siliconflow" {
  if (configuredStyle === "openai" || configuredStyle === "siliconflow") return configuredStyle;
  return /^(gpt-image|dall-e)/i.test(apiModelId) ? "openai" : "siliconflow";
}

interface ProviderCredentials {
  baseUrl: string;
  apiKey: string;
  configured: boolean;
}

function credentialsFor(provider: ProviderKind): ProviderCredentials {
  switch (provider) {
    case "mimo": {
      const baseUrl = normalizeOpenAIBaseUrl(MIMO_BASE);
      return { baseUrl, apiKey: MIMO_KEY, configured: !!(baseUrl && MIMO_KEY) };
    }
    case "zhipu": {
      const baseUrl = normalizeOpenAIBaseUrl(ZHIPU_BASE);
      return { baseUrl, apiKey: ZHIPU_KEY, configured: !!(baseUrl && ZHIPU_KEY) };
    }
    case "relay": {
      const baseUrl = normalizeOpenAIBaseUrl(RELAY_BASE);
      return { baseUrl, apiKey: RELAY_KEY, configured: !!(baseUrl && RELAY_KEY) };
    }
    case "siliconflow": {
      // base 不回落 AI_BASE_URL：那个变量常被指向中转站，而中转站不提供
      // Tongyi-MAI/Z-Image-Turbo，回落只会换来一个静默 404。key 仍可回落
      // AI_API_KEY——历史 .env.example 把硅基流动的 key 写在那里，且用错 key 会
      // 拿到明确的 401 而不是静默失败。
      const rawBase = process.env.SILICONFLOW_BASE_URL || SILICONFLOW_DEFAULT_BASE;
      const apiKey = process.env.SILICONFLOW_API_KEY || KEY;
      const baseUrl = normalizeOpenAIBaseUrl(rawBase);
      return {
        baseUrl,
        apiKey,
        configured: !!(baseUrl && apiKey && !baseUrl.includes("your-endpoint")),
      };
    }
  }
}

function resolveBuiltinEndpoint(
  registryId: string,
  endpointIndex: number,
): ResolvedProvider {
  const info = getModelInfo(registryId);
  const fallbackId = ENV_MODEL_FLASH;
  const effectiveId = info ? registryId : fallbackId;
  const effectiveInfo = info ?? getModelInfo(fallbackId);
  const endpoints = effectiveInfo?.endpoints ?? [];
  const idx = endpoints.length > 0 ? Math.min(endpointIndex, endpoints.length - 1) : 0;
  const endpoint = endpoints[idx];
  const cred = endpoint ? credentialsFor(endpoint.provider) : credentialsFor("siliconflow");
  const isCustomOpenai = effectiveId === CUSTOM_OPENAI_MODEL_ID;
  const apiModelId = isCustomOpenai
    ? (RELAY_MODEL_ID || endpoint?.apiModelId || effectiveId)
    : (endpoint?.apiModelId ?? effectiveId);
  // custom-openai 的 apiModelId 是用户填的 RELAY_MODEL_ID，可能撞上内置 id；
  // 思考方言仍跟注册条目，与 hop 0 历史行为一致。其余 hop 按落地 apiModelId 取。
  const landedInfo = getLandedModelInfo(isCustomOpenai ? effectiveId : apiModelId, effectiveId)
    ?? effectiveInfo;

  return {
    registryId: effectiveId,
    apiModelId,
    baseUrl: cred.baseUrl,
    apiKey: cred.apiKey,
    reasoningField: REASONING_FIELD,
    thinkingRequestStyle: landedInfo?.thinkingRequestStyle ?? "siliconflow",
    apiProtocol: "openai",
    isCustom: false,
    configured: isCustomOpenai ? cred.configured && !!RELAY_MODEL_ID : cred.configured,
    endpointIndex: idx,
    timeoutMs: getFetchTimeoutMs(effectiveId),
  };
}

export function resolveProvider(
  modelId: string | undefined,
  custom?: CustomProvider | CustomApiGroup[] | null,
  endpointIndex = 0,
): ResolvedProvider {
  const isCustomModel =
    modelId === "custom" || (modelId?.startsWith(CUSTOM_PREFIX) ?? false);

  // 新版：custom 为 CustomApiGroup[] 时，在分组中查找模型
  if (isCustomModel && Array.isArray(custom) && custom.length > 0) {
    const found = findCustomModelGroup(custom, modelId ?? "");
    if (found && found.group.baseUrl?.trim() && found.group.apiKey?.trim()) {
      const registryId = modelId?.startsWith(CUSTOM_PREFIX)
        ? buildCustomModelRegistryId(found.group.id, found.model.id)
        : CUSTOM_PREFIX + found.model.id;
      // 三选一协议：优先取用户显式选择，否则从旧字段推断（向后兼容）。
      const apiProtocol: CustomApiProtocol = found.model.apiProtocol
        ?? inferProtocolFromLegacy(found.model.thinkingRequestStyle);
      const auto = autoConfigFromProtocol(apiProtocol);
      return {
        registryId,
        apiModelId: found.model.id,
        baseUrl: safeNormalizedCustomBaseUrl(found.group.baseUrl),
        apiKey: found.group.apiKey.trim(),
        // 用户显式填的 override 优先；否则用协议默认。
        reasoningField: found.model.reasoningField?.trim() || auto.reasoningField,
        thinkingRequestStyle: normalizeThinkingRequestStyle(
          found.model.thinkingRequestStyle,
          found.model.thinking ? auto.thinkingRequestStyle : "none",
        ),
        apiProtocol,
        isCustom: true,
        configured: true,
        endpointIndex: 0,
        timeoutMs: customTimeoutMs(found.model.timeoutMs, found.group.timeoutMs),
      };
    }
  }

  // 旧版兼容：custom 为 CustomProvider 对象
  const customProvider =
    custom && !Array.isArray(custom) && (custom as CustomProvider).baseUrl
      ? (custom as CustomProvider)
      : undefined;
  const customModelName = modelId?.startsWith(CUSTOM_PREFIX)
    ? modelId.slice(CUSTOM_PREFIX.length)
    : customProvider?.model;

  if (
    isCustomModel &&
    customProvider?.baseUrl?.trim() &&
    customProvider?.apiKey?.trim() &&
    customModelName?.trim()
  ) {
    const registryId = modelId?.startsWith(CUSTOM_PREFIX)
      ? modelId
      : CUSTOM_PREFIX + customModelName.trim();
    return {
      registryId,
      apiModelId: customModelName.trim(),
      baseUrl: safeNormalizedCustomBaseUrl(customProvider.baseUrl),
      apiKey: customProvider.apiKey.trim(),
      reasoningField: REASONING_FIELD,
      thinkingRequestStyle: "siliconflow",
      apiProtocol: "openai",
      isCustom: true,
      configured: true,
      endpointIndex: 0,
      timeoutMs: DEFAULT_CHAT_TIMEOUT_MS,
    };
  }

  const registryId = normalizeRegistryId(
    modelId && modelId !== "custom" && !(modelId?.startsWith(CUSTOM_PREFIX) ?? false)
      ? modelId
      : ENV_MODEL_FLASH,
  );

  return resolveBuiltinEndpoint(registryId, endpointIndex);
}

/** 切换到 endpoints 链中的下一端点；无备用或凭证未配置时返回 null。 */
export function resolveNextProvider(
  registryId: string,
  currentEndpointIndex: number,
  custom?: CustomProvider | CustomApiGroup[] | null,
): ResolvedProvider | null {
  if (!hasNextEndpoint(registryId, currentEndpointIndex)) return null;
  const next = resolveProvider(registryId, custom, currentEndpointIndex + 1);
  if (!next.configured) return null;
  return next;
}

/** base 末尾去斜杠后拼出 /chat/completions。 */
export function chatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

/** base 末尾去斜杠后拼出 /images/generations。 */
export function imagesGenerationsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/images/generations`;
}

/** 生图 provider 解析结果。 */
export interface ResolvedImageProvider {
  baseUrl: string;
  apiKey: string;
  /** 发给上游 /images/generations 的 model 字段。 */
  apiModelId: string;
  /** 注册 id（custom:xxx:yyy 或内置 id），用于计费展示与供应商归类。 */
  registryId: string;
  configured: boolean;
  isCustom: boolean;
  imageApiStyle: ImageApiStyle;
}

/**
 * 解析生图模型 provider。
 * 优先级：defaultImageModelId 指向的自定义生图模型 > 内置硅基流动生图模型。
 */
export function resolveImageProvider(
  modelId: string,
  customGroups?: CustomApiGroup[] | null,
  defaultImageModelId?: string | null,
  capability?: CapabilityEndpoints | null,
): ResolvedImageProvider {
  const selectedCustom = modelId.startsWith(CUSTOM_PREFIX) && customGroups?.length
    ? findCustomModelGroup(customGroups, modelId)
    : undefined;
  const selectedIsImage =
    selectedCustom?.model.type === "image" || getModelInfo(modelId)?.type === "image";

  // 用户明确选中生图模型时必须使用该模型；默认生图模型只在当前模型不是生图模型时兜底。
  const effectiveModelId = selectedIsImage ? modelId : (defaultImageModelId || modelId);

  // 2. 如果是自定义模型，在分组中查找
  if (effectiveModelId.startsWith(CUSTOM_PREFIX) && customGroups && customGroups.length > 0) {
    const found = findCustomModelGroup(customGroups, effectiveModelId);
    if (found && found.group.baseUrl?.trim() && found.group.apiKey?.trim()) {
      return {
        baseUrl: safeNormalizedCustomBaseUrl(found.group.baseUrl),
        apiKey: found.group.apiKey.trim(),
        apiModelId: found.model.id,
        registryId: effectiveModelId,
        configured: true,
        isCustom: true,
        imageApiStyle: normalizeImageApiStyle(found.model.imageApiStyle),
      };
    }
  }

  // 3. 内置生图模型 → 使用硅基流动凭证（设置里自配的生图端点可覆盖）
  const info = getModelInfo(effectiveModelId);
  if (info && info.type === "image") {
    const cred = credentialsFor(info.endpoints[0]?.provider ?? "siliconflow");
    return applyUserImageEndpoint({
      baseUrl: cred.baseUrl,
      apiKey: cred.apiKey,
      apiModelId: info.endpoints[0]?.apiModelId ?? effectiveModelId,
      registryId: effectiveModelId,
      configured: cred.configured,
      isCustom: false,
      imageApiStyle: "siliconflow",
    }, capability);
  }

  // 4. 回退：使用硅基流动默认凭证 + Z-Image-Turbo
  const cred = credentialsFor("siliconflow");
  return applyUserImageEndpoint({
    baseUrl: cred.baseUrl,
    apiKey: cred.apiKey,
    apiModelId: overlayOptional(capability?.imageModelId, "Tongyi-MAI/Z-Image-Turbo"),
    registryId: overlayOptional(capability?.imageModelId, "Tongyi-MAI/Z-Image-Turbo"),
    configured: cred.configured,
    isCustom: false,
    imageApiStyle: "siliconflow",
  }, capability);
}

/** 深度思考预算（token），按用户选择的力度映射。 */
export function thinkingBudget(effort: string | undefined): number {
  switch (effort) {
    case "low":
      return 2000;
    case "high":
      return 16000;
    case "max":
      return 32000;
    case "medium":
    default:
      return 8000;
  }
}
