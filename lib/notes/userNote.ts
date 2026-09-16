// 个人笔记（用户自己写的 Markdown）数据模型与纯函数工具。
// 与 content/ 下的「课程笔记」是两套东西：课程笔记是只读的仓库文件，
// 个人笔记只存在于用户本机的 IndexedDB（见 lib/stores/userNotes.ts）。

import { getSubject } from "@/lib/content-data";
import { isSubjectId } from "@/lib/types/content";
import type { Category, ContentItem } from "@/lib/types/content";

export interface UserNote {
  id: string;
  title: string;
  markdown: string;
  /** 绑定的科目；null = 未归档（收件箱）。 */
  subjectId: string | null;
  createdAt: number;
  updatedAt: number;
}

/** 笔记库窗口的两种用途：browse = 书架上「我的笔记」，cite = 加号菜单「选择笔记」。 */
export type NoteLibraryIntent = "browse" | "cite";

const FALLBACK_NOTE_TITLE = "无标题笔记";
const TITLE_MAX_CHARS = 60;
/** 引用到对话时的正文上限，避免把一篇长笔记整篇塞进输入框。 */
const QUOTE_MAX_CHARS = 4000;

/** 选择笔记库的默认可见案例；新建笔记不要用这篇当模板。 */
export const EXAMPLE_USER_NOTE_ID = "example-user-note";

/** 案例笔记正文（KaTeX / GFM 演示）。只 seed 进库，不塞进 createNote。 */
export const DEFAULT_NOTE_MARKDOWN = `# 案例笔记

在左侧用 Markdown 写作。支持 GFM 表格、任务列表，以及 KaTeX 公式。

行内公式：$E = mc^{2}$

独立公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^{2}}\\,dx = \\sqrt{\\pi}
$$
`;

/** 加号 / 书架「新建笔记」：干净空白，标题占位即可。 */
export const BLANK_NOTE_MARKDOWN = "";

export function makeExampleUserNote(now = Date.now()): UserNote {
  return {
    id: EXAMPLE_USER_NOTE_ID,
    title: deriveNoteTitle(DEFAULT_NOTE_MARKDOWN),
    markdown: DEFAULT_NOTE_MARKDOWN,
    subjectId: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 库为空时插入一篇案例；已有任意用户笔记（含这篇案例）则不动。
 * 不覆盖、不在每次新建时克隆。
 */
export function seedExampleNoteIfEmpty(
  byId: Record<string, UserNote>,
  order: string[],
  now = Date.now(),
): { byId: Record<string, UserNote>; order: string[] } | null {
  if (order.length > 0 || byId[EXAMPLE_USER_NOTE_ID]) return null;
  const note = makeExampleUserNote(now);
  return {
    byId: { ...byId, [note.id]: note },
    order: [...order, note.id],
  };
}

export function userNoteWindowId(noteId: string): string {
  return `user-note-editor:${noteId}`;
}

export const USER_NOTE_LIBRARY_WINDOW_ID = "user-note-library";
export const FLASHCARD_CITE_WINDOW_ID = "flashcard-cite-picker";
export const AGENT_PRODUCT_PICKER_WINDOW_ID = "agent-product-picker";

export function memoryProposalWindowId(proposalId: string): string {
  return `memory-proposal:${proposalId}`;
}

/**
 * 从正文推导标题：优先第一个 ATX 标题（`# …`），否则第一行非空文本，都没有则兜底。
 * 用户手动改过标题后不再跟随正文（见 `userNotes.updateNote`）。
 */
export function deriveNoteTitle(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const heading = /^#{1,6}\s+(.+)$/.exec(line.trim());
    const text = heading?.[1]?.trim();
    if (text) return clampTitle(text);
  }
  for (const line of lines) {
    const text = line.trim();
    if (text) return clampTitle(text);
  }
  return FALLBACK_NOTE_TITLE;
}

function clampTitle(text: string): string {
  return text.length > TITLE_MAX_CHARS ? text.slice(0, TITLE_MAX_CHARS) : text;
}

/** 复习闪卡引用到对话的文本。 */
export function formatFlashcardQuote(card: {
  sourceLabel: string;
  front: string;
  back: string;
  originalText: string;
  explanation?: string;
}): string {
  const lines = [
    `【复习闪卡 · ${card.sourceLabel}】`,
    `正面：${card.front || card.originalText}`,
    `背面：${card.back || "（还没有背面）"}`,
  ];
  if (card.explanation) lines.push(`解析：${card.explanation}`);
  return lines.join("\n");
}

/** 划到聊天输入框的引用文本（超长正文截断）。 */
export function formatNoteQuote(note: Pick<UserNote, "title" | "markdown">): string {
  const markdown =
    note.markdown.length > QUOTE_MAX_CHARS
      ? `${note.markdown.slice(0, QUOTE_MAX_CHARS)}\n\n…（笔记较长，已截断）`
      : note.markdown;
  return `【笔记】${note.title}\n\n${markdown}`;
}

/** 列表行用的一句话预览：去掉常见 Markdown 记号并压平空白。 */
export function plainSnippet(markdown: string, maxChars = 80): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/[*_~|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}

/** 一条可引用的课程笔记（path 与 searchNotes 命中同构，可直接喂 noteCitations）。 */
export interface CourseNoteHit {
  path: string;
  title: string;
  snippet: string;
  categoryId: string;
  categoryName: string;
}

/**
 * 摊平某科目内容树里「真正能读」的条目：跳过纯导航节点、占位（stub）与目录页。
 * 用于加号菜单「选择笔记 · 课程笔记」这一栏。
 */
export function listCourseNoteHits(subjectId: string): CourseNoteHit[] {
  if (!isSubjectId(subjectId)) return [];
  const subject = getSubject(subjectId);
  if (!subject) return [];

  const hits: CourseNoteHit[] = [];
  const walk = (items: ContentItem[], category: Category) => {
    for (const item of items) {
      if (!item.navigationOnly && item.status !== "stub" && item.id !== "toc") {
        hits.push({
          path: `${subject.id}/${category.id}/${item.id}`,
          title: item.title,
          snippet: item.summary || "",
          categoryId: category.id,
          categoryName: category.name,
        });
      }
      if (item.children?.length) walk(item.children, category);
    }
  };
  for (const category of subject.categories) walk(category.items, category);
  return hits;
}

/** 科目显示名（未绑定科目时给出「未归档」）。 */
export function subjectLabel(subjectId: string | null): string {
  if (!subjectId) return "未归档";
  return (isSubjectId(subjectId) ? getSubject(subjectId)?.name : undefined) ?? subjectId;
}
