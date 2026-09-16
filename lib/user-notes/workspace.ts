import { subjectName } from "@/lib/content-data/subjects.registry";
import { isSubjectId } from "@/lib/types/content";
import { DEFAULT_SUBJECT } from "@/lib/constants/subjects";
import { useStore } from "@/lib/stores/ui";
import { useWindowManager, type UserNotesWindowData } from "@/lib/stores/windowManager";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useReviewCards } from "@/lib/stores/reviewCards";
import {
  useComposerCitations,
  reviewCardCitationId,
  userNoteCitationId,
  type ComposerCitation,
} from "@/lib/stores/composerCitations";
import type { UserNote } from "@/lib/user-notes/types";
import type { ReviewCard } from "@/lib/review/types";

// 用户笔记工作区的公共入口：加号菜单 / 书架 / 引用芯片都从这里调，UI 组件不自己拼窗口 id。

export const USER_NOTES_WINDOW_PREFIX = "user-notes:";

export function userNotesWindowId(subjectId: string): string {
  return `${USER_NOTES_WINDOW_PREFIX}${subjectId}`;
}

function resolveSubjectId(subjectId?: string): string {
  const candidate = subjectId ?? useStore.getState().activeSubjectId;
  return isSubjectId(candidate) ? candidate : DEFAULT_SUBJECT;
}

// 几何对齐 DocumentViewer：偏宽的阅读/编辑窗，靠左上留出安全边距。
function workspaceGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 24, y: 64 }, size: { width: 960, height: 720 } };
  }
  const width = Math.max(720, Math.floor(window.innerWidth * 0.72));
  const height = Math.floor(window.innerHeight * 0.88);
  return {
    pos: {
      x: Math.max(16, Math.floor((window.innerWidth - width) / 2)),
      y: Math.max(16, Math.floor(window.innerHeight * 0.04)),
    },
    size: { width, height },
  };
}

/** 打开某科目笔记库；noteId 可选。若该科还没有笔记，不要自动创建，显示空状态。 */
export function openUserNotesLibrary(subjectId: string, noteId?: string): string {
  const sid = resolveSubjectId(subjectId);
  const winId = userNotesWindowId(sid);
  const existing = useWindowManager.getState().windows.find((w) => w.id === winId);
  // 已开着就沿用用户拖好的几何，只换选中的笔记并聚焦。
  const geometry = existing ? { pos: existing.pos, size: existing.size } : workspaceGeometry();
  const keptNoteId = (existing?.data as UserNotesWindowData | undefined)?.noteId ?? null;
  useWindowManager.getState().openWindow<UserNotesWindowData>({
    id: winId,
    type: "user-notes",
    title: `我的笔记 · ${subjectName(sid)}`,
    pos: geometry.pos,
    size: geometry.size,
    data: { subjectId: sid, noteId: noteId ?? keptNoteId },
  });
  return winId;
}

/** 在指定科目新建笔记并打开工作区，返回 note id。subjectId 缺省时用当前活动科目。 */
export function createAndOpenUserNote(subjectId?: string): string {
  const sid = resolveSubjectId(subjectId);
  const noteId = useUserNotes.getState().create({ subjectId: sid });
  openUserNotesLibrary(sid, noteId);
  return noteId;
}

/** 引用正文：标题降级为 H1，正文原样保留（公式不做任何转义）。 */
export function formatUserNoteCitation(note: UserNote): string {
  return `# ${note.title}\n\n${note.markdown}`;
}

/** 复习卡引用正文：出处 + 正面 + 背面 + 原文，front/back 里的公式原样保留。 */
export function formatReviewCardCitation(card: ReviewCard): string {
  const heading = card.front?.trim() || card.originalText.trim().split("\n")[0] || "复习卡";
  const lines = [`# 复习卡：${heading}`, "", `- 科目：${subjectName(card.subjectId)}`];
  if (card.sourceLabel) lines.push(`- 出处：${card.sourceLabel}`);
  lines.push("");
  if (card.front?.trim()) lines.push("## 正面", "", card.front.trim(), "");
  if (card.back?.trim()) lines.push("## 背面", "", card.back.trim(), "");
  if (card.explanation?.trim()) lines.push("## 解析", "", card.explanation.trim(), "");
  if (card.originalText.trim()) lines.push("## 原文", "", card.originalText.trim(), "");
  return lines.join("\n");
}

/** 把选中的用户笔记推进输入框引用区（已存在的跳过）。 */
export function citeUserNotes(noteIds: string[]): void {
  const { byId } = useUserNotes.getState();
  const items: ComposerCitation[] = [];
  for (const id of noteIds) {
    const note = byId[id];
    if (!note) continue;
    items.push({
      id: userNoteCitationId(note.id),
      kind: "user-note",
      sourceId: note.id,
      title: note.title,
      markdown: formatUserNoteCitation(note),
    });
  }
  if (items.length > 0) useComposerCitations.getState().addCitations(items);
}

/** 把选中的复习卡推进输入框引用区（已存在的跳过）。 */
export function citeReviewCards(cardIds: string[]): void {
  const { byId } = useReviewCards.getState();
  const items: ComposerCitation[] = [];
  for (const id of cardIds) {
    const card = byId[id];
    if (!card) continue;
    items.push({
      id: reviewCardCitationId(card.id),
      kind: "review-card",
      sourceId: card.id,
      title: card.front?.trim() || card.originalText.trim().split("\n")[0] || "复习卡",
      markdown: formatReviewCardCitation(card),
    });
  }
  if (items.length > 0) useComposerCitations.getState().addCitations(items);
}

/** 引用芯片点回来用：只有 noteId 时自行解析科目并打开工作区。 */
export function openUserNoteById(noteId: string): void {
  const note = useUserNotes.getState().byId[noteId];
  if (!note) return;
  openUserNotesLibrary(note.subjectId, noteId);
}
