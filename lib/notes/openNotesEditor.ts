import { useWindowManager, type NotesEditorData } from "@/lib/stores/windowManager";
import { useUserNotes } from "@/lib/stores/userNotes";
import { appendBlock } from "@/lib/notes/noteCitations";
import { UNTITLED_NOTE_TITLE } from "@/lib/notes/userNoteTypes";

// 笔记编辑器窗口的开窗助手。放在 lib/ 而非组件里，是因为入口有四处
// （加号菜单、书架卡片、复习板顶栏、划词/引用），它们不该各自拼一遍 openWindow 参数。
// lib 层不得 import components（执行契约第九条），所以这里只碰 store。

const DEFAULT_SIZE = { width: 900, height: 620 };
const MIN_MARGIN = 24;

/** 每个科目一扇编辑器窗口：同科重复开窗只会聚焦，不会堆窗。 */
export function notesEditorWindowId(subjectId: string): string {
  return `notes-editor:${subjectId}`;
}

/** 开窗位置：视口居中偏上，并做一次边界收敛，避免小窗口下标题栏跑到屏幕外。 */
function centeredPos(size: { width: number; height: number }) {
  if (typeof window === "undefined") return { x: 120, y: 96 };
  const x = Math.max(MIN_MARGIN, Math.round((window.innerWidth - size.width) / 2));
  const y = Math.max(MIN_MARGIN, Math.round((window.innerHeight - size.height) / 2.6));
  return { x, y };
}

function fittedSize() {
  if (typeof window === "undefined") return DEFAULT_SIZE;
  return {
    width: Math.min(DEFAULT_SIZE.width, Math.max(420, window.innerWidth - MIN_MARGIN * 2)),
    height: Math.min(DEFAULT_SIZE.height, Math.max(360, window.innerHeight - MIN_MARGIN * 2)),
  };
}

function windowTitle(subjectName: string): string {
  return `${subjectName} · 笔记`;
}

/**
 * 打开（或聚焦）某科目的笔记编辑器。
 *
 * - 窗口已存在：只切换选中的笔记并前置，不重置几何——用户拖过的窗口位置要留住。
 * - 窗口不存在：居中开一扇新窗。
 * - 未指定 activeId 时选该科最近更新的一篇；该科一篇都没有则停在空状态（不自动建笔记，
 *   避免「只是想看看」也留下一堆未命名笔记）。
 */
export function openNotesEditor(opts: {
  subjectId: string;
  subjectName: string;
  activeId?: string | null;
}): string {
  const { subjectId, subjectName } = opts;
  const id = notesEditorWindowId(subjectId);
  const wm = useWindowManager.getState();

  const activeId =
    opts.activeId !== undefined
      ? opts.activeId
      : (useUserNotes.getState().latestForSubject(subjectId)?.id ?? null);

  const existing = wm.windows.find((win) => win.id === id);
  if (existing) {
    const data: NotesEditorData = { subjectId, activeId };
    wm.updateWindow(id, { title: windowTitle(subjectName), data });
    if (existing.minimized) wm.restoreWindow(id);
    else wm.bringToFront(id);
    return id;
  }

  const size = fittedSize();
  const data: NotesEditorData = { subjectId, activeId };
  wm.openWindow<NotesEditorData>({
    id,
    type: "notes-editor",
    title: windowTitle(subjectName),
    pos: centeredPos(size),
    size,
    data,
  });
  return id;
}

/** 新建一篇笔记并在编辑器里打开它。返回新笔记 id。 */
export function createNoteAndOpen(
  opts: { subjectId: string; subjectName: string; seed?: { title?: string; content?: string } },
): string {
  const noteId = useUserNotes.getState().create(opts.subjectId, opts.seed);
  openNotesEditor({ subjectId: opts.subjectId, subjectName: opts.subjectName, activeId: noteId });
  return noteId;
}

/**
 * 把一段 Markdown（通常是 ::noteref / ::cardref 引用行）追加进「当前笔记」并打开编辑器。
 *
 * 「当前笔记」的判定顺序，目的是让引用总有一个可预期的落点：
 *   1. 该科编辑器窗口正在编辑的那篇；
 *   2. 该科最近更新的那篇；
 *   3. 都没有 → 新建一篇《摘录与引用》。
 */
export function appendToNoteAndOpen(opts: {
  subjectId: string;
  subjectName: string;
  markdown: string;
  /** 新建兜底笔记时用的标题。 */
  fallbackTitle?: string;
}): string {
  const { subjectId, subjectName, markdown } = opts;
  const notes = useUserNotes.getState();
  const wm = useWindowManager.getState();

  const win = wm.windows.find((w) => w.id === notesEditorWindowId(subjectId));
  const fromWindow = win ? (win.data as NotesEditorData).activeId : null;
  const targetId =
    (fromWindow && notes.byId[fromWindow] ? fromWindow : null) ??
    notes.latestForSubject(subjectId)?.id ??
    null;

  if (targetId) {
    const prev = notes.byId[targetId];
    notes.update(targetId, { content: appendBlock(prev.content, markdown) });
    openNotesEditor({ subjectId, subjectName, activeId: targetId });
    return targetId;
  }

  const title = opts.fallbackTitle ?? "摘录与引用";
  const noteId = notes.create(subjectId, {
    title: title || UNTITLED_NOTE_TITLE,
    content: appendBlock(`# ${title}`, markdown),
  });
  openNotesEditor({ subjectId, subjectName, activeId: noteId });
  return noteId;
}
