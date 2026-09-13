// 参考材料分级：目录 → 当前页摘要 → 当前页全文。按窗口紧张程度逐级丢，不要整块 on/off。

export type ReferenceTier = "full" | "summary" | "outline";

export interface ReferenceParts {
  outline?: string;
  summary?: string;
  full?: string;
}

/** compact / overflow 时先丢全文，再丢摘要，目录最后留。 */
export function pickReferenceTier(input: { compact?: boolean; overflow?: boolean }): ReferenceTier {
  if (input.overflow) return "outline";
  if (input.compact) return "summary";
  return "full";
}

/** 从笔记 markdown 抽标题列表 + 首段，不打模型。 */
export function summarizePageMarkdown(markdown: string, title: string): string {
  const headings = [...markdown.matchAll(/^#{1,3}\s+(.+)$/gm)]
    .map((m) => m[1]!.replace(/[#*_`]/g, "").trim())
    .filter(Boolean)
    .slice(0, 16);
  const stripped = markdown
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .trim();
  const excerpt = stripped.split(/\n{2,}/)[0]?.replace(/\s+/g, " ").slice(0, 360) ?? "";
  const lines = [`## 当前页摘要：${title}`];
  if (headings.length) lines.push(headings.map((h) => `- ${h}`).join("\n"));
  if (excerpt) lines.push(excerpt);
  return lines.join("\n");
}

export function assembleReference(parts: ReferenceParts, tier: ReferenceTier): string {
  const chunks: string[] = [];
  if (parts.outline) chunks.push(`\n## 课程目录\n${parts.outline}`);
  if (tier === "outline") return chunks.join("\n");
  if (tier === "summary") {
    if (parts.summary) chunks.push(`\n${parts.summary}`);
    return chunks.join("\n");
  }
  if (parts.full) chunks.push(`\n${parts.full}`);
  else if (parts.summary) chunks.push(`\n${parts.summary}`);
  return chunks.join("\n");
}
