// 长文档生成的提示词（服务端 /api/document 使用）。
// outline 阶段产出 JSON 章节列表；section 阶段每次只写一节，保证单次输出可控、不被截断。

import {
  DEFAULT_TARGET_WORDS,
  DOCUMENT_GENRE_LABELS,
  type DocumentSection,
  type DocumentSpec,
} from "@/lib/documents/types";

const GENRE_GUIDE: Record<DocumentSpec["genre"], string> = {
  article: "面向学习者的长文章：有引入、主体分层展开、结尾总结；语言清楚、有直觉解释与例子。",
  paper: "学术论文：摘要 → 引言 → 主体（方法/理论/分析）→ 讨论 → 结论 → 参考文献；论证严谨、术语准确、引用规范；避免口语。",
  report: "结构化报告：背景与目标 → 现状/方法 → 结果与分析 → 结论与建议；多用小标题、要点列表与表格。",
  "review-notes": "复习讲义：按知识点组织，每个知识点给定义、核心公式/结论、典型例子与易错点；可用 :::definition / :::theorem / :::pitfall 指令块。",
  essay: "随笔/短评：观点鲜明、行文连贯、篇幅精炼。",
};

export function targetWordsOf(spec: DocumentSpec): number {
  return spec.targetWords && spec.targetWords > 0 ? spec.targetWords : DEFAULT_TARGET_WORDS[spec.genre];
}

function languageLine(spec: DocumentSpec): string {
  return spec.language === "en" ? "Write in English." : "用简体中文写作。";
}

function referencesBlock(spec: DocumentSpec): string {
  return spec.references?.trim()
    ? `\n\n## 参考材料（写作时据此引用，不要臆造材料中没有的事实/数据）\n${spec.references.trim()}`
    : "";
}

export function buildOutlineInstructions(spec: DocumentSpec): string {
  const words = targetWordsOf(spec);
  const sections = Math.min(12, Math.max(4, Math.round(words / 600)));
  return `你是资深写作者与学科编辑。根据写作要求为一篇「${DOCUMENT_GENRE_LABELS[spec.genre]}」规划章节。

## 体裁要求
${GENRE_GUIDE[spec.genre]}

## 输出规则（严格）
- 只输出一个 JSON 数组，不要任何解释、不要代码围栏。
- 每个元素：{"title": "章节标题", "brief": "本节要写什么（一句话，含关键要点/公式/例子）"}。
- ${sections - 1}–${sections + 1} 个章节，覆盖全文约 ${words} 字的内容；标题不要带编号，不要重复文章标题。
- ${languageLine(spec)}`;
}

export function buildOutlinePrompt(spec: DocumentSpec): string {
  return `文章标题：${spec.title}\n\n写作要求：\n${spec.brief}${referencesBlock(spec)}`;
}

export function buildSectionInstructions(spec: DocumentSpec, outline: Pick<DocumentSection, "title" | "brief">[], index: number): string {
  const total = outline.length;
  const perSection = Math.max(250, Math.round(targetWordsOf(spec) / Math.max(total, 1)));
  const outlineText = outline.map((s, i) => `${i + 1}. ${s.title}${s.brief ? ` — ${s.brief}` : ""}${i === index ? "   ← 本次要写的节" : ""}`).join("\n");
  return `你是资深写作者与学科编辑，正在分节撰写一篇「${DOCUMENT_GENRE_LABELS[spec.genre]}」。全文由多次调用逐节完成，本次只写第 ${index + 1} 节。

## 体裁要求
${GENRE_GUIDE[spec.genre]}

## 全文章节规划
${outlineText}

## 本次输出规则（严格）
- 第一行必须是本节标题：\`## ${outline[index]?.title ?? ""}\`，然后直接进入正文。
- 只写本节，不要写其他节的内容，不要写文章总标题、前言或结尾寄语，不要输出「本节结束」之类的元话语。
- 本节约 ${perSection} 字；写完自然收束，不要为凑字数注水。
- Markdown 排版：小标题用 ###，公式用 KaTeX（行内 $...$，独立 $$...$$），化学式用 $\\ce{...}$；需要表格时用 Markdown 表格。
- 与前文衔接：不要重复前文已经讲过的定义或例子，可以用「如前所述」回指。
- 引用参考材料时指明来源（小节名或文献），不要编造数据、文献或引文。
- ${languageLine(spec)}`;
}

export function buildSectionPrompt(spec: DocumentSpec, outline: Pick<DocumentSection, "title" | "brief">[], index: number, previousTail: string): string {
  const section = outline[index];
  const prev = previousTail.trim() ? `\n\n## 前文结尾（仅供衔接，不要重复）\n${previousTail.trim()}` : "";
  return `文章标题：${spec.title}\n\n写作要求：\n${spec.brief}${referencesBlock(spec)}${prev}\n\n## 现在请写第 ${index + 1} 节\n标题：${section?.title ?? ""}\n要点：${section?.brief ?? "（按章节规划展开）"}`;
}

/** 单节被 max_tokens 截断时的续写提示：从断点无缝接上。 */
export function buildContinuationPrompt(partial: string): string {
  const tail = partial.slice(-1200);
  return `你上一次的输出在下面这段文字末尾被截断了。请从最后一个字之后**无缝续写**本节剩余内容：不要重复已写内容，不要重新写标题，不要加任何说明，直接输出续写文本。\n\n---已写内容（末尾）---\n${tail}\n---续写从这里开始---`;
}

/** 从模型输出中解析章节列表；容忍代码围栏与前后杂文。 */
export function parseOutline(raw: string): Pick<DocumentSection, "title" | "brief">[] {
  const cleaned = raw.replace(/```[a-zA-Z]*/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") return { title: item.trim(), brief: "" };
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const title = String(rec.title ?? rec.heading ?? "").trim();
          const brief = String(rec.brief ?? rec.summary ?? rec.description ?? "").trim();
          return title ? { title, brief } : null;
        }
        return null;
      })
      .filter((s): s is { title: string; brief: string } => !!s)
      .slice(0, 16);
  } catch {
    return [];
  }
}

/** 保证节正文以规划的二级标题开头（模型偶尔漏写或写成一级标题）。 */
export function ensureSectionHeading(markdown: string, title: string): string {
  const trimmed = markdown.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  const firstLine = trimmed.split("\n")[0]?.trim() ?? "";
  if (/^#{1,3}\s+/.test(firstLine)) {
    return trimmed.replace(/^#{1,3}\s+/, "## ");
  }
  return `## ${title}\n\n${trimmed}`;
}
