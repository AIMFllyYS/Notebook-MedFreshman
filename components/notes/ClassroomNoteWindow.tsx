"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { StickyNote, Trash2 } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import SubjectPickerMenu from "@/components/notes/SubjectPickerMenu";
import { useUserNotes } from "@/lib/stores/userNotes";
import { userNoteWindowId } from "@/lib/notes/userNote";
import { useWindowManager } from "@/lib/stores/windowManager";
import { shouldMountHeavyEditor } from "@/lib/window/heavyEditor";

const MilkdownNoteEditor = dynamic(() => import("@/components/notes/MilkdownNoteEditor"), {
  ssr: false,
  loading: () => <div className="user-note-crepe-loading">加载批注编辑器…</div>,
});

/** 划词「笔记」弹出的小便签：复用完整 Milkdown，只是窗小、正文靠左。 */
export default function ClassroomNoteWindow({ noteId }: { noteId: string }) {
  const note = useUserNotes((s) => s.byId[noteId]);
  const updateNote = useUserNotes((s) => s.updateNote);
  const removeNote = useUserNotes((s) => s.removeNote);
  const closeEditor = useUserNotes((s) => s.closeEditor);
  const windowId = userNoteWindowId(noteId);
  const isFront = useWindowManager((s) => shouldMountHeavyEditor(s.activeWindowId, windowId));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleClose = useCallback(() => closeEditor(noteId), [closeEditor, noteId]);
  const handleMarkdown = useCallback(
    (markdown: string) => updateNote(noteId, { markdown }),
    [noteId, updateNote],
  );

  if (!note) return null;

  return (
    <ManagedWindow
      windowId={userNoteWindowId(noteId)}
      title={note.title || "课堂笔记"}
      icon={<StickyNote size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 280, minH: 220 }}
      overlayId={`classroom-note-${noteId}`}
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
      actions={
        <button
          type="button"
          data-no-drag
          title="删除这条课堂笔记"
          aria-label="删除这条课堂笔记"
          className="user-note-chrome-btn is-danger"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={14} />
        </button>
      }
    >
      <div className="classroom-note">
        <blockquote className="classroom-note-quote">
          <div className="classroom-note-quote-label">原文</div>
          {note.quote?.trim() || "（没有划词原文）"}
        </blockquote>
        <div className="classroom-note-head" data-no-drag>
          <input
            className="user-note-title-input"
            value={note.title}
            placeholder="课堂笔记"
            aria-label="课堂笔记标题"
            onChange={(event) => updateNote(noteId, { title: event.target.value })}
          />
          <SubjectPickerMenu
            value={note.subjectId}
            allowUnfiled
            onChange={(next) => updateNote(noteId, { subjectId: next })}
          />
        </div>
        <p className="classroom-note-meta">{note.source?.label || "课堂批注"}</p>
        {isFront ? (
          <MilkdownNoteEditor key={noteId} value={note.markdown} onChange={handleMarkdown} compact />
        ) : (
          <textarea
            data-no-drag
            className="user-note-source"
            value={note.markdown}
            spellCheck={false}
            aria-label="课堂批注"
            onChange={(event) => handleMarkdown(event.target.value)}
          />
        )}
      </div>

      {confirmDelete && typeof document !== "undefined" ? (
        <DeleteStickyDialog
          title={note.title || "课堂笔记"}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            removeNote(noteId);
          }}
        />
      ) : null}
    </ManagedWindow>
  );
}

function DeleteStickyDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return createPortal(
    <div className="app-dialog-backdrop">
      <div role="alertdialog" aria-modal="true" aria-label="删除课堂笔记" className="app-dialog">
        <div className="app-dialog-eyebrow">删除确认</div>
        <h2>删除「{title}」？</h2>
        <p>课堂便签与个人笔记一起存在这台设备上，删除后无法恢复。</p>
        <div className="user-note-dialog-actions">
          <button type="button" className="user-note-dialog-cancel" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="app-dialog-confirm" onClick={onConfirm}>
            删除
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
