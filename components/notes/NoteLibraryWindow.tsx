"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, PenLine, Plus, Quote } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import DocumentWorkspace from "@/components/window/DocumentWorkspace";
import NoteRenderer from "@/components/notes/NoteRenderer";
import NotebookFormulaIcon from "@/components/icons/NotebookFormulaIcon";
import { useCiteToChat } from "@/components/notes/useCiteToChat";
import { useNoteCitations } from "@/lib/stores/noteCitations";
import { useUserNotes, selectUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import { createAndOpenNote } from "@/lib/notes/openUserNote";
import { noteBreadcrumb, parseNotePath } from "@/lib/content/notePath";
import {
  formatNoteQuote,
  listCourseNoteHits,
  plainSnippet,
  subjectLabel,
  USER_NOTE_LIBRARY_WINDOW_ID,
  type CourseNoteHit,
  type UserNote,
} from "@/lib/notes/userNote";

type LibraryTab = "mine" | "course";

function formatUpdatedAt(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function NoteLibraryWindow() {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === USER_NOTE_LIBRARY_WINDOW_ID));
  const intent = useUserNotes((s) => s.libraryIntent);
  const subjectId = useUserNotes((s) => s.librarySubjectId);
  const byId = useUserNotes((s) => s.byId);
  const order = useUserNotes((s) => s.order);
  const openEditor = useUserNotes((s) => s.openEditor);
  const closeLibrary = useUserNotes((s) => s.closeLibrary);

  const [tab, setTab] = useState<LibraryTab>("mine");
  const [query, setQuery] = useState("");
  const [allSubjects, setAllSubjects] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeCoursePath, setActiveCoursePath] = useState<string | null>(null);
  const { cited, cite } = useCiteToChat();

  const keyword = query.trim().toLowerCase();

  const notes = useMemo(
    () => selectUserNotes(byId, order, allSubjects ? null : subjectId),
    [allSubjects, byId, order, subjectId],
  );
  const visibleNotes = useMemo(
    () => (keyword ? notes.filter((note) => note.title.toLowerCase().includes(keyword)) : notes),
    [keyword, notes],
  );

  const courseHits = useMemo(() => (subjectId ? listCourseNoteHits(subjectId) : []), [subjectId]);
  const visibleHits = useMemo(
    () => (keyword ? courseHits.filter((hit) => hit.title.toLowerCase().includes(keyword)) : courseHits),
    [courseHits, keyword],
  );

  const showTabs = intent === "cite";
  const activeTab: LibraryTab = showTabs ? tab : "mine";

  const activeNote =
    visibleNotes.find((note) => note.id === activeNoteId) ?? visibleNotes[0] ?? null;
  const activeHit = visibleHits.find((hit) => hit.path === activeCoursePath) ?? visibleHits[0] ?? null;

  if (!managed) return null;

  const handleCreate = () => {
    // 走公共入口，新笔记绑定当前笔记库的科目（「全部科目」视图下不归档）。
    const id = createAndOpenNote(allSubjects ? null : subjectId);
    setActiveNoteId(id);
    setTab("mine");
  };

  const outline =
    activeTab === "mine"
      ? visibleNotes.map((note) => ({
          id: note.id,
          title: note.title || "无标题笔记",
          meta: `${subjectLabel(note.subjectId)} · ${formatUpdatedAt(note.updatedAt)}`,
        }))
      : visibleHits.map((hit) => ({
          id: hit.path,
          kindLabel: hit.categoryName,
          title: hit.title,
          meta: plainSnippet(hit.snippet, 60) || hit.path,
        }));

  const toolbar = (
    <div className="user-note-library-toolbar" data-no-drag>
      {showTabs ? (
        <div className="user-note-modes" role="group" aria-label="笔记来源">
          <button
            type="button"
            data-no-drag
            aria-pressed={activeTab === "mine"}
            className={`user-note-mode${activeTab === "mine" ? " is-active" : ""}`}
            onClick={() => setTab("mine")}
          >
            我的笔记
          </button>
          <button
            type="button"
            data-no-drag
            aria-pressed={activeTab === "course"}
            className={`user-note-mode${activeTab === "course" ? " is-active" : ""}`}
            onClick={() => setTab("course")}
          >
            课程笔记
          </button>
        </div>
      ) : null}

      <input
        data-no-drag
        className="user-note-search"
        value={query}
        placeholder="按标题搜索…"
        aria-label="按标题搜索笔记"
        onChange={(event) => setQuery(event.target.value)}
      />

      {activeTab === "mine" && subjectId ? (
        <button
          type="button"
          data-no-drag
          aria-pressed={allSubjects}
          className={`user-note-chip${allSubjects ? " is-active" : ""}`}
          onClick={() => setAllSubjects((on) => !on)}
        >
          全部科目
        </button>
      ) : null}

      <button type="button" data-no-drag className="user-note-toolbar-primary" onClick={handleCreate}>
        <Plus size={13} /> 新建笔记
      </button>
    </div>
  );

  return (
    <ManagedWindow
      windowId={USER_NOTE_LIBRARY_WINDOW_ID}
      title={managed.title}
      icon={<NotebookFormulaIcon size={15} />}
      onClose={closeLibrary}
      fullscreenTarget="notes"
      minSize={{ minW: 520, minH: 360 }}
      overlayId="user-note-library"
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      <DocumentWorkspace
        outlineLabel={activeTab === "mine" ? "我的笔记" : "课程笔记"}
        outline={outline}
        activeId={activeTab === "mine" ? (activeNote?.id ?? "") : (activeHit?.path ?? "")}
        onSelect={(id) => (activeTab === "mine" ? setActiveNoteId(id) : setActiveCoursePath(id))}
        toolbar={toolbar}
      >
        {activeTab === "mine" ? (
          <UserNoteStage
            note={activeNote}
            cited={cited}
            onCite={(note) => cite(formatNoteQuote(note))}
            onOpen={(note) => openEditor(note.id)}
          />
        ) : (
          <CourseNoteStage hit={activeHit} hasSubject={Boolean(subjectId)} />
        )}
      </DocumentWorkspace>
    </ManagedWindow>
  );
}

function UserNoteStage({
  note,
  cited,
  onCite,
  onOpen,
}: {
  note: UserNote | null;
  cited: boolean;
  onCite: (note: UserNote) => void;
  onOpen: (note: UserNote) => void;
}) {
  if (!note) {
    return (
      <div className="user-note-stage">
        <p className="user-note-empty">这一科还没有笔记。点『新建笔记』开始写。</p>
      </div>
    );
  }

  return (
    <div className="user-note-stage">
      <div className="user-note-stage-head">
        <div className="user-note-stage-title">{note.title || "无标题笔记"}</div>
        <div className="user-note-stage-meta">
          {subjectLabel(note.subjectId)} · 更新于 {formatUpdatedAt(note.updatedAt)}
        </div>
        <div className="user-note-stage-actions" data-no-drag>
          <button type="button" data-no-drag className="user-note-action" onClick={() => onOpen(note)}>
            <PenLine size={13} /> 打开编辑
          </button>
          <button type="button" data-no-drag className="user-note-action is-primary" onClick={() => onCite(note)}>
            {cited ? <Check size={13} /> : <Quote size={13} />} {cited ? "已引用到对话" : "引用到对话"}
          </button>
        </div>
      </div>
      <div className="user-note-preview prose-notes">
        {note.markdown.trim() ? (
          <NoteRenderer content={note.markdown} />
        ) : (
          <p className="note-citation-status">这篇笔记还是空的。</p>
        )}
      </div>
    </div>
  );
}

function CourseNoteStage({ hit, hasSubject }: { hit: CourseNoteHit | null; hasSubject: boolean }) {
  const { cited, cite } = useCiteToChat();
  if (!hit) {
    return (
      <div className="user-note-stage">
        <p className="user-note-empty">
          {hasSubject ? "没有匹配的课程笔记。" : "先进入某一科，才能浏览它的课程笔记。"}
        </p>
      </div>
    );
  }

  const parsed = parseNotePath(hit.path);
  const breadcrumb = parsed ? noteBreadcrumb(parsed, hit.title) : hit.title;

  return (
    <div className="user-note-stage">
      <div className="user-note-stage-head">
        <div className="user-note-stage-title">{hit.title}</div>
        <div className="user-note-stage-meta">{breadcrumb}</div>
        <div className="user-note-stage-actions" data-no-drag>
          <button
            type="button"
            data-no-drag
            className="user-note-action is-primary"
            onClick={() =>
              useNoteCitations
                .getState()
                .openViewer([{ title: hit.title, path: hit.path, snippet: hit.snippet }], hit.path)
            }
          >
            <BookOpen size={13} /> 查看引用
          </button>
          <button
            type="button"
            data-no-drag
            className="user-note-action"
            onClick={() => cite([`【课程笔记】${breadcrumb}`, hit.snippet || hit.path].join("\n"))}
          >
            {cited ? <Check size={13} /> : <Quote size={13} />} {cited ? "已引用到对话" : "引用到对话"}
          </button>
        </div>
      </div>
      <div className="user-note-preview">
        {hit.snippet ? (
          <p className="user-note-course-summary">{hit.snippet}</p>
        ) : (
          <p className="note-citation-status">这条课程笔记没有摘要，点「查看引用」读正文。</p>
        )}
      </div>
    </div>
  );
}
