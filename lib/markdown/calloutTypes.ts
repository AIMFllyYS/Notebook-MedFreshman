export const CALLOUT_TYPES = [
  "definition",
  "theorem",
  "example",
  "insight",
  "pitfall",
  "note",
  "tip",
] as const;

export type CalloutType = (typeof CALLOUT_TYPES)[number];

export const CALLOUTS = new Set<string>(CALLOUT_TYPES);

export const CALLOUT_META: Record<string, { label: string; cls: string }> = {
  definition: { label: "定义", cls: "callout-definition" },
  theorem: { label: "定理", cls: "callout-theorem" },
  example: { label: "例", cls: "callout-example" },
  insight: { label: "直觉", cls: "callout-insight" },
  pitfall: { label: "易错点", cls: "callout-pitfall" },
  note: { label: "注", cls: "callout-note" },
  tip: { label: "提示", cls: "callout-tip" },
};
