// AI Provider 解析层：集中决定 base / key / 上游 apiModelId。
// 注册 id（registryId）与上游 apiModelId 分离；endpoints 链由 models.ts 声明。
// 仅服务端导入（读取 process.env）。

import {
  getModelInfo,
  getFetchTimeoutMs,
  hasNextEndpoint,
  normalizeRegistryId,
  CUSTOM_PREFIX,
  buildCustomModelRegistryId,
  findCustomModelGroup,
  type ProviderKind,
  type CustomApiGroup,
  type CustomApiProtocol,
} from "@/lib/ai/models";
import { DEFAULT_CHAT_TIMEOUT_MS } from "@/lib/ai/upstream";

const BASE = process.env.AI_BASE_URL || "";
const KEY = process.env.AI_API_KEY || "";
const REASONING_FIELD = process.env.AI_REASONING_FIELD || "reasoning_content";

export type ThinkingRequestStyle =
  | "none"
  | "siliconflow"
  | "openai-reasoning-effort"
  | "openrouter-reasoning"
  | "anthropic-thinking";
export type ImageApiStyle = "auto" | "openai" | "siliconflow";

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

const MIMO_BASE = process.env.MIMO_BASE_URL || "https://api.xiaomimimo.com/v1";
const MIMO_KEY = process.env.MIMO_API_KEY || "";

const ZHIPU_BASE = process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const ZHIPU_KEY = process.env.ZHIPU_API_KEY || "";

export const ENV_MODEL_PRO = process.env.AI_MODEL_PRO || "deepseek-ai/DeepSeek-V4-Pro";
export const ENV_MODEL_FLASH = process.env.AI_MODEL_FLASH || "deepseek-ai/DeepSeek-V4-Flash";

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

export function buildThinkingRequestParams(
  style: ThinkingRequestStyle,
  effort: string | undefined,
): Record<string, unknown> {
  if (style === "none") return {};
  if (style === "openai-reasoning-effort") {
    return { reasoning_effort: effort === "low" || effort === "medium" ? effort : "high" };
  }
  // OpenRouter 统一推理参数：{ reasoning: { effort } }，用于转发 Claude/Gemini 等模型的中转网关。
  if (style === "openrouter-reasoning") {
    return { reasoning: { effort: effort === "low" || effort === "medium" ? effort : "high" } };
  }
  // 部分"OpenAI 兼容"中转网关只是把 Anthropic Messages API 的请求体原样透传，
  // 此时仍需按 Anthropic 原生 extended thinking 格式下发 { thinking: { type, budget_tokens } }。
  if (style === "anthropic-thinking") {
    return { thinking: { type: "enabled", budget_tokens: thinkingBudget(effort) } };
  }
  return {
    enable_thinking: true,
    thinking_budget: thinkingBudget(effort),
  };
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
    case "mimo":
      return { baseUrl: MIMO_BASE, apiKey: MIMO_KEY, configured: !!(MIMO_BASE && MIMO_KEY) };
    case "zhipu":
      return { baseUrl: ZHIPU_BASE, apiKey: ZHIPU_KEY, configured: !!(ZHIPU_BASE && ZHIPU_KEY) };
    default:
      return {
        baseUrl: BASE,
        apiKey: KEY,
        configured: !!(BASE && KEY && !BASE.includes("your-endpoint")),
      };
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
  const apiModelId = endpoint?.apiModelId ?? effectiveId;

  return {
    registryId: effectiveId,
    apiModelId,
    baseUrl: cred.baseUrl,
    apiKey: cred.apiKey,
    reasoningField: REASONING_FIELD,
    thinkingRequestStyle: "siliconflow",
    apiProtocol: "openai",
    isCustom: false,
    configured: cred.configured,
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
        baseUrl: found.group.baseUrl.trim(),
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
        timeoutMs: DEFAULT_CHAT_TIMEOUT_MS,
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
      baseUrl: customProvider.baseUrl.trim(),
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
        baseUrl: found.group.baseUrl.trim(),
        apiKey: found.group.apiKey.trim(),
        apiModelId: found.model.id,
        registryId: effectiveModelId,
        configured: true,
        isCustom: true,
        imageApiStyle: normalizeImageApiStyle(found.model.imageApiStyle),
      };
    }
  }

  // 3. 内置生图模型 → 使用硅基流动凭证
  const info = getModelInfo(effectiveModelId);
  if (info && info.type === "image") {
    const cred = credentialsFor(info.endpoints[0]?.provider ?? "siliconflow");
    return {
      baseUrl: cred.baseUrl,
      apiKey: cred.apiKey,
      apiModelId: info.endpoints[0]?.apiModelId ?? effectiveModelId,
      registryId: effectiveModelId,
      configured: cred.configured,
      isCustom: false,
      imageApiStyle: "siliconflow",
    };
  }

  // 4. 回退：使用硅基流动默认凭证 + Z-Image-Turbo
  const cred = credentialsFor("siliconflow");
  return {
    baseUrl: cred.baseUrl,
    apiKey: cred.apiKey,
    apiModelId: "Tongyi-MAI/Z-Image-Turbo",
    registryId: "Tongyi-MAI/Z-Image-Turbo",
    configured: cred.configured,
    isCustom: false,
    imageApiStyle: "siliconflow",
  };
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
