"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NotebookPen, Plus, Trash2, Download } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import DocumentWorkspace, { type DocumentOutlineItem } from "@/components/window/DocumentWorkspace";
import NoteMarkdownEditor from "@/components/notes/NoteMarkdownEditor";
import { useWindowManager, type NotesEditorData } from "@/lib/hooks/useWindowManager";
import { useUserNotes } from "@/lib/stores/userNotes";
import { deriveNoteTitle, UNTITLED_NOTE_TITLE, type UserNote } from "@/lib/notes/userNoteTypes";

/** 正文停止输入后落库的间隔。逐字写 IndexedDB 没必要，也会拖慢输入。 */
const SAVE_DEBOUNCE_MS = 450;

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return new Date(ts).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

function outlineOf(notes: UserNote[]): DocumentOutlineItem[] {
  return notes.map((note) => ({
    id: note.id,
    title: note.title || UNTITLED_NOTE_TITLE,
    meta: relativeTime(note.updatedAt),
  }));
}

function downloadMarkdown(note: UserNote) {
  const blob = new Blob([note.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(note.title || UNTITLED_NOTE_TITLE).replace(/[\\/:*?"<>|]/g, "_")}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function NotesEditorWindow({ windowId }: { windowId: string }) {
  const win = useWindowManager((s) => s.windows.find((w) => w.id === windowId));
  const closeWindow = useWindowManager((s) => s.closeWindow);
  const updateWindow = useWindowManager((s) => s.updateWindow);

  const hydrated = useUserNotes((s) => s._hasHydrated);
  const byId = useUserNotes((s) => s.byId);
  const order = useUserNotes((s) => s.order);
  const createNote = useUserNotes((s) => s.create);
  const updateNote = useUserNotes((s) => s.update);
  const removeNote = useUserNotes((s) => s.remove);

  const data = win?.data as NotesEditorData | undefined;
  const subjectId = data?.subjectId ?? "";
  const activeId = data?.activeId ?? null;

  const notes = useMemo(
    () =>
      order
        .map((id) => byId[id])
        .filter((note): note is UserNote => Boolean(note) && note.subjectId === subjectId)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [order, byId, subjectId],
  );

  const active = activeId ? byId[activeId] : undefined;

  // 正文本地草稿：受控输入必须即时回显，落库则去抖，两者分开。
  const [draft, setDraft] = useState(active?.content ?? "");
  const draftRef = useRef({ id: activeId, content: draft });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = draftRef.current;
    if (!pending.id) return;
    const stored = useUserNotes.getState().byId[pending.id];
    if (!stored || stored.content === pending.content) return;
    // 标题还是默认值时，跟着正文首行自动命名；用户手动改过标题就不再覆盖。
    const autoTitle =
      stored.title === UNTITLED_NOTE_TITLE ? deriveNoteTitle(pending.content) : undefined;
    useUserNotes.getState().update(pending.id, {
      content: pending.content,
      ...(autoTitle ? { title: autoTitle } : {}),
    });
  }, []);

  // 切换笔记 / 外部改动：先把上一篇的草稿落库，再载入新内容。
  useEffect(() => {
    if (draftRef.current.id !== activeId) {
      flush();
      const next = activeId ? (useUserNotes.getState().byId[activeId]?.content ?? "") : "";
      draftRef.current = { id: activeId, content: next };
      setDraft(next);
    }
  }, [activeId, flush]);

  // 关窗 / 卸载兜底：不能让最后几个字符留在内存里。
  useEffect(() => flush, [flush]);

  const onDraftChange = useCallback(
    (next: string) => {
      setDraft(next);
      draftRef.current = { id: activeId, content: next };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
    },
    [activeId, flush],
  );

  const setActive = useCallback(
    (id: string | null) => {
      flush();
      if (!win) return;
      updateWindow(windowId, { data: { subjectId, activeId: id } as NotesEditorData });
    },
    [flush, win, updateWindow, windowId, subjectId],
  );

  const handleClose = useCallback(() => {
    flush();
    closeWindow(windowId);
  }, [flush, closeWindow, windowId]);

  const handleCreate = useCallback(() => {
    flush();
    const id = createNote(subjectId);
    updateWindow(windowId, { data: { subjectId, activeId: id } as NotesEditorData });
  }, [flush, createNote, subjectId, updateWindow, windowId]);

  const handleDelete = useCallback(() => {
    if (!active) return;
    // 删除后落到列表里的下一篇，而不是把用户扔进空状态。
    const rest = notes.filter((note) => note.id !== active.id);
    if (timerRef.current) clearTimeout(timerRef.current);
    draftRef.current = { id: null, content: "" };
    removeNote(active.id);
    updateWindow(windowId, {
      data: { subjectId, activeId: rest[0]?.id ?? null } as NotesEditorData,
    });
  }, [active, notes, removeNote, updateWindow, windowId, subjectId]);

  if (!win) return null;

  const toolbar = (
    <>
      <button type="button" data-no-drag onClick={handleCreate} title="新建笔记">
        <Plus size={14} /> 新建
      </button>
      <span className="notes-editor-title-wrap">
        <input
          className="notes-editor-title"
          data-no-drag
          value={active?.title ?? ""}
          disabled={!active}
          placeholder="笔记标题"
          aria-label="笔记标题"
          onChange={(event) => {
            if (active) updateNote(active.id, { title: event.target.value });
          }}
        />
      </span>
      <button
        type="button"
        data-no-drag
        disabled={!active}
        onClick={() => active && downloadMarkdown(active)}
        title="导出为 .md 文件"
      >
        <Download size={14} />
      </button>
      <button
        type="button"
        data-no-drag
        disabled={!active}
        onClick={handleDelete}
        title="删除本篇笔记"
        className="notes-editor-danger"
      >
        <Trash2 size={14} />
      </button>
    </>
  );

  return (
    <ManagedWindow
      windowId={windowId}
      title={win.title}
      icon={<NotebookPen size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 520, minH: 380 }}
      overlayId={`notes-editor:${subjectId}`}
      className="notes-editor-window"
      testId="notes-editor-window"
      bodyClassName="min-h-0 flex-1 overflow-hidden"
    >
      <DocumentWorkspace
        outline={outlineOf(notes)}
        activeId={activeId ?? ""}
        onSelect={setActive}
        outlineLabel="笔记列表"
        toolbar={toolbar}
        resizable
      >
        {!hydrated ? (
          <p className="notes-editor-status">载入笔记…</p>
        ) : active ? (
          <NoteMarkdownEditor
            noteId={active.id}
            value={draft}
            onChange={onDraftChange}
            subjectId={subjectId}
          />
        ) : (
          <div className="notes-editor-empty">
            <NotebookPen size={34} aria-hidden="true" />
            <strong>这个科目还没有笔记</strong>
            <p>
              新建一篇就能用完整 Markdown 记录：公式、表格、代码块、记忆卡，
              还能引用课程讲义和复习闪卡。
            </p>
            <button type="button" className="press notes-editor-empty-cta" onClick={handleCreate}>
              <Plus size={15} /> 新建笔记
            </button>
          </div>
        )}
      </DocumentWorkspace>
    </ManagedWindow>
  );
}
