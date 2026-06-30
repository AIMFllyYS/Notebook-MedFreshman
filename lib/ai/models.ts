// 多提供商精选模型注册表 —— 供 AI 对话的模型选择菜单。
// 默认提供商：SiliconFlow（硅基流动）；MiMo 模型走小米官方 API。
// model id（注册 id）与上游 apiModelId 分离；endpoints 链支持容灾降级。
// 经 scripts/verify-models.ts + 各平台 GET /v1/models 核对（2026-06）。

export type ProviderKind = "siliconflow" | "mimo" | "zhipu";

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

/** 已下架注册 id → 当前注册 id（用户本地设置兼容） */
export const LEGACY_REGISTRY_ALIASES: Record<string, string> = {
  "MiniMaxAI/MiniMax-M3": "MiniMaxAI/MiniMax-M2.5",
};

export function normalizeRegistryId(id: string): string {
  return LEGACY_REGISTRY_ALIASES[id] ?? id;
}

const SF = "siliconflow" as const;
const MIMO = "mimo" as const;
const ZHIPU = "zhipu" as const;

function ep(provider: ProviderKind, apiModelId: string): ModelEndpoint {
  return { provider, apiModelId };
}

function sf(id: string): ModelEndpoint[] {
  return [ep(SF, id)];
}

export const MODELS: ModelInfo[] = [
  // ── 小米 MiMo（官方 API）──────────────────
  { id: "mimo-v2.5-pro", label: "MiMo V2.5 Pro", group: "小米 MiMo", thinking: true, tools: true, contextK: 1000, hint: "旗舰推理 · 1M · 42B 激活 · Agent", endpoints: [ep(MIMO, "mimo-v2.5-pro")], icon: "mimo", pricing: { input: 3, cachedInput: 0.025, output: 6 }, cacheTtlSec: 3600 },
  { id: "mimo-v2.5", label: "MiMo V2.5", group: "小米 MiMo", thinking: true, tools: true, vision: true, contextK: 1000, hint: "全模态 · 1M · 图片理解 · 推荐", endpoints: [ep(MIMO, "mimo-v2.5")], icon: "mimo", pricing: { input: 1, cachedInput: 0.02, output: 2 }, cacheTtlSec: 3600 },
  { id: "mimo-v2-flash", label: "MiMo V2 Flash", group: "小米 MiMo", thinking: true, tools: true, contextK: 256, hint: "极速低成本 · 256K · 限时免费", endpoints: [ep(MIMO, "mimo-v2-flash")], icon: "mimo", pricing: { input: 0, cachedInput: 0, output: 0 }, cacheTtlSec: 3600 },
  // ── DeepSeek ──────────────────────────────
  { id: "deepseek-ai/DeepSeek-V4-Pro", label: "DeepSeek V4 Pro", group: "DeepSeek", thinking: true, tools: true, contextK: 1000, endpoints: sf("deepseek-ai/DeepSeek-V4-Pro"), icon: "deepseek", hint: "旗舰推理 · 1M 上下文 · 最强但较贵", pricing: { input: 3, cachedInput: 0.03, cacheWrite: 0.03, output: 6 }, cacheTtlSec: 7200 },
  { id: "deepseek-ai/DeepSeek-V4-Flash", label: "DeepSeek V4 Flash", group: "DeepSeek", thinking: true, tools: true, contextK: 1000, endpoints: sf("deepseek-ai/DeepSeek-V4-Flash"), icon: "deepseek", hint: "性价比推理 · 1M · 日常首选", pricing: { input: 1, cachedInput: 0.02, cacheWrite: 0.02, output: 2 }, cacheTtlSec: 7200 },
  // ── 智谱 GLM ──────────────────────────────
  { id: "zai-org/GLM-5.2", label: "GLM-5.2", group: "智谱 GLM", thinking: true, tools: true, contextK: 200, endpoints: [ep(SF, "zai-org/GLM-5.2"), ep(ZHIPU, "glm-5.2")], icon: "zhipu", hint: "GLM 最新旗舰 · 中文强", pricing: { input: 9.8, cachedInput: 1.82, cacheWrite: 1.82, output: 30.8 }, cacheTtlSec: 1800 },
  { id: "Pro/zai-org/GLM-5.1", label: "GLM-5.1 Pro", group: "智谱 GLM", thinking: true, tools: true, contextK: 128, endpoints: sf("Pro/zai-org/GLM-5.1"), icon: "zhipu", hint: "思考默认开 · 适合长讲解", pricing: { input: 9.8, cachedInput: 1.82, cacheWrite: 1.82, output: 30.8 }, cacheTtlSec: 1800 },
  { id: "zai-org/GLM-Z1-AirX", label: "GLM-Z1-AirX", group: "智谱 GLM", thinking: true, tools: true, contextK: 256, endpoints: [ep(ZHIPU, "glm-z1-airx")], icon: "zhipu", hint: "智谱极速推理 · 200 tok/s", pricing: { input: 0.5, cachedInput: 0.05, cacheWrite: 0.05, output: 2 }, cacheTtlSec: 1800 },
  { id: "zai-org/GLM-4.7-FlashX", label: "GLM-4.7-FlashX", group: "智谱 GLM", thinking: false, tools: true, contextK: 128, endpoints: [ep(ZHIPU, "glm-4-flashx-250414")], icon: "zhipu", hint: "智谱轻量高速 · 200K 上下文", pricing: { input: 0, cachedInput: 0, cacheWrite: 0, output: 0 }, cacheTtlSec: 1800 },
  // ── 通义 Qwen ─────────────────────────────
  { id: "Qwen/Qwen3.6-35B-A3B", label: "Qwen3.6 35B", group: "通义 Qwen", thinking: true, tools: true, contextK: 256, endpoints: sf("Qwen/Qwen3.6-35B-A3B"), icon: "qwen", hint: "MoE · 速度/成本均衡 · 推荐主力", pricing: { input: 0.4, cachedInput: 0.04, cacheWrite: 0.04, output: 3.2 }, cacheTtlSec: 1800, timeoutMs: 120_000 },
  { id: "Qwen/Qwen3.6-27B", label: "Qwen3.6 27B", group: "通义 Qwen", thinking: true, tools: true, contextK: 256, endpoints: sf("Qwen/Qwen3.6-27B"), icon: "qwen", hint: "更轻量 · 速度更快 · 低成本", pricing: { input: 0.3, cachedInput: 0.03, cacheWrite: 0.03, output: 2.4 }, cacheTtlSec: 1800, timeoutMs: 120_000 },
  // ── 其他 ─────────────────────────────────
  { id: "Pro/moonshotai/Kimi-K2.6", label: "Kimi K2.6 Pro", group: "其他旗舰", thinking: false, tools: true, contextK: 256, endpoints: sf("Pro/moonshotai/Kimi-K2.6"), icon: "kimi", hint: "Agent / 多工具编排强", pricing: { input: 6.65, cachedInput: 1.12, cacheWrite: 1.12, output: 28 }, cacheTtlSec: 1800 },
  { id: "moonshotai/Kimi-K2.7-Code", label: "Kimi K2.7 Code", group: "其他旗舰", thinking: false, tools: true, contextK: 256, endpoints: sf("moonshotai/Kimi-K2.7-Code"), icon: "kimi", hint: "代码 Agent · 思考 token 降低 30%", pricing: { input: 6.65, cachedInput: 1.12, cacheWrite: 1.12, output: 28 }, cacheTtlSec: 1800 },
  { id: "MiniMaxAI/MiniMax-M2.5", label: "MiniMax M2.5", group: "其他旗舰", thinking: true, tools: true, contextK: 1049, endpoints: sf("MiniMaxAI/MiniMax-M2.5"), icon: "minimax", hint: "1M 上下文 · MSA · 编程/Agent 旗舰", pricing: { input: 2.1, cachedInput: 0.21, cacheWrite: 0.21, output: 8.4 }, cacheTtlSec: 1800 },
  // ── 硅基流动生图 ──────────────────────────
  { id: "Tongyi-MAI/Z-Image-Turbo", label: "Z-Image Turbo", group: "硅基流动生图", type: "image", thinking: false, tools: false, contextK: 0, hint: "通义生图 · ¥0.10/张 · 亚秒级 · 中英文文字", endpoints: sf("Tongyi-MAI/Z-Image-Turbo"), icon: "tongyi", pricing: { input: 0, cachedInput: 0, output: 0.1 }, imageParams: { sizes: ["1024x1024", "960x1280", "768x1024", "720x1440", "720x1280"], maxCount: 4 } },
];

export const DEFAULT_MODEL_ID = "mimo-v2.5";

export const CUSTOM_PREFIX = "custom:";

export interface ParsedCustomModelRegistryId {
  groupId?: string;
  modelId: string;
  scoped: boolean;
}

export function buildCustomModelRegistryId(groupId: string, modelId: string): string {
  return `${CUSTOM_PREFIX}${encodeURIComponent(groupId)}:${encodeURIComponent(modelId)}`;
}

export function parseCustomModelRegistryId(id: string): ParsedCustomModelRegistryId | undefined {
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
  /** 是否支持工具调用。 */
  tools?: boolean;
  /** 流式推理内容字段名；常见值为 reasoning_content、reasoning、reasoning_text。 */
  reasoningField?: string;
  /** 思考参数请求风格；OpenAI-compatible 模型可关闭或使用 reasoning_effort。 */
  thinkingRequestStyle?: "none" | "siliconflow" | "openai-reasoning-effort";
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
export function getAllCustomModels(groups: CustomApiGroup[]): CustomModelConfig[] {
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

/** 将单个 CustomModelConfig 转换为 ModelInfo（内部辅助）。 */
function customModelToInfo(
  c: CustomModelConfig,
  group: Pick<CustomApiGroup, "id" | "name">,
  options?: { scopedId?: boolean },
): ModelInfo {
  const isImage = c.type === "image";
  return {
    id: options?.scopedId === false ? CUSTOM_PREFIX + c.id : buildCustomModelRegistryId(group.id, c.id),
    label: c.label || c.id,
    group: group.name || "自定义 API",
    thinking: c.thinking ?? false,
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
  return [...MODELS, ...custom];
}

/** 向后兼容：接收 CustomModelConfig[] 的旧版 getAllModels。 */
export function getAllModelsFlat(customModels: CustomModelConfig[]): ModelInfo[] {
  return [
    ...MODELS,
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
  for (const m of MODELS) {
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
