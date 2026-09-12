// 双端共用的全量上下文估算与软上限口径。无 Node 依赖，客户端/服务端都可导入。
import { estimateTokens } from "@/lib/context/estimateTokens";

/** 软上限：占用 / 窗口 >= 该比例时走压缩而非硬切。 */
export const SOFT_LIMIT_RATIO = 0.8;
/** 环：已达软上限之前的中间态（70–80%）。 */
export const RING_APPROACHING_RATIO = 0.7;
/** 环：开始变黄的提示档。 */
export const RING_NOTICE_RATIO = 0.4;
/** 首轮尚无服务端 total 时，给 system + 工具 schema + 参考材料的占位。 */
export const FIRST_TURN_OVERHEAD_TOKENS = 3000;

export interface FullContextEstimateInput {
  /** 稳定 system（学科 prompt + 全局补充 + 技能菜单/固定技能）。 */
  systemText?: string;
  /** 工具 name+description+schema 的拼接文本；与 toolDefsTokens 二选一。 */
  toolSchemaText?: string;
  /** 已估算的工具定义 token，优先于 toolSchemaText。 */
  toolDefsTokens?: number;
  /** 参考材料（定位行 + 笔记正文/摘要）。 */
  referenceText?: string;
  /** 对话历史（不含 system）。 */
  historyText?: string;
  /** 额外已估 token（如上一轮服务端 total）。 */
  extraTokens?: number;
}

/** system + 工具 schema + 参考材料 + 对话历史。两端 80% 判定都走这里。 */
export function estimateFullContextTokens(input: FullContextEstimateInput): number {
  return (
    estimateTokens(input.systemText ?? "") +
    (input.toolDefsTokens ?? estimateTokens(input.toolSchemaText ?? "")) +
    estimateTokens(input.referenceText ?? "") +
    estimateTokens(input.historyText ?? "") +
    Math.max(0, input.extraTokens ?? 0)
  );
}

export function isSoftLimitReached(estimated: number, limit: number): boolean {
  return limit > 0 && estimated / limit >= SOFT_LIMIT_RATIO;
}

/**
 * 会话预算分母：未锁定时用当前模型窗口；已锁定则允许随更大窗口上调，不随更小窗口下调。
 * 不改 persist key 名。
 */
export function resolveSessionContextBudget(locked: number, modelLimit: number): number {
  if (!(modelLimit > 0)) return Math.max(0, locked);
  if (!(locked > 0)) return modelLimit;
  return Math.max(locked, modelLimit);
}

export type ContextRingLevel = "ok" | "notice" | "approaching" | "limit";

export function contextRingLevel(ratio: number): ContextRingLevel {
  if (ratio >= SOFT_LIMIT_RATIO) return "limit";
  if (ratio >= RING_APPROACHING_RATIO) return "approaching";
  if (ratio >= RING_NOTICE_RATIO) return "notice";
  return "ok";
}

export function contextRingColor(level: ContextRingLevel): string {
  if (level === "limit") return "var(--md-sys-color-error)";
  if (level === "approaching") return "var(--md-sys-color-tertiary)";
  if (level === "notice") return "#f59e0b";
  return "#10b981";
}

export function contextRingCaption(level: ContextRingLevel): string | undefined {
  if (level === "limit") return "已达 80% 软上限";
  if (level === "approaching") return "接近 80% 软上限";
  return undefined;
}

export function formatContextCacheValue(
  cachedTokens: number,
  format: (n: number) => string = String,
): string {
  return cachedTokens > 0 ? `命中 ${format(cachedTokens)}` : "未命中";
}
