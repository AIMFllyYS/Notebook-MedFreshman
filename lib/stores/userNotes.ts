import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { createPersistedStore } from "@/lib/stores/_persist";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useWindowManager } from "@/lib/stores/windowManager";
import {
  DEFAULT_NOTE_MARKDOWN,
  deriveNoteTitle,
  subjectLabel,
  USER_NOTE_LIBRARY_WINDOW_ID,
  userNoteWindowId,
  type NoteLibraryIntent,
  type UserNote,
} from "@/lib/notes/userNote";

// 个人笔记仓库（IndexedDB 持久化，复用 useReviewCards / useDocuments 范式）。
// 只存本机：与复习卡片一样**不**走 scheduleCloudUpsert —— 笔记是随手写的私货，
// 上云要先有冲突合并策略，这里刻意不做，避免多端互相覆盖。
//
// 窗口态（openEditorIds / library*）不持久化：窗口管理器本身也不持久化，
// 刷新后重开窗口比恢复一堆空壳窗口更符合预期。

const genId = () => Math.random().toString(36).slice(2, 11);

/** 笔记正文/标题/学科的增量补丁。 */
export interface UserNotePatch {
  title?: string;
  markdown?: string;
  subjectId?: string | null;
}

export interface OpenNoteLibraryOptions {
  subjectId?: string | null;
  intent?: NoteLibraryIntent;
}

interface UserNotesState {
  byId: Record<string, UserNote>;
  /** 创建顺序（旧 → 新）。 */
  order: string[];
  /** 已打开的编辑器窗口对应的笔记 id（可多开）。 */
  openEditorIds: string[];
  /** 引用到右侧主 Agent 后，主对话本轮可 updateUserNote 的那篇笔记；关掉编辑器后清空。 */
  agentEditingNoteId: string | null;
  setAgentEditingNoteId: (id: string | null) => void;
  /** 编辑窗内展开了微型 Agent 面板的笔记。不持久化。 */
  noteAgentOpenIds: string[];
  setNoteAgentOpen: (id: string, open: boolean) => void;
  /** 每篇笔记自己的干净会话；随笔记持久化，重开窗可续聊。 */
  noteAgentSessionById: Record<string, string>;
  ensureNoteAgentSession: (id: string) => string | null;
  libraryOpen: boolean;
  libraryIntent: NoteLibraryIntent;
  librarySubjectId: string | null;
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  /** 新建一篇笔记（不开窗），返回笔记 id。可带入 Agent 沉淀的短提纲。 */
  createNote: (subjectId: string | null, init?: { title?: string; markdown?: string }) => string;
  /** 改标题 / 正文 / 学科；未手动改过标题时标题跟随正文首个标题。 */
  updateNote: (id: string, patch: UserNotePatch) => void;
  /** 删除笔记，并关掉它可能打开着的编辑器窗口。 */
  removeNote: (id: string) => void;
  /** 打开编辑器；已打开则前置（最小化的先还原）。 */
  openEditor: (id: string) => void;
  closeEditor: (id: string) => void;
  openLibrary: (opts?: OpenNoteLibraryOptions) => void;
  closeLibrary: () => void;
}

/** 按更新时间倒序取笔记；subjectId 为 string 时只取该科，null/undefined 取全部。 */
export function selectUserNotes(
  byId: Record<string, UserNote>,
  order: string[],
  subjectId?: string | null,
): UserNote[] {
  return order
    .map((id) => byId[id])
    .filter((note): note is UserNote => Boolean(note))
    .filter((note) => (subjectId == null ? true : note.subjectId === subjectId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function editorWindowGeometry(openCount: number) {
  if (typeof window === "undefined") {
    return { pos: { x: 40, y: 72 }, size: { width: 900, height: 680 } };
  }
  const width = Math.min(960, Math.floor(window.innerWidth * 0.72));
  const height = Math.min(760, Math.floor(window.innerHeight * 0.86));
  const offset = (openCount % 6) * 26;
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.1) + offset),
      y: Math.max(16, Math.floor(window.innerHeight * 0.06) + offset),
    },
    size: { width, height },
  };
}

function libraryWindowGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 32, y: 64 }, size: { width: 860, height: 640 } };
  }
  const width = Math.min(880, Math.floor(window.innerWidth * 0.7));
  const height = Math.min(720, Math.floor(window.innerHeight * 0.84));
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.14)),
      y: Math.max(16, Math.floor(window.innerHeight * 0.08)),
    },
    size: { width, height },
  };
}

function libraryTitle(intent: NoteLibraryIntent, subjectId: string | null): string {
  if (intent === "cite") return "选择笔记";
  return subjectId ? `笔记 · ${subjectLabel(subjectId)}` : "笔记";
}

export const useUserNotes = createPersistedStore<UserNotesState>(
  (set, get) => ({
    byId: {},
    order: [],
    openEditorIds: [],
    agentEditingNoteId: null,
    setAgentEditingNoteId: (id) => set({ agentEditingNoteId: id }),
    noteAgentOpenIds: [],
    setNoteAgentOpen: (id, open) =>
      set((s) => {
        if (!s.byId[id]) return s;
        const has = s.noteAgentOpenIds.includes(id);
        if (open === has) return s;
        return {
          noteAgentOpenIds: open
            ? [...s.noteAgentOpenIds, id]
            : s.noteAgentOpenIds.filter((item) => item !== id),
        };
      }),
    noteAgentSessionById: {},
    ensureNoteAgentSession: (id) => {
      if (!get().byId[id]) return null;
      const existing = get().noteAgentSessionById[id];
      const history = useChatHistory.getState();
      if (existing && history.sessionsMeta.some((session) => session.id === existing)) {
        return existing;
      }
      const sessionId = history.createSession(undefined, "note");
      const title = get().byId[id]?.title.trim() || "笔记对话";
      history.updateSessionTitle(sessionId, title);
      set((s) => ({
        noteAgentSessionById: { ...s.noteAgentSessionById, [id]: sessionId },
      }));
      return sessionId;
    },
    libraryOpen: false,
    libraryIntent: "browse",
    librarySubjectId: null,
    _hasHydrated: false,
    _setHasHydrated: (v) => set({ _hasHydrated: v }),

    createNote: (subjectId, init) => {
      const id = genId();
      const now = Date.now();
      const markdown = init?.markdown?.trim() ? init.markdown : DEFAULT_NOTE_MARKDOWN;
      const title = init?.title?.trim() || deriveNoteTitle(markdown);
      const note: UserNote = {
        id,
        title,
        markdown,
        subjectId,
        createdAt: now,
        updatedAt: now,
      };
      set((s) => ({ byId: { ...s.byId, [id]: note }, order: [...s.order, id] }));
      return id;
    },

    updateNote: (id, patch) => {
      const prev = get().byId[id];
      if (!prev) return;
      const markdown = patch.markdown ?? prev.markdown;
      // 标题「自动跟随」：空标题，或仍等于旧正文推导出的标题，视为用户没手动改过。
      const autoTitled = !prev.title.trim() || prev.title === deriveNoteTitle(prev.markdown);
      const title =
        patch.title !== undefined
          ? patch.title
          : patch.markdown !== undefined && autoTitled
            ? deriveNoteTitle(markdown)
            : prev.title;
      const subjectId = patch.subjectId !== undefined ? patch.subjectId : prev.subjectId;
      if (title === prev.title && markdown === prev.markdown && subjectId === prev.subjectId) return;

      const next: UserNote = { ...prev, title, markdown, subjectId, updatedAt: Date.now() };
      set((s) => ({ byId: { ...s.byId, [id]: next } }));
      if (next.title !== prev.title) {
        useWindowManager.getState().updateWindow(userNoteWindowId(id), {
          title: next.title || "无标题笔记",
        });
      }
    },

    removeNote: (id) => {
      if (!get().byId[id]) return;
      const sessionId = get().noteAgentSessionById[id];
      if (sessionId) useChatHistory.getState().deleteSession(sessionId);
      useWindowManager.getState().closeWindow(userNoteWindowId(id));
      set((s) => {
        const byId = { ...s.byId };
        delete byId[id];
        const { [id]: _drop, ...noteAgentSessionById } = s.noteAgentSessionById;
        return {
          byId,
          order: s.order.filter((x) => x !== id),
          openEditorIds: s.openEditorIds.filter((x) => x !== id),
          noteAgentOpenIds: s.noteAgentOpenIds.filter((x) => x !== id),
          noteAgentSessionById,
          agentEditingNoteId: s.agentEditingNoteId === id ? null : s.agentEditingNoteId,
        };
      });
    },

    openEditor: (id) => {
      const note = get().byId[id];
      if (!note) return;
      const winId = userNoteWindowId(id);
      const manager = useWindowManager.getState();
      const existing = manager.windows.find((win) => win.id === winId);
      if (existing) {
        if (existing.minimized) manager.restoreWindow(winId);
        else manager.bringToFront(winId);
      } else {
        const { pos, size } = editorWindowGeometry(get().openEditorIds.length);
        manager.openWindow({
          id: winId,
          type: "user-note-editor",
          title: note.title || "无标题笔记",
          pos,
          size,
          data: { noteId: id },
        });
      }
      set((s) => ({
        openEditorIds: s.openEditorIds.includes(id) ? s.openEditorIds : [...s.openEditorIds, id],
      }));
    },

    closeEditor: (id) => {
      useWindowManager.getState().closeWindow(userNoteWindowId(id));
      set((s) => ({
        openEditorIds: s.openEditorIds.filter((x) => x !== id),
        noteAgentOpenIds: s.noteAgentOpenIds.filter((x) => x !== id),
        agentEditingNoteId: s.agentEditingNoteId === id ? null : s.agentEditingNoteId,
      }));
    },

    openLibrary: (opts) => {
      const subjectId = opts?.subjectId ?? null;
      const intent: NoteLibraryIntent = opts?.intent ?? "browse";
      const { pos, size } = libraryWindowGeometry();
      useWindowManager.getState().openWindow({
        id: USER_NOTE_LIBRARY_WINDOW_ID,
        type: "user-note-library",
        title: libraryTitle(intent, subjectId),
        pos,
        size,
        data: { subjectId, intent },
      });
      set({ libraryOpen: true, libraryIntent: intent, librarySubjectId: subjectId });
    },

    closeLibrary: () => {
      useWindowManager.getState().closeWindow(USER_NOTE_LIBRARY_WINDOW_ID);
      set({ libraryOpen: false });
    },
  }),
  {
    name: PERSIST_KEYS.userNotes,
    storage: "idb",
    partialize: (s) => ({ byId: s.byId, order: s.order, noteAgentSessionById: s.noteAgentSessionById }),
    onRehydrateStorage: () => (state) => {
      if (state && !state.noteAgentSessionById) state.noteAgentSessionById = {};
      state?._setHasHydrated(true);
    },
  },
);
