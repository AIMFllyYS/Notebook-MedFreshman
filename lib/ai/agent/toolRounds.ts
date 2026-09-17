/** 工具循环轮数：默认与 ToolLoop 现网一致，设置页可调。 */

/** studyAgent 未指定 maxToolRounds 时的默认步数（推荐值）。 */
export const MAX_TOOL_STEPS = 6;
export const MIN_TOOL_ROUNDS = 1;
/**
 * 设置页可调上限。对齐 AI SDK `ToolLoopAgent` 默认 `stopWhen: isStepCount(20)`，
 * 这是本架构理论最大适配值；`isStepCount` 本身不设硬顶，再高没有适配收益。
 */
export const MAX_TOOL_ROUNDS_CAP = 20;

export function clampMaxToolRounds(value: unknown, fallback = MAX_TOOL_STEPS): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_TOOL_ROUNDS_CAP, Math.max(MIN_TOOL_ROUNDS, Math.round(n)));
}
