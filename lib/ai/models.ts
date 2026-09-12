// 多提供商精选模型注册表 —— 供 AI 对话的模型选择菜单。
// 主力对话：自有中转（relay.protocom.org）；MiMo 走小米 Token Plan；
// 硅基流动仅保留生图；智谱仅保留向量/重排/联网搜索。
// model id（注册 id）与上游 apiModelId 分离；endpoints 链支持容灾降级。

export type ProviderKind = "siliconflow" | "mimo" | "zhipu" | "relay";

/** 对话输入可选的思考强度档位（UI 值）。各模型的实际上游取值见 thinkingEffortMap。 */
export type ThinkingEffort = "low" | "medium" | "high" | "max";

export const THINKING_EFFORT_VALUES: readonly ThinkingEffort[] = ["low", "medium", "high", "max"];

export const THINKING_EFFORT_LABELS: Record<ThinkingEffort, string> = {
  low: "低",
  medium: "中",
  high: "高",
  max: "最强",
};

/** 保留声明顺序，丢掉未知值。 */
export function normalizeThinkingLevels(levels: unknown): ThinkingEffort[] {
  if (!Array.isArray(levels)) return [];
  const allowed = new Set(levels);
  return THINKING_EFFORT_VALUES.filter((v) => allowed.has(v));
}

export type ThinkingRequestStyle =
  | "none"
  | "siliconflow"
  | "openai-reasoning-effort"
  | "openrouter-reasoning"
  | "anthropic-thinking"
  | "gemini-thinking-level"
  | "deepseek-thinking"
  | "mimo-thinking";

export interface ModelEndpoint {
  provider: ProviderKind;
  /** 发给 OpenAI 兼容 chat/completions 的精确 model 字符串 */
  apiModelId: string;
}

export interface ModelInfo {
  /** 注册 id：菜单、设置、持久化；不等于上游 apiModelId */
  id: string;
  label: string;
  /** 分组名（用于下拉菜单分区）。 */
  group: string;
  /** 是否支持思考链（reasoning_content）。 */
  thinking: boolean;
  /**
   * 可选手动选择的思考强度档位。空/缺省 = 不展示强度选择（仅 on/off 或不可关）。
   * 与 thinking 独立：有思考但不支持档位时不显示二级菜单。
   */
  thinkingLevels?: ThinkingEffort[];
  /** true 时思考不可关闭（如 GLM-5.3 / Gemini 3.7 Flash）。 */
  thinkingRequired?: boolean;
  /** UI 档位 → 上游 reasoning_effort / thinking_level 取值。 */
  thinkingEffortMap?: Partial<Record<ThinkingEffort, string>>;
  /** 选中该模型时的默认思考档位。 */
  defaultThinkingEffort?: ThinkingEffort;
  /** 内置模型的思考请求方言；缺省为 siliconflow。 */
  thinkingRequestStyle?: ThinkingRequestStyle;
  /** 是否支持 function calling（工具调用）。 */
  tools: boolean;
  /** 是否支持视觉（图片输入）。 */
  vision?: boolean;
  /** 上下文窗口（千 token），用于提示。 */
  contextK?: number;
  hint: string;
  /** 有序端点链：失败且可恢复时尝试下一项。 */
  endpoints: ModelEndpoint[];
  /** 品牌图标标识，用于模型下拉菜单显示官方 logo。 */
  icon?: string;
  /** 定价信息（¥ / 百万 token）。 */
  pricing?: {
    input: number;
    cachedInput: number;
    cacheWrite?: number;
    output: number;
  };
  /** Prefix cache 估算 TTL（秒）。 */
  cacheTtlSec?: number;
  /** chat/completions 请求超时（毫秒）；慢模型（MoE 冷启动）可加长。 */
  timeoutMs?: number;
  /** 模型类型：文本对话 or 生图。默认 'text'。 */
  type?: "text" | "image";
  /** 生图模型参数（仅 type='image' 时有效）。 */
  imageParams?: {
    /** 支持的图片尺寸预设。 */
    sizes?: string[];
    /** 最大生成数量。 */
    maxCount?: number;
  };
}

export const CUSTOM_MODEL_ID = "custom";

/** 桌面「自由中转」：用户自填 URL / API Key / 模型 ID，registry id 固定，上游 apiModelId 来自 env。 */
export const CUSTOM_OPENAI_MODEL_ID = "custom-openai";

/** 网页模型菜单 / 设置内置列表不展示桌面专用「自由中转」；resolveProvider 仍识别该 id。 */
export function isPickerHiddenModel(id: string): boolean {
  return id === CUSTOM_OPENAI_MODEL_ID;
}

export function modelsForPicker(models: ModelInfo[]): ModelInfo[] {
  return models.filter((m) => !isPickerHiddenModel(m.id));
}

/** 已下架注册 id → 当前注册 id（用户本地设置兼容） */
export const LEGACY_REGISTRY_ALIASES: Record<string, string> = {
  "MiniMaxAI/MiniMax-M3": "Qwen/Qwen3.8-Flash",
  "MiniMaxAI/MiniMax-M2.5": "Qwen/Qwen3.8-Flash",
  "Qwen/Qwen3.6-35B-A3B": "Qwen/Qwen3.8-Flash",
  "Qwen/Qwen3.6-27B": "Qwen/Qwen3.8-Flash",
  "moonshotai/Kimi-K2.7-Code": "Qwen/Qwen3.8-Flash",
  "Qwen/Qwen3.8-27B": "Qwen/Qwen3.8-Flash",
  "Pro/moonshotai/Kimi-K2.6": "kimi-k3",
  "google/gemini-3.7-flash": "google/gemini-3.8-flash",
  "deepseek-ai/DeepSeek-V4-Pro": "deepseek/deepseek-v4.1-flash",
  "deepseek-ai/DeepSeek-V4-Flash": "deepseek/deepseek-v4.1-flash",
  "deepseek/deepseek-v4-flash": "deepseek/deepseek-v4.1-flash",
  "mimo-v2.5-pro": "mimo-v2.5",
  "mimo-v2-flash": "mimo-v2.5",
  "zai-org/GLM-5.2": "z-ai/glm-5.3-flash",
  "Pro/zai-org/GLM-5.1": "z-ai/glm-5.3-flash",
  "zai-org/GLM-Z1-AirX": "z-ai/glm-5.3-flash",
  "zai-org/GLM-4.7-FlashX": "z-ai/glm-5.3-flash",
  "inclusionai/ling-3.0-flash-sante:free": "inclusionai/ling-3.0-flash-sante:free",
};

export function normalizeRegistryId(id: string): string {
  return LEGACY_REGISTRY_ALIASES[id] ?? id;
}

const SF = "siliconflow" as const;
const MIMO = "mimo" as const;
const RELAY = "relay" as const;

function ep(provider: ProviderKind, apiModelId: string): ModelEndpoint {
  return { provider, apiModelId };
}

function sf(id: string): ModelEndpoint[] {
  return [ep(SF, id)];
}

export const MODELS: ModelInfo[] = [
  // ── 自由中转（用户自填 OpenAI 兼容端点，不必使用项目默认中转站）──
  {
    id: CUSTOM_OPENAI_MODEL_ID,
    label: "自由中转",
    group: "自由中转",
    thinking: true,
    thinkingLevels: ["low", "medium", "high", "max"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    vision: true,
    contextK: 128,
    hint: "自定义 OpenAI 兼容端点 · 在桌面设置中填写 URL / 模型 ID / API Key",
    endpoints: [ep(RELAY, CUSTOM_OPENAI_MODEL_ID)],
  },
  // ── 快速模型 ──────────────────────────
  {
    id: "deepseek/deepseek-v4.1-flash",
    label: "DeepSeek V4.1 Flash",
    group: "快速模型",
    thinking: true,
    thinkingLevels: ["low", "medium", "high"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "deepseek-thinking",
    tools: true,
    vision: true,
    contextK: 1000,
    hint: "全局默认 · 视觉 · 1M",
    endpoints: [ep(RELAY, "deepseek/deepseek-v4.1-flash")],
    icon: "deepseek",
    pricing: { input: 2.1, cachedInput: 0.042, output: 8.4 },
    cacheTtlSec: 7200,
  },
  {
    id: "Qwen/Qwen3.7-Flash",
    label: "Qwen3.7 Flash",
    group: "快速模型",
    thinking: true,
    thinkingLevels: ["low", "medium", "high", "max"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "siliconflow",
    tools: true,
    vision: true,
    contextK: 256,
    hint: "视觉 · 快速",
    endpoints: [ep(RELAY, "Qwen/Qwen3.7-Flash")],
    icon: "qwen",
    pricing: { input: 1.2, cachedInput: 0.24, output: 4.8 },
    cacheTtlSec: 1800,
    timeoutMs: 120_000,
  },
  // ── 多模态 ──────────────────────────
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    group: "多模态",
    thinking: true,
    thinkingLevels: ["low", "medium", "high", "max"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    vision: true,
    contextK: 256,
    hint: "多模态 · 视觉",
    endpoints: [ep(RELAY, "gpt-5.6-luna")],
    pricing: { input: 1.4, cachedInput: 0.14, cacheWrite: 1.75, output: 8.4 },
    cacheTtlSec: 3600,
  },
  {
    id: "mimo-v2.5",
    label: "MiMo V2.5",
    group: "多模态",
    thinking: true,
    thinkingRequestStyle: "mimo-thinking",
    tools: true,
    vision: true,
    contextK: 1000,
    hint: "全模态 · 1M · 思考仅开关",
    endpoints: [ep(MIMO, "mimo-v2.5")],
    icon: "mimo",
    pricing: { input: 1, cachedInput: 0.02, cacheWrite: 1, output: 2 },
    cacheTtlSec: 3600,
  },
  {
    id: "google/gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    group: "多模态",
    thinking: true,
    thinkingRequired: true,
    thinkingLevels: ["low", "medium", "high"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "gemini-thinking-level",
    tools: true,
    vision: true,
    contextK: 1000,
    hint: "1M · 思考不可关",
    endpoints: [ep(RELAY, "google/gemini-3.8-flash")],
    icon: "gemini",
    pricing: { input: 10.5, cachedInput: 1.05, output: 52.5 },
    cacheTtlSec: 3600,
    timeoutMs: 120_000,
  },
  {
    id: "z-ai/glm-5.3-flash",
    label: "GLM-5.3 Flash",
    group: "多模态",
    thinking: true,
    thinkingRequired: true,
    thinkingLevels: ["low", "high", "max"],
    thinkingEffortMap: { low: "low", medium: "high", high: "high", max: "max" },
    defaultThinkingEffort: "max",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    vision: true,
    contextK: 1000,
    hint: "1M · 思考不可关",
    endpoints: [ep(RELAY, "z-ai/glm-5.3-flash"), ep(MIMO, "mimo-v2.5")],
    icon: "zhipu",
    pricing: { input: 0.8, cachedInput: 0.23, output: 2.8 },
    cacheTtlSec: 1800,
    timeoutMs: 120_000,
  },
  {
    id: "Qwen/Qwen3.8-Flash",
    label: "Qwen3.8 Flash",
    group: "多模态",
    thinking: true,
    thinkingLevels: ["low", "medium", "high", "max"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "siliconflow",
    tools: true,
    vision: true,
    contextK: 256,
    hint: "视觉 · 混合思考",
    endpoints: [ep(RELAY, "Qwen/Qwen3.8-Flash")],
    icon: "qwen",
    pricing: { input: 0.8, cachedInput: 0.1, output: 2.7 },
    cacheTtlSec: 1800,
    timeoutMs: 120_000,
  },
  {
    id: "meta/muse-spark-1.3-contributor",
    label: "Muse Spark 1.3",
    group: "多模态",
    thinking: true,
    thinkingLevels: ["high", "max"],
    thinkingEffortMap: { high: "xhigh", max: "max" },
    defaultThinkingEffort: "high",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    vision: true,
    contextK: 256,
    hint: "视觉 · high→xhigh",
    endpoints: [ep(RELAY, "meta/muse-spark-1.3-contributor")],
    pricing: { input: 0.7, cachedInput: 0.014, output: 1.4 },
    cacheTtlSec: 1800,
    timeoutMs: 120_000,
  },
  // ── 免费模型 ──────────────────────────
  {
    id: "meituan/LongCat-2.0:free",
    label: "LongCat 2.0",
    group: "免费模型",
    thinking: true,
    thinkingLevels: ["low", "medium", "high"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    contextK: 128,
    hint: "免费",
    endpoints: [ep(RELAY, "meituan/LongCat-2.0:free")],
    pricing: { input: 0, cachedInput: 0, output: 0 },
  },
  {
    id: "inclusionai/ling-3.0-flash-sante:free",
    label: "Ling 3.0 Flash Sante",
    group: "免费模型",
    thinking: true,
    thinkingLevels: ["low", "medium", "high"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    contextK: 256,
    hint: "免费 · 256K",
    endpoints: [ep(RELAY, "inclusionai/ling-3.0-flash-sante:free")],
    pricing: { input: 0, cachedInput: 0, output: 0 },
  },
  // ── 旗舰模型 ──────────────────────────
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    group: "旗舰模型",
    thinking: true,
    thinkingLevels: ["low", "medium", "high", "max"],
    defaultThinkingEffort: "medium",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    vision: true,
    contextK: 256,
    hint: "旗舰 · 视觉",
    endpoints: [ep(RELAY, "gpt-5.6-sol")],
    pricing: { input: 28, cachedInput: 2.8, cacheWrite: 35, output: 140 },
    cacheTtlSec: 3600,
    timeoutMs: 120_000,
  },
  {
    id: "kimi-k3",
    label: "Kimi K3",
    group: "旗舰模型",
    thinking: true,
    thinkingRequired: true,
    thinkingLevels: ["low", "high", "max"],
    defaultThinkingEffort: "max",
    thinkingRequestStyle: "openai-reasoning-effort",
    tools: true,
    vision: true,
    contextK: 256,
    hint: "旗舰 · 思考不可关",
    endpoints: [ep(RELAY, "kimi-k3")],
    icon: "kimi",
    pricing: { input: 20, cachedInput: 2, output: 100 },
    cacheTtlSec: 3600,
    timeoutMs: 120_000,
  },
  // ── 生图模型 ──────────────────────────
  {
    id: "Tongyi-MAI/Z-Image-Turbo",
    label: "Z-Image Turbo",
    group: "生图模型",
    type: "image",
    thinking: false,
    thinkingRequestStyle: "none",
    tools: false,
    contextK: 0,
    hint: "通义生图 · ¥0.10/张 · 亚秒级 · 中英文文字",
    endpoints: sf("Tongyi-MAI/Z-Image-Turbo"),
    icon: "tongyi",
    pricing: { input: 0, cachedInput: 0, output: 0.1 },
    imageParams: { sizes: ["1024x1024", "960x1280", "768x1024", "720x1440", "720x1280"], maxCount: 4 },
  },
];

export const DEFAULT_MODEL_ID = "deepseek/deepseek-v4.1-flash";

export function modelThinkingLevels(info: ModelInfo | undefined): ThinkingEffort[] {
  if (!info?.thinking) return [];
  return info.thinkingLevels ?? [];
}

export function modelSupportsThinkingEffort(info: ModelInfo | undefined): boolean {
  return modelThinkingLevels(info).length > 0;
}

export function modelAllowsDisableThinking(info: ModelInfo | undefined): boolean {
  return !!info?.thinking && !info.thinkingRequired;
}

export function clampThinkingEffort(
  info: ModelInfo | undefined,
  effort: ThinkingEffort,
): ThinkingEffort {
  const levels = modelThinkingLevels(info);
  if (levels.length === 0) return effort;
  if (levels.includes(effort)) return effort;
  if (effort === "medium" && levels.includes("high")) return "high";
  if ((effort === "max" || effort === "high") && levels.includes("high")) return "high";
  if (levels.includes("medium")) return "medium";
  return info?.defaultThinkingEffort && levels.includes(info.defaultThinkingEffort)
    ? info.defaultThinkingEffort
    : levels[0];
}

export function defaultEffortFor(info: ModelInfo | undefined): ThinkingEffort {
  if (!info) return "medium";
  if (info.defaultThinkingEffort && modelThinkingLevels(info).includes(info.defaultThinkingEffort)) {
    return info.defaultThinkingEffort;
  }
  return clampThinkingEffort(info, "medium");
}

/** UI 档位映射为上游 reasoning_effort / thinking_level 字符串。 */
export function wireThinkingEffort(
  info: ModelInfo | undefined,
  effort: ThinkingEffort | undefined,
): string {
  const ui = effort ?? defaultEffortFor(info);
  const mapped = info?.thinkingEffortMap?.[ui];
  if (mapped) return mapped;
  if (ui === "low" || ui === "medium") return ui;
  if (ui === "max" && info?.thinkingLevels?.includes("max")) return "max";
  return "high";
}

export const CUSTOM_PREFIX = "custom:";

export interface ParsedCustomModelRegistryId {
  groupId?: string;
  modelId: string;
  scoped: boolean;
}

export function buildCustomModelRegistryId(groupId: string, modelId: string): string {
  return `${CUSTOM_PREFIX}${encodeURIComponent(groupId)}:${encodeURIComponent(modelId)}`;
}

function parseCustomModelRegistryId(id: string): ParsedCustomModelRegistryId | undefined {
  if (!id.startsWith(CUSTOM_PREFIX)) return undefined;
  const rest = id.slice(CUSTOM_PREFIX.length);
  const sep = rest.indexOf(":");
  if (sep > 0) {
    try {
      return {
        groupId: decodeURIComponent(rest.slice(0, sep)),
        modelId: decodeURIComponent(rest.slice(sep + 1)),
        scoped: true,
      };
    } catch {
      return { groupId: rest.slice(0, sep), modelId: rest.slice(sep + 1), scoped: true };
    }
  }
  return { modelId: rest, scoped: false };
}

export interface CustomModelConfig {
  id: string;
  label?: string;
  contextK?: number;
  pricing?: {
    input: number;
    cachedInput?: number;
    cacheWrite?: number;
    output: number;
  };
  cacheTtlSec?: number;
  /** 是否支持视觉（图片输入）。 */
  vision?: boolean;
  /** 是否支持思考链。 */
  thinking?: boolean;
  /**
   * 该模型支持的思考强度档位。
   *  - 缺省且 thinking=true：视为四档全开（兼容旧配置，菜单/请求才能按强度工作）
   *  - 空数组：仅 on/off，不展示强度
   */
  thinkingLevels?: ThinkingEffort[];
  /** true 时思考不可关闭。 */
  thinkingRequired?: boolean;
  /** UI 档位 → 上游 reasoning_effort / thinking_level 取值。 */
  thinkingEffortMap?: Partial<Record<ThinkingEffort, string>>;
  /** 选中该模型时的默认思考档位。 */
  defaultThinkingEffort?: ThinkingEffort;
  /** 是否支持工具调用。 */
  tools?: boolean;
  /**
   * API 兼容格式（业界最佳实践的三选一）：
   *  - openai：OpenAI Chat Completions（含 One-API/OpenRouter/DeepSeek/OpenAI 官方）
   *  - anthropic：真·Anthropic Messages 协议（/v1/messages, x-api-key）
   *  - siliconflow：硅基流动 / 原生 Qwen / 原生 GLM 的 enable_thinking 方言
   * 若未设置，视为 openai。所有底层字段（reasoningField / thinkingRequestStyle）
   * 由 apiProtocol 自动装配，用户无需手填。
   */
  apiProtocol?: "openai" | "anthropic" | "siliconflow";
  /**
   * @deprecated 由 apiProtocol 自动装配；仍作为高级 override 保留。
   * 流式推理内容字段名；常见值为 reasoning_content、reasoning、reasoning_text。
   */
  reasoningField?: string;
  /**
   * @deprecated 由 apiProtocol 自动装配；仍作为高级 override 保留。
   * 思考参数请求风格；OpenAI-compatible 模型可关闭或使用 reasoning_effort。
   */
  thinkingRequestStyle?: ThinkingRequestStyle;
  /** 生图 API 格式；auto 按模型名推断，OpenAI-compatible 自定义生图可显式设为 openai。 */
  imageApiStyle?: "auto" | "openai" | "siliconflow";
  /** 模型类型：文本对话 or 生图。默认 'text'。 */
  type?: "text" | "image";
  /** 生图模型参数（仅 type='image' 时有效）。 */
  imageParams?: {
    sizes?: string[];
    maxCount?: number;
  };
}

export type CustomApiProtocol = NonNullable<CustomModelConfig["apiProtocol"]>;

/** 自定义 API 分组：每组独立的 baseUrl/apiKey + 模型列表。 */
export interface CustomApiGroup {
  /** 分组唯一 ID。 */
  id: string;
  /** 用户命名的分组名（显示在模型菜单中）。 */
  name: string;
  baseUrl: string;
  apiKey: string;
  models: CustomModelConfig[];
}

export function getModelInfo(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === normalizeRegistryId(id));
}

/** 主路由 provider（endpoints[0]）。 */
export function primaryProvider(info: ModelInfo): ProviderKind {
  return info.endpoints[0]?.provider ?? SF;
}

/** 模型 fetch 超时（毫秒）。 */
export function getFetchTimeoutMs(registryId: string): number {
  const info = getModelInfo(registryId);
  return info?.timeoutMs ?? 45_000;
}

/** 是否还有备用端点可尝试。 */
export function hasNextEndpoint(registryId: string, currentIndex: number): boolean {
  const info = getModelInfo(registryId);
  return !!info && currentIndex + 1 < info.endpoints.length;
}

/** 展平所有分组的自定义模型为单一数组（向后兼容辅助）。 */
function getAllCustomModels(groups: CustomApiGroup[]): CustomModelConfig[] {
  return groups.flatMap((g) => g.models);
}

/** 在分组中查找包含某模型的分组（custom: 前缀）。 */
export function findCustomModelGroup(
  groups: CustomApiGroup[],
  modelId: string,
): { group: CustomApiGroup; model: CustomModelConfig } | undefined {
  const rawId = modelId.startsWith(CUSTOM_PREFIX) ? modelId.slice(CUSTOM_PREFIX.length) : modelId;
  for (const group of groups) {
    const encodedGroupId = encodeURIComponent(group.id);
    const scopedPrefix = `${encodedGroupId}:`;
    if (!rawId.startsWith(scopedPrefix)) continue;
    const encodedModelId = rawId.slice(scopedPrefix.length);
    let scopedModelId = encodedModelId;
    try {
      scopedModelId = decodeURIComponent(encodedModelId);
    } catch {
      // Keep the raw value as a best-effort fallback for malformed historical data.
    }
    const model = group.models.find((m) => m.id === scopedModelId);
    if (model) return { group, model };
  }

  for (const group of groups) {
    const model = group.models.find((m) => m.id === rawId);
    if (model) return { group, model };
  }
  return undefined;
}

export function normalizeCustomModelRegistryId(modelId: string, groups: CustomApiGroup[]): string {
  if (!modelId.startsWith(CUSTOM_PREFIX)) return modelId;

  const found = findCustomModelGroup(groups, modelId);
  if (!found) return modelId;

  const canonical = buildCustomModelRegistryId(found.group.id, found.model.id);
  const rawId = modelId.slice(CUSTOM_PREFIX.length);
  const scopedPrefix = `${encodeURIComponent(found.group.id)}:`;
  if (rawId.startsWith(scopedPrefix)) return canonical;

  const legacyMatches = groups.flatMap((group) =>
    group.models
      .filter((model) => model.id === rawId)
      .map((model) => ({ group, model })),
  );

  return legacyMatches.length === 1 ? canonical : modelId;
}

function customThinkingLevels(c: CustomModelConfig): ThinkingEffort[] | undefined {
  if (!c.thinking) return undefined;
  if (c.thinkingLevels === undefined) return [...THINKING_EFFORT_VALUES];
  const levels = normalizeThinkingLevels(c.thinkingLevels);
  return levels.length > 0 ? levels : undefined;
}

function customDefaultEffort(c: CustomModelConfig, levels: ThinkingEffort[] | undefined): ThinkingEffort | undefined {
  if (!c.thinking || !levels?.length) return undefined;
  if (c.defaultThinkingEffort && levels.includes(c.defaultThinkingEffort)) return c.defaultThinkingEffort;
  if (levels.includes("medium")) return "medium";
  return levels[0];
}

/** 将单个 CustomModelConfig 转换为 ModelInfo（内部辅助）。 */
function customModelToInfo(
  c: CustomModelConfig,
  group: Pick<CustomApiGroup, "id" | "name">,
  options?: { scopedId?: boolean },
): ModelInfo {
  const isImage = c.type === "image";
  const thinking = c.thinking ?? false;
  const levels = customThinkingLevels(c);
  return {
    id: options?.scopedId === false ? CUSTOM_PREFIX + c.id : buildCustomModelRegistryId(group.id, c.id),
    label: c.label || c.id,
    group: group.name || "自定义 API",
    thinking,
    thinkingLevels: levels,
    thinkingRequired: thinking ? !!c.thinkingRequired : undefined,
    thinkingEffortMap: c.thinkingEffortMap,
    defaultThinkingEffort: customDefaultEffort(c, levels),
    thinkingRequestStyle: c.thinkingRequestStyle,
    tools: c.tools ?? (isImage ? false : true),
    vision: c.vision,
    contextK: c.contextK ?? 128,
    hint: isImage ? `${c.id} · 生图模型` : c.id,
    endpoints: [{ provider: SF, apiModelId: c.id }],
    pricing: c.pricing
      ? {
          input: c.pricing.input,
          cachedInput: c.pricing.cachedInput ?? c.pricing.input,
          cacheWrite: c.pricing.cacheWrite ?? c.pricing.cachedInput ?? c.pricing.input,
          output: c.pricing.output,
        }
      : undefined,
    cacheTtlSec: c.cacheTtlSec ?? 3600,
    type: c.type ?? "text",
    imageParams: c.imageParams,
  };
}

/** 合并内置模型 + 自定义模型，供菜单和 getModelInfo 使用。 */
export function getAllModels(groups: CustomApiGroup[]): ModelInfo[] {
  const custom: ModelInfo[] = groups.flatMap((g) =>
    g.models.map((c) => customModelToInfo(c, g)),
  );
  return [...modelsForPicker(MODELS), ...custom];
}

/** 向后兼容：接收 CustomModelConfig[] 的旧版 getAllModels。 */
export function getAllModelsFlat(customModels: CustomModelConfig[]): ModelInfo[] {
  return [
    ...modelsForPicker(MODELS),
    ...customModels.map((c) =>
      customModelToInfo(c, { id: "legacy", name: "自定义 API" }, { scopedId: false }),
    ),
  ];
}

/** 查找模型信息，支持自定义模型（custom: 前缀）。 */
export function getModelInfoWithCustom(id: string, groups: CustomApiGroup[]): ModelInfo | undefined {
  if (id.startsWith(CUSTOM_PREFIX)) {
    const found = findCustomModelGroup(groups, id);
    if (!found) return undefined;
    return customModelToInfo(found.model, found.group);
  }
  return getModelInfo(id);
}

/** 按 group 聚合，保持声明顺序，供菜单分区渲染。 */
export function getModelGroups(): { group: string; models: ModelInfo[] }[] {
  const order: string[] = [];
  const map = new Map<string, ModelInfo[]>();
  for (const m of modelsForPicker(MODELS)) {
    if (!map.has(m.group)) {
      map.set(m.group, []);
      order.push(m.group);
    }
    map.get(m.group)!.push(m);
  }
  return order.map((group) => ({ group, models: map.get(group)! }));
}

/** 按 group 聚合（含自定义模型），保持声明顺序。 */
export function getModelGroupsWithCustom(groups: CustomApiGroup[]): { group: string; models: ModelInfo[] }[] {
  const all = getAllModels(groups);
  const order: string[] = [];
  const map = new Map<string, ModelInfo[]>();
  for (const m of all) {
    if (!map.has(m.group)) {
      map.set(m.group, []);
      order.push(m.group);
    }
    map.get(m.group)!.push(m);
  }
  return order.map((group) => ({ group, models: map.get(group)! }));
}
