/** 从笔记 Markdown 抽标题，供编辑器左侧目录栏使用。Crepe 7.22 没有官方 TOC。 */

export interface NoteTocItem {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  line: number;
}

const HEADING_RE = /^(#{1,3})\s+(.+?)\s*$/;

export function parseNoteToc(markdown: string): NoteTocItem[] {
  if (!markdown) return [];
  const items: NoteTocItem[] = [];
  const seen = new Map<string, number>();
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const match = HEADING_RE.exec(lines[i]);
    if (!match) continue;
    const title = stripMdInline(match[2]);
    if (!title) continue;
    const level = match[1].length as 1 | 2 | 3;
    const base = slugHeading(title) || `h${i}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    items.push({
      id: count === 1 ? base : `${base}-${count}`,
      level,
      title,
      line: i,
    });
  }
  return items;
}

export function stripMdInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]+/g, "")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

export function slugHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]+/g, "")
    .slice(0, 48);
}

/** 源码 textarea：把光标落到该行并滚进视口。 */
export function focusMarkdownLine(el: HTMLTextAreaElement, line: number): void {
  const lines = el.value.split(/\n/);
  let start = 0;
  for (let i = 0; i < line && i < lines.length; i++) start += lines[i].length + 1;
  const end = start + (lines[line]?.length ?? 0);
  el.focus();
  el.setSelectionRange(start, end);
  const ratio = el.value.length > 0 ? start / el.value.length : 0;
  el.scrollTop = Math.max(0, ratio * el.scrollHeight - el.clientHeight / 3);
}

/** 渲染编辑：按标题文本滚到 Crepe 里对应的 h1–h3。 */
export function scrollCrepeHeading(root: HTMLElement | null, title: string): boolean {
  if (!root) return false;
  const headings = root.querySelectorAll("h1, h2, h3");
  for (const node of headings) {
    if (stripMdInline(node.textContent ?? "") === title) {
      node.scrollIntoView({ block: "start", behavior: "smooth" });
      return true;
    }
  }
  return false;
}
