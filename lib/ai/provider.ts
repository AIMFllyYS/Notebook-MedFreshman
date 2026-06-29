// AI Provider 解析层：集中决定 base / key / 上游 apiModelId。
// 注册 id（registryId）与上游 apiModelId 分离；endpoints 链由 models.ts 声明。
// 仅服务端导入（读取 process.env）。

import {
  getModelInfo,
  getFetchTimeoutMs,
  hasNextEndpoint,
  normalizeRegistryId,
  CUSTOM_PREFIX,
  findCustomModelGroup,
  type ProviderKind,
  type CustomApiGroup,
} from "@/lib/ai/models";
import { DEFAULT_CHAT_TIMEOUT_MS } from "@/lib/ai/upstream";

const BASE = process.env.AI_BASE_URL || "";
const KEY = process.env.AI_API_KEY || "";
const REASONING_FIELD = process.env.AI_REASONING_FIELD || "reasoning_content";

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
  isCustom: boolean;
  configured: boolean;
  /** 当前使用的 endpoints 链索引 */
  endpointIndex: number;
  timeoutMs: number;
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
        ? modelId
        : CUSTOM_PREFIX + found.model.id;
      return {
        registryId,
        apiModelId: found.model.id,
        baseUrl: found.group.baseUrl.trim(),
        apiKey: found.group.apiKey.trim(),
        reasoningField: REASONING_FIELD,
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
  apiModelId: string;
  configured: boolean;
  isCustom: boolean;
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
  // 1. 优先使用默认生图模型（可能是自定义的或内置的）
  const effectiveModelId = defaultImageModelId || modelId;

  // 2. 如果是自定义模型，在分组中查找
  if (effectiveModelId.startsWith(CUSTOM_PREFIX) && customGroups && customGroups.length > 0) {
    const found = findCustomModelGroup(customGroups, effectiveModelId);
    if (found && found.group.baseUrl?.trim() && found.group.apiKey?.trim()) {
      return {
        baseUrl: found.group.baseUrl.trim(),
        apiKey: found.group.apiKey.trim(),
        apiModelId: found.model.id,
        configured: true,
        isCustom: true,
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
      configured: cred.configured,
      isCustom: false,
    };
  }

  // 4. 回退：使用硅基流动默认凭证 + Z-Image-Turbo
  const cred = credentialsFor("siliconflow");
  return {
    baseUrl: cred.baseUrl,
    apiKey: cred.apiKey,
    apiModelId: "Tongyi-MAI/Z-Image-Turbo",
    configured: cred.configured,
    isCustom: false,
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
