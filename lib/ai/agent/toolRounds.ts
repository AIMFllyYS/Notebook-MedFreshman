/** 工具循环轮数：默认与 ToolLoop 现网一致，设置页可调。 */

export const MAX_TOOL_STEPS = 6;
export const MIN_TOOL_ROUNDS = 1;
export const MAX_TOOL_ROUNDS_CAP = 16;

export function clampMaxToolRounds(value: unknown, fallback = MAX_TOOL_STEPS): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_TOOL_ROUNDS_CAP, Math.max(MIN_TOOL_ROUNDS, Math.round(n)));
}
