// 多提供商精选模型注册表 —— 供 AI 对话的模型选择菜单。
// 默认提供商：SiliconFlow（硅基流动）；MiMo 模型走小米官方 API。
// model id 经各平台 `GET /v1/models` 真实核对（2026-06）。

export interface ModelInfo {
  /** 发给 OpenAI 兼容 API 的精确 model id；CUSTOM_MODEL_ID 为自定义占位。 */
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
  /** 提供商标识，决定走哪组 env 凭证。省略 / "siliconflow" 走默认。 */
  provider?: string;
  /** 定价信息（¥ / 百万 token）。 */
  pricing?: {
    input: number;
    cachedInput: number;
    cacheWrite?: number;
    output: number;
  };
  /** Prefix cache 估算 TTL（秒）。来源于官方文档，DeepSeek 为"数小时到数天"取保守下限；MiMo 未公开取业界常见值。 */
  cacheTtlSec?: number;
}

export const CUSTOM_MODEL_ID = "custom";

export const MODELS: ModelInfo[] = [
  // ── 小米 MiMo（官方 API）──────────────────
  { id: "mimo-v2.5-pro", label: "MiMo V2.5 Pro", group: "小米 MiMo", thinking: true, tools: true, contextK: 1000, hint: "旗舰推理 · 1M · 42B 激活 · Agent", provider: "mimo", pricing: { input: 3, cachedInput: 0.025, output: 6 }, cacheTtlSec: 3600 },
  { id: "mimo-v2.5", label: "MiMo V2.5", group: "小米 MiMo", thinking: true, tools: true, vision: true, contextK: 1000, hint: "全模态 · 1M · 图片理解 · 推荐", provider: "mimo", pricing: { input: 1, cachedInput: 0.02, output: 2 }, cacheTtlSec: 3600 },
  { id: "mimo-v2-flash", label: "MiMo V2 Flash", group: "小米 MiMo", thinking: true, tools: true, contextK: 256, hint: "极速低成本 · 256K · 限时免费", provider: "mimo", pricing: { input: 0, cachedInput: 0, output: 0 }, cacheTtlSec: 3600 },
  // ── DeepSeek ──────────────────────────────
  { id: "deepseek-ai/DeepSeek-V4-Pro", label: "DeepSeek V4 Pro", group: "DeepSeek", thinking: true, tools: true, contextK: 1000, hint: "旗舰推理 · 1M 上下文 · 最强但较贵", cacheTtlSec: 7200 },
  { id: "deepseek-ai/DeepSeek-V4-Flash", label: "DeepSeek V4 Flash", group: "DeepSeek", thinking: true, tools: true, contextK: 1000, hint: "性价比推理 · 1M · 日常首选", cacheTtlSec: 7200 },
  // ── 智谱 GLM ──────────────────────────────
  { id: "zai-org/GLM-5.2", label: "GLM-5.2", group: "智谱 GLM", thinking: true, tools: true, contextK: 200, hint: "GLM 最新旗舰 · 中文强", cacheTtlSec: 1800 },
  { id: "Pro/zai-org/GLM-5.1", label: "GLM-5.1 Pro", group: "智谱 GLM", thinking: true, tools: true, contextK: 128, hint: "思考默认开 · 适合长讲解", cacheTtlSec: 1800 },
  // ── 通义 Qwen ─────────────────────────────
  { id: "Qwen/Qwen3.6-35B-A3B", label: "Qwen3.6 35B", group: "通义 Qwen", thinking: true, tools: true, contextK: 256, hint: "MoE · 速度/成本均衡 · 推荐主力", cacheTtlSec: 1800 },
  { id: "Qwen/Qwen3.5-397B-A17B", label: "Qwen3.5 397B", group: "通义 Qwen", thinking: true, tools: true, contextK: 128, hint: "最大 MoE · 能力上限高", cacheTtlSec: 1800 },
  { id: "Qwen/Qwen3.5-35B-A3B", label: "Qwen3.5 35B", group: "通义 Qwen", thinking: true, tools: true, contextK: 256, hint: "均衡稳定", cacheTtlSec: 1800 },
  // ── 其他 ─────────────────────────────────
  { id: "Pro/moonshotai/Kimi-K2.6", label: "Kimi K2.6 Pro", group: "其他旗舰", thinking: false, tools: true, contextK: 256, hint: "Agent / 多工具编排强", cacheTtlSec: 1800 },
  { id: "MiniMaxAI/MiniMax-M2.5", label: "MiniMax M2.5", group: "其他旗舰", thinking: true, tools: true, contextK: 200, hint: "综合能力均衡", cacheTtlSec: 1800 },
];

export const DEFAULT_MODEL_ID = "mimo-v2.5";

export const CUSTOM_PREFIX = "custom:";

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
}

export function getModelInfo(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id);
}

/** 合并内置模型 + 自定义模型，供菜单和 getModelInfo 使用。 */
export function getAllModels(customModels: CustomModelConfig[]): ModelInfo[] {
  const custom: ModelInfo[] = customModels.map((c) => ({
    id: CUSTOM_PREFIX + c.id,
    label: c.label || c.id,
    group: "自定义 API",
    thinking: false,
    tools: true,
    contextK: c.contextK ?? 128,
    hint: c.id,
    pricing: c.pricing
      ? {
          input: c.pricing.input,
          cachedInput: c.pricing.cachedInput ?? c.pricing.input,
          cacheWrite: c.pricing.cacheWrite ?? c.pricing.cachedInput ?? c.pricing.input,
          output: c.pricing.output,
        }
      : undefined,
    cacheTtlSec: c.cacheTtlSec ?? 3600,
  }));
  return [...MODELS, ...custom];
}

/** 查找模型信息，支持自定义模型（custom: 前缀）。 */
export function getModelInfoWithCustom(id: string, customModels: CustomModelConfig[]): ModelInfo | undefined {
  if (id.startsWith(CUSTOM_PREFIX)) {
    const rawId = id.slice(CUSTOM_PREFIX.length);
    const cfg = customModels.find((c) => c.id === rawId);
    if (!cfg) return undefined;
    return {
      id: CUSTOM_PREFIX + cfg.id,
      label: cfg.label || cfg.id,
      group: "自定义 API",
      thinking: false,
      tools: true,
      contextK: cfg.contextK ?? 128,
      hint: cfg.id,
      pricing: cfg.pricing
        ? {
            input: cfg.pricing.input,
            cachedInput: cfg.pricing.cachedInput ?? cfg.pricing.input,
            cacheWrite: cfg.pricing.cacheWrite ?? cfg.pricing.cachedInput ?? cfg.pricing.input,
            output: cfg.pricing.output,
          }
        : undefined,
      cacheTtlSec: cfg.cacheTtlSec ?? 3600,
    };
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
export function getModelGroupsWithCustom(customModels: CustomModelConfig[]): { group: string; models: ModelInfo[] }[] {
  const all = getAllModels(customModels);
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
