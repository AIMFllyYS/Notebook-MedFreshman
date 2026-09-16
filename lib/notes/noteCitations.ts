import type { CardCitation, NoteCitation } from "@/lib/notes/userNoteTypes";

// 引用在笔记正文里就是一行叶子指令，与 ::video / ::figure 同级：
//   ::noteref{path="probability/detail/1.4" title="全概率公式" snippet="设 B1…Bn 为样本空间的一个划分"}
//   ::cardref{cardid="k3f9x2a1c" label="全概率公式的适用条件"}
//
// 选这个表示法而不是另建一张「引用表」，是因为：
// 1. 引用随正文一起被复制/导出/搜索，不会出现「正文搬走了引用丢了」的孤儿态；
// 2. 渲染直接走 lib/markdown/plugins.ts 那条唯一管线（remarkDirectives → sanitize → 组件），
//    不需要为笔记再拉一条渲染分支；
// 3. 用户可以手写、可以剪切粘贴、可以直接删掉那一行。

/** snippet 只用于落地页模糊定位，不需要整段原文；过长反而更难命中。 */
const SNIPPET_MAX = 180;

/**
 * 把值安全地放进 `{key="value"}`。
 * ASCII 直引号会提前闭合属性 → 转成中文弯引号（与 normalizeDirectiveLabels 同策略）；
 * 换行会截断指令行 → 折成空格。
 */
function attrValue(raw: string): string {
  return raw
    .replace(/[\r\n]+/g, " ")
    .replace(/"/g, "”")
    .replace(/\s+/g, " ")
    .trim();
}

/** 序列化一条课程讲义引用为 Markdown 指令行。 */
export function noteRefDirective(citation: NoteCitation): string {
  const path = attrValue(citation.path);
  const title = attrValue(citation.title);
  const snippet = attrValue(citation.snippet).slice(0, SNIPPET_MAX);
  return `::noteref{path="${path}" title="${title}" snippet="${snippet}"}`;
}

/** 序列化一条复习闪卡引用为 Markdown 指令行。 */
export function cardRefDirective(citation: CardCitation): string {
  const cardid = attrValue(citation.cardId);
  const label = attrValue(citation.label).slice(0, SNIPPET_MAX);
  return `::cardref{cardid="${cardid}" label="${label}"}`;
}

/**
 * 把一段 Markdown 追加到已有正文末尾，保证指令行前后各有空行
 * （叶子指令必须独占一行，紧贴前一段会被 remark 当成段落续行）。
 */
export function appendBlock(content: string, block: string): string {
  const base = content.replace(/\s+$/, "");
  if (!base) return `${block}\n`;
  return `${base}\n\n${block}\n`;
}
