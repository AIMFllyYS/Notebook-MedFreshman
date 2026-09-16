"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { Columns2, Eye, PencilLine, Plus, Quote, Search, Trash2 } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import NoteRenderer from "@/components/notes/NoteRenderer";
import UserNoteIcon from "@/components/icons/UserNoteIcon";
import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { useWindowManager, type UserNotesWindowData } from "@/lib/hooks/useWindowManager";
import { SUBJECT_REGISTRY, subjectName } from "@/lib/content-data/subjects.registry";
import { citeUserNotes, openUserNotesLibrary } from "@/lib/user-notes/workspace";
import {
  filterUserNotes,
  markdownExcerpt,
  orderedUserNotes,
  relativeTime,
} from "@/lib/user-notes/list";
import { DEFAULT_USER_NOTE_TITLE } from "@/lib/user-notes/types";

// macOS 备忘录式的用户笔记工作区：左列表 + 右编辑/预览。
// 预览必须走 NoteRenderer（remark-math / rehype-katex / mhchem 与教材正文同一条管线），
// 不要换成 MessageContent —— 那是聊天管线。

type ViewMode = "edit" | "preview" | "split";

/** 内部宽度低于此值就没法并排放编辑器和预览，改成 tab 切换。 */
const SPLIT_MIN_WIDTH = 720;

const CHIP = "rounded-lg px-2 py-1 text-[11.5px] font-semibold transition-colors";
const FIELD =
  "w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--ink)] outline-none";

export default function UserNotesWorkspace({
  windowId,
  subjectId,
  noteId,
}: {
  windowId: string;
  subjectId: string;
  noteId: string | null;
}) {
  const byId = useUserNotes((s) => s.byId);
  const order = useUserNotes((s) => s.order);
  const create = useUserNotes((s) => s.create);
  const update = useUserNotes((s) => s.update);
  const remove = useUserNotes((s) => s.remove);
  const updateWindow = useWindowManager((s) => s.updateWindow);

  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("split");
  const [narrow, setNarrow] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const subjectNotes = useMemo(
    () => filterUserNotes(orderedUserNotes(byId, order), { subjectId }),
    [byId, order, subjectId],
  );
  const notes = useMemo(
    () => filterUserNotes(subjectNotes, { query }),
    [subjectNotes, query],
  );

  // 选中态的真相源是窗口 data，这样外部 openUserNotesLibrary(subject, id) 能直接切换。
  // 换科目后这篇笔记不再属于本窗口，回退到本科目第一篇，避免旧窗继续编辑别人的笔记。
  const activeId =
    noteId && byId[noteId]?.subjectId === subjectId ? noteId : (subjectNotes[0]?.id ?? null);
  const note = activeId ? byId[activeId] : undefined;

  const select = useCallback(
    (id: string | null) => {
      updateWindow(windowId, { data: { subjectId, noteId: id } satisfies UserNotesWindowData });
    },
    [updateWindow, windowId, subjectId],
  );

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setNarrow(el.clientWidth < SPLIT_MIN_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClose = useCallback(() => {
    // 关窗不删笔记，只收起工作区。
    useWindowManager.getState().closeWindow(windowId);
  }, [windowId]);

  const handleCreate = useCallback(() => {
    const id = create({ subjectId });
    select(id);
    setQuery("");
  }, [create, subjectId, select]);

  const handleDelete = useCallback(() => {
    if (!note) return;
    if (!window.confirm(`删除笔记「${note.title}」？删除后无法恢复。`)) return;
    const rest = subjectNotes.filter((n) => n.id !== note.id);
    remove(note.id);
    select(rest[0]?.id ?? null);
  }, [note, remove, select, subjectNotes]);

  const handleMarkdownKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Tab" || event.shiftKey || !activeId) return;
      event.preventDefault();
      const el = event.currentTarget;
      const { selectionStart, selectionEnd, value } = el;
      update(activeId, {
        markdown: `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`,
      });
      const caret = selectionStart + 2;
      // 受控 textarea 重渲染后光标会跳到末尾，等这一帧过去再放回原位。
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(caret, caret);
      });
    },
    [activeId, update],
  );

  const effectiveView: ViewMode = narrow && view === "split" ? "edit" : view;
  const showEditor = effectiveView === "edit" || effectiveView === "split";
  const showPreview = effectiveView === "preview" || effectiveView === "split";

  const actions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        data-no-drag
        disabled={!note}
        onClick={() => note && citeUserNotes([note.id])}
        title="引用这篇笔记到对话"
        className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-40"
      >
        <Quote size={15} />
      </button>
      <button
        type="button"
        data-no-drag
        disabled={!note}
        onClick={handleDelete}
        title="删除这篇笔记"
        className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <ManagedWindow
      windowId={windowId}
      title={`我的笔记 · ${subjectName(subjectId)}`}
      icon={<UserNoteIcon size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 420, minH: 360 }}
      overlayId={`user-notes-${subjectId}`}
      actions={actions}
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      <div ref={bodyRef} data-no-drag className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* ── 左侧：笔记列表 ─────────────────────────── */}
        <aside
          className="flex w-[220px] shrink-0 flex-col border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]"
          aria-label="笔记列表"
        >
          <div className="relative p-2">
            <Search
              size={13}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索笔记"
              aria-label="搜索笔记"
              className={`${FIELD} h-8 pl-7 pr-2 text-[12.5px]`}
            />
          </div>
          <div className="scroll-y min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {notes.length === 0 ? (
              <p className="px-1 py-6 text-center text-[12px] leading-relaxed text-[var(--ink-faint)]">
                {query ? "没有匹配的笔记" : "还没有笔记"}
              </p>
            ) : (
              notes.map((item) => {
                const selected = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(item.id)}
                    className={`press mb-1 w-full rounded-lg px-2 py-1.5 text-left transition-colors ${
                      selected
                        ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                        : "text-[var(--ink)] hover:bg-[var(--md-sys-color-surface-variant)]"
                    }`}
                  >
                    <span className="block truncate text-[12.5px] font-semibold">{item.title}</span>
                    <span className="block truncate text-[11px] text-[var(--ink-faint)]">
                      {relativeTime(item.updatedAt)} · {markdownExcerpt(item.markdown)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="border-t border-[var(--md-sys-color-outline-variant)] p-2">
            <button
              type="button"
              onClick={handleCreate}
              className="press flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--md-sys-color-primary)] px-2 py-1.5 text-[12.5px] font-semibold text-[var(--md-sys-color-on-primary)]"
            >
              <Plus size={14} /> 新建笔记
            </button>
          </div>
        </aside>

        {/* ── 右侧：编辑 / 预览 ──────────────────────── */}
        {note ? (
          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center gap-2 border-b border-[var(--md-sys-color-outline-variant)] px-3 py-2">
              <input
                value={note.title}
                onChange={(e) => update(note.id, { title: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) update(note.id, { title: DEFAULT_USER_NOTE_TITLE });
                }}
                aria-label="笔记标题"
                placeholder={DEFAULT_USER_NOTE_TITLE}
                className={`${FIELD} h-8 min-w-[140px] flex-1 px-2 text-[13.5px] font-semibold`}
              />
              <select
                value={note.subjectId}
                aria-label="所属科目"
                onChange={(e) => {
                  const next = e.target.value;
                  update(note.id, { subjectId: next });
                  // 换了科目，这篇笔记就不在本窗口的列表里了 —— 顺手把它的新工作区打开。
                  if (next !== subjectId) {
                    const rest = subjectNotes.filter((n) => n.id !== note.id);
                    select(rest[0]?.id ?? null);
                    openUserNotesLibrary(next, note.id);
                  }
                }}
                className={`${FIELD} h-8 max-w-[180px] px-2 text-[12px]`}
              >
                {SUBJECT_REGISTRY.map((s) => (
                  <option key={s.id} value={s.id}>
                    {subjectName(s.id)}
                  </option>
                ))}
              </select>
              <div
                className="flex items-center gap-0.5 rounded-lg bg-[var(--md-sys-color-surface-container)] p-0.5"
                role="group"
                aria-label="视图模式"
              >
                <ViewToggle icon={PencilLine} label="编辑" active={effectiveView === "edit"} onClick={() => setView("edit")} />
                <ViewToggle icon={Eye} label="预览" active={effectiveView === "preview"} onClick={() => setView("preview")} />
                {!narrow && (
                  <ViewToggle icon={Columns2} label="分栏" active={effectiveView === "split"} onClick={() => setView("split")} />
                )}
              </div>
            </header>

            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
              {showEditor && (
                <textarea
                  ref={textareaRef}
                  value={note.markdown}
                  onChange={(e) => update(note.id, { markdown: e.target.value })}
                  onKeyDown={handleMarkdownKeyDown}
                  spellCheck={false}
                  aria-label="笔记正文（Markdown）"
                  placeholder="用 Markdown 写笔记，$…$ 行内公式，$$…$$ 独立公式块。"
                  className={`min-h-0 min-w-0 flex-1 resize-none border-0 bg-transparent p-3 font-mono text-[13px] leading-[1.7] text-[var(--ink)] outline-none ${
                    showPreview ? "border-r border-[var(--md-sys-color-outline-variant)]" : ""
                  }`}
                />
              )}
              {showPreview && (
                <div className="scroll-y prose-notes min-h-0 min-w-0 flex-1 overflow-y-auto p-3">
                  <NoteRenderer content={note.markdown} />
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between border-t border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[11px] text-[var(--ink-faint)]">
              <span>{note.markdown.length} 字 · 已自动保存</span>
              <span>更新于 {relativeTime(note.updatedAt)}</span>
            </footer>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <UserNoteIcon size={30} className="text-[var(--ink-faint)]" />
            <p className="text-[13px] text-[var(--ink-soft)]">
              「{subjectName(subjectId)}」还没有笔记
            </p>
            <p className="max-w-[280px] text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
              新建一篇就能写 Markdown 与公式，随时引用到对话里。
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="press flex items-center gap-1.5 rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--md-sys-color-on-primary)]"
            >
              <Plus size={14} /> 新建笔记
            </button>
          </section>
        )}
      </div>
    </ManagedWindow>
  );
}

function ViewToggle({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press flex items-center gap-1 ${CHIP} ${
        active
          ? "bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)]"
          : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}
