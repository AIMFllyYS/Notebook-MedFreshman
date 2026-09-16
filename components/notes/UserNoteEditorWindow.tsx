"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import clsx from "clsx";
import { Download, List, MessageSquare, Quote, RefreshCw, Trash2 } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import NoteRenderer from "@/components/notes/NoteRenderer";
import NoteAgentPanel from "@/components/notes/NoteAgentPanel";
import NoteTocSidebar from "@/components/notes/NoteTocSidebar";
import NotebookFormulaIcon from "@/components/icons/NotebookFormulaIcon";
import { useCiteToChat } from "@/components/notes/useCiteToChat";
import { useUserNotes } from "@/lib/stores/userNotes";
import { downloadAsMarkdown } from "@/lib/documents/export";
import { citeUserNoteToMainAgent, openAgentForUserNote } from "@/lib/notes/openUserNote";
import SubjectPickerMenu from "@/components/notes/SubjectPickerMenu";
import { formatNoteQuote, userNoteWindowId } from "@/lib/notes/userNote";
import { keepEditorShortcut } from "@/lib/notes/editorShortcuts";
import {
  focusMarkdownLine,
  parseNoteToc,
  scrollCrepeHeading,
  type NoteTocItem,
} from "@/lib/notes/noteToc";
import { DURATION, EASE } from "@/lib/motion";

type EditorMode = "source" | "wysiwyg" | "split";

const MODES: { id: EditorMode; label: string }[] = [
  { id: "source", label: "源码" },
  { id: "wysiwyg", label: "渲染编辑" },
  { id: "split", label: "分栏" },
];

const MilkdownNoteEditor = dynamic(() => import("@/components/notes/MilkdownNoteEditor"), {
  ssr: false,
  loading: () => <div className="user-note-crepe-loading">加载渲染编辑器…</div>,
});

export default function UserNoteEditorWindow({ noteId }: { noteId: string }) {
  const note = useUserNotes((s) => s.byId[noteId]);
  const updateNote = useUserNotes((s) => s.updateNote);
  const removeNote = useUserNotes((s) => s.removeNote);
  const closeEditor = useUserNotes((s) => s.closeEditor);
  const agentOpen = useUserNotes((s) => s.noteAgentOpenIds.includes(noteId));
  const agentSessionId = useUserNotes((s) => s.noteAgentSessionById[noteId]);
  const [mode, setMode] = useState<EditorMode>("wysiwyg");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tocOpen, setTocOpen] = useState(true);
  const [wysiwygRev, setWysiwygRev] = useState(0);
  const sourceRef = useRef<HTMLTextAreaElement | null>(null);
  const wysiwygHostRef = useRef<HTMLDivElement | null>(null);
  const { cited, cite } = useCiteToChat();

  const handleClose = useCallback(() => closeEditor(noteId), [closeEditor, noteId]);
  const handleMarkdown = useCallback(
    (markdown: string) => updateNote(noteId, { markdown }),
    [noteId, updateNote],
  );
  const refreshWysiwyg = useCallback(() => setWysiwygRev((n) => n + 1), []);

  if (!note) return null;

  const tocItems = parseNoteToc(note.markdown);
  const handleTocSelect = (item: NoteTocItem) => {
    if (mode === "source" && sourceRef.current) {
      focusMarkdownLine(sourceRef.current, item.line);
      return;
    }
    if (mode === "split" && sourceRef.current) {
      focusMarkdownLine(sourceRef.current, item.line);
    }
    scrollCrepeHeading(wysiwygHostRef.current, item.title);
  };

  const source = (
    <NoteSourcePane refEl={sourceRef} value={note.markdown} onChange={handleMarkdown} />
  );
  const preview = <NotePreviewPane markdown={note.markdown} />;
  const wysiwyg = (
    <div ref={wysiwygHostRef} className="user-note-wysiwyg">
      <button
        type="button"
        data-no-drag
        className="user-note-refresh"
        title="刷新渲染"
        aria-label="刷新渲染"
        onClick={refreshWysiwyg}
      >
        <RefreshCw size={13} />
        <span>刷新</span>
      </button>
      <MilkdownNoteEditor
        key={`${noteId}:${mode}:${wysiwygRev}`}
        value={note.markdown}
        onChange={handleMarkdown}
      />
    </div>
  );

  const actions = (
    <div className="user-note-chrome-actions" data-no-drag>
      <div className="user-note-modes" role="group" aria-label="编辑模式">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            data-no-drag
            aria-pressed={mode === item.id}
            className={clsx("user-note-mode", mode === item.id && "is-active")}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        data-no-drag
        title="引用到右侧对话"
        aria-label="引用到右侧对话"
        className="user-note-chrome-btn"
        onClick={() => {
          if (citeUserNoteToMainAgent(noteId)) cite(formatNoteQuote(note));
        }}
      >
        <Quote size={14} />
        <span className="sr-only">{cited ? "已引用到对话" : "引用到对话"}</span>
      </button>
      <button
        type="button"
        data-no-drag
        title="下载 Markdown"
        aria-label="下载 Markdown"
        className="user-note-chrome-btn"
        onClick={() => downloadAsMarkdown(note.markdown, note.title || "无标题笔记")}
      >
        <Download size={14} />
      </button>
      <button
        type="button"
        data-no-drag
        title="删除这篇笔记"
        aria-label="删除这篇笔记"
        className="user-note-chrome-btn is-danger"
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const editorBody = (
    <NoteEditorBody
      title={note.title}
      subjectId={note.subjectId}
      agentOpen={agentOpen}
      tocOpen={tocOpen}
      mode={mode}
      source={source}
      preview={preview}
      wysiwyg={wysiwyg}
      onTitleChange={(title) => updateNote(noteId, { title })}
      onSubjectChange={(next) => updateNote(noteId, { subjectId: next })}
      onToggleAgent={() => {
        if (agentOpen) useUserNotes.getState().setNoteAgentOpen(noteId, false);
        else openAgentForUserNote(noteId);
      }}
      onToggleToc={() => setTocOpen((open) => !open)}
    />
  );

  const workspace = (
    <div className="user-note-workspace">
      {tocOpen ? (
        <PanelGroup direction="horizontal" autoSaveId={`user-note-toc:${noteId}`} className="user-note-toc-split">
          <Panel defaultSize={22} minSize={14} maxSize={40} className="min-h-0 min-w-0">
            <NoteTocSidebar items={tocItems} onSelect={handleTocSelect} onHide={() => setTocOpen(false)} />
          </Panel>
          <NoteResizeHandle />
          <Panel defaultSize={78} minSize={40} className="min-h-0 min-w-0">
            {editorBody}
          </Panel>
        </PanelGroup>
      ) : (
        editorBody
      )}
    </div>
  );

  return (
    <ManagedWindow
      windowId={userNoteWindowId(noteId)}
      title={note.title || "无标题笔记"}
      icon={<NotebookFormulaIcon size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={agentOpen ? { minW: 720, minH: 400 } : { minW: 460, minH: 360 }}
      overlayId={`user-note-editor-${noteId}`}
      actions={actions}
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      {agentOpen ? (
        <PanelGroup direction="horizontal" autoSaveId="user-note-agent" className="user-note-with-agent">
          <Panel defaultSize={64} minSize={40} className="min-h-0 min-w-0">
            {workspace}
          </Panel>
          <NoteResizeHandle />
          <Panel defaultSize={36} minSize={26} className="min-h-0 min-w-0">
            <motion.div
              className="h-full min-h-0 min-w-0"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: DURATION.sidebar, ease: EASE.decelerate }}
            >
              {agentSessionId ? (
                <NoteAgentPanel noteId={noteId} sessionId={agentSessionId} onSettled={refreshWysiwyg} />
              ) : null}
            </motion.div>
          </Panel>
        </PanelGroup>
      ) : (
        workspace
      )}

      {confirmDelete && typeof document !== "undefined" ? (
        <DeleteNoteDialog
          title={note.title || "无标题笔记"}
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

function NoteResizeHandle() {
  return (
    <PanelResizeHandle data-no-drag className="document-workspace-resize-handle group relative outline-none">
      <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-data-[resize-handle-state=drag]:opacity-100">
        <span className="block h-7 w-1 rounded-full bg-[var(--md-sys-color-primary)]/50" />
      </span>
    </PanelResizeHandle>
  );
}

function NoteEditorBody({
  title,
  subjectId,
  agentOpen,
  tocOpen,
  mode,
  source,
  preview,
  wysiwyg,
  onTitleChange,
  onSubjectChange,
  onToggleAgent,
  onToggleToc,
}: {
  title: string;
  subjectId: string | null;
  agentOpen: boolean;
  tocOpen: boolean;
  mode: EditorMode;
  source: ReactNode;
  preview: ReactNode;
  wysiwyg: ReactNode;
  onTitleChange: (title: string) => void;
  onSubjectChange: (subjectId: string | null) => void;
  onToggleAgent: () => void;
  onToggleToc: () => void;
}) {
  return (
    <div className="user-note-editor">
      <div className="user-note-editor-head" data-no-drag>
        {!tocOpen ? (
          <button
            type="button"
            data-no-drag
            title="显示目录"
            aria-label="显示目录"
            className="user-note-chrome-btn"
            onClick={onToggleToc}
          >
            <List size={14} />
          </button>
        ) : null}
        <input
          className="user-note-title-input"
          value={title}
          placeholder="笔记标题"
          aria-label="笔记标题"
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <button
          type="button"
          data-no-drag
          title={agentOpen ? "收起笔记对话" : "打开笔记对话"}
          aria-label="笔记对话"
          aria-pressed={agentOpen}
          className={clsx("user-note-chrome-btn user-note-editor-ai", agentOpen && "is-active")}
          onClick={onToggleAgent}
        >
          <MessageSquare size={14} />
        </button>
        <SubjectPickerMenu value={subjectId} allowUnfiled onChange={onSubjectChange} />
      </div>

      {mode === "split" ? (
        <PanelGroup direction="horizontal" autoSaveId="user-note-split" className="user-note-split">
          <Panel defaultSize={50} minSize={22} className="min-h-0 min-w-0">
            {source}
          </Panel>
          <NoteResizeHandle />
          <Panel defaultSize={50} minSize={22} className="min-h-0 min-w-0">
            {preview}
          </Panel>
        </PanelGroup>
      ) : (
        <div className="user-note-single">{mode === "source" ? source : wysiwyg}</div>
      )}
    </div>
  );
}

function NoteSourcePane({
  refEl,
  value,
  onChange,
}: {
  refEl: { current: HTMLTextAreaElement | null };
  value: string;
  onChange: (next: string) => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    keepEditorShortcut(event);
    if (event.key !== "Tab" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    const el = event.currentTarget;
    const { selectionStart, selectionEnd } = el;
    onChange(`${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`);
    const caret = selectionStart + 2;
    requestAnimationFrame(() => {
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <textarea
      ref={refEl}
      data-no-drag
      className="user-note-source"
      value={value}
      spellCheck={false}
      aria-label="笔记正文（Markdown）"
      placeholder="用 Markdown 写作，支持 GFM 表格与 $KaTeX$ 公式…"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}

function NotePreviewPane({ markdown }: { markdown: string }) {
  return (
    <div className="user-note-preview prose-notes" data-no-drag>
      {markdown.trim() ? (
        <NoteRenderer content={markdown} />
      ) : (
        <p className="note-citation-status">还没有内容。在左侧开始写吧。</p>
      )}
    </div>
  );
}

function DeleteNoteDialog({
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
      <div role="alertdialog" aria-modal="true" aria-label="删除笔记" className="app-dialog">
        <div className="app-dialog-eyebrow">删除确认</div>
        <h2>删除「{title}」？</h2>
        <p>删除后无法从这台设备恢复；已登录时云端副本也会删除。</p>
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
