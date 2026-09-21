import type { StudyToolRuntime } from "@/lib/ai/agent/tools/_shared";

export const CITE_LEGEND_INTRO =
  "【引用编号】凡依据下列来源写出的句子，句末必须标注对应编号，例如「……[1]。」多源并列写成[1][2]或[1,2]。不要编造未列出的编号。未使用来源的句子不要标注。";

export const CITE_HIT_HINT = "引用以上条目时，句末必须标注对应 [编号]。";

export function allocateCiteIndex(runtime: StudyToolRuntime): number {
  const index = runtime.nextCiteIndex;
  runtime.nextCiteIndex += 1;
  return index;
}

export function formatCiteLine(index: number, title: string, locator = ""): string {
  const loc = locator.trim();
  return loc ? `[${index}] ${title} — ${loc}` : `[${index}] ${title}`;
}

export function appendCiteLegend(text: string, lines: string[]): string {
  if (!lines.length) return text;
  return `${text}\n\n${CITE_LEGEND_INTRO}\n${lines.join("\n")}`;
}

export function prefixCiteTag(text: string, index: number, kindLabel: string, locator = ""): string {
  const loc = locator.trim();
  const head = loc
    ? `【引用编号 [${index}] · ${kindLabel}】${loc}`
    : `【引用编号 [${index}] · ${kindLabel}】`;
  return `${head}\n${text}`;
}
