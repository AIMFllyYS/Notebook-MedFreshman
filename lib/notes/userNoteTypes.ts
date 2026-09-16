// 用户自建笔记（区别于 content/ 下的课程讲义）。
// 正文是一段 Markdown 源码：与课程笔记共用 lib/markdown/plugins.ts 那条唯一渲染管线，
// 所以 $…$ 公式、:::callout / :::memory 指令、::noteref / ::cardref 引用在这里同样可用。

/** 一篇用户笔记。正文只存 Markdown 源码，渲染永远在读取端做。 */
export interface UserNote {
  id: string;
  /** 归属科目（SubjectId 字面量，此处放宽为 string 以免 lib 层交叉依赖注册表）。 */
  subjectId: string;
  title: string;
  /** Markdown 源码。 */
  content: string;
  createdAt: number;
  updatedAt: number;
}

/** 引用一段课程讲义：与 searchNotes 的 SearchHit 同形，可直接喂给 requestCitedNote。 */
export interface NoteCitation {
  /** `subjectId/categoryId/itemId` */
  path: string;
  title: string;
  /** 纯文本片段，落地页用它做模糊定位高亮。 */
  snippet: string;
}

/** 引用一张复习闪卡：只存 id，正文始终从 useReviewCards 实时读，避免复制过期内容。 */
export interface CardCitation {
  cardId: string;
  /** 冗余一份卡面标题，闪卡被删后引用芯片仍能显示「原卡已删除：…」。 */
  label: string;
}

/** 笔记导出结构（与复习卡导出保持同一形状，便于统一备份/导入）。 */
export interface UserNoteExport {
  app: "gailvlun";
  kind: "user-notes";
  version: 1;
  exportedAt: number;
  scope: "subject" | "all";
  subjectId?: string;
  count: number;
  notes: UserNote[];
}

export const NOTE_TITLE_MAX = 120;
export const NOTE_CONTENT_MAX = 200_000;

/** 新笔记的默认标题。 */
export const UNTITLED_NOTE_TITLE = "未命名笔记";

/**
 * 从正文首个非空行推断标题（Markdown 一级/任意级标题优先）。
 * 用户没手动改过标题时，输入正文即自动命名，省掉一次改名操作。
 */
export function deriveNoteTitle(content: string): string {
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    // 跳过围栏与指令开头，它们不是标题
    if (line.startsWith("```") || line.startsWith("~~~") || line.startsWith("::")) continue;
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const text = (heading ? heading[1] : line)
      .replace(/[*_`~]/g, "")
      .replace(/^>\s*/, "")
      .replace(/^[-*+]\s+/, "")
      .trim();
    if (text) return text.slice(0, NOTE_TITLE_MAX);
  }
  return UNTITLED_NOTE_TITLE;
}
