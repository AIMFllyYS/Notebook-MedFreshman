import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { createPersistedStore } from "@/lib/stores/_persist";
import {
  NOTE_CONTENT_MAX,
  NOTE_TITLE_MAX,
  UNTITLED_NOTE_TITLE,
  type UserNote,
  type UserNoteExport,
} from "@/lib/notes/userNoteTypes";

// 用户自建笔记仓库（IndexedDB 持久化，沿用 useReviewCards / useArtifacts 范式）。
// 只存 Markdown 源码与元信息；编辑器的临时 UI 态（分栏比例、光标）不在此持久化。
//
// order 语义与复习卡一致：按创建顺序追加，列表展示时 reverse（最近的在前）。

const genId = () => Math.random().toString(36).slice(2, 11);

interface UserNotesState {
  byId: Record<string, UserNote>;
  order: string[];
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  /** 新建一篇笔记，返回其 id。seed 用于「引用生成的新笔记」这类带初始内容的场景。 */
  create: (subjectId: string, seed?: { title?: string; content?: string }) => string;
  /** 改标题 / 正文。updatedAt 自动刷新；越界内容会被截断而不是丢弃。 */
  update: (id: string, patch: { title?: string; content?: string }) => void;
  /** 删除一篇笔记。 */
  remove: (id: string) => void;
  /** 取某科目的笔记（最近更新在前）。 */
  bySubject: (subjectId: string) => UserNote[];
  /** 某科目最近更新的一篇，供「引用落到哪篇」决策使用。 */
  latestForSubject: (subjectId: string) => UserNote | null;
  /** 导出某科目 / 全部。 */
  exportSubject: (subjectId: string) => UserNoteExport;
  exportAll: () => UserNoteExport;
}

function clampTitle(title: string): string {
  const trimmed = title.replace(/[\r\n]+/g, " ").trim();
  return (trimmed || UNTITLED_NOTE_TITLE).slice(0, NOTE_TITLE_MAX);
}

function orderedNotes(state: UserNotesState): UserNote[] {
  return state.order.map((id) => state.byId[id]).filter(Boolean);
}

export const useUserNotes = createPersistedStore<UserNotesState>(
  (set, get) => ({
    byId: {},
    order: [],
    _hasHydrated: false,
    _setHasHydrated: (v) => set({ _hasHydrated: v }),

    create: (subjectId, seed) => {
      const id = genId();
      const now = Date.now();
      const note: UserNote = {
        id,
        subjectId,
        title: clampTitle(seed?.title ?? UNTITLED_NOTE_TITLE),
        content: (seed?.content ?? "").slice(0, NOTE_CONTENT_MAX),
        createdAt: now,
        updatedAt: now,
      };
      set((s) => ({ byId: { ...s.byId, [id]: note }, order: [...s.order, id] }));
      return id;
    },

    update: (id, patch) =>
      set((s) => {
        const prev = s.byId[id];
        if (!prev) return s;
        const next: UserNote = {
          ...prev,
          ...(patch.title !== undefined ? { title: clampTitle(patch.title) } : {}),
          ...(patch.content !== undefined ? { content: patch.content.slice(0, NOTE_CONTENT_MAX) } : {}),
          updatedAt: Date.now(),
        };
        if (next.title === prev.title && next.content === prev.content) return s;
        return { byId: { ...s.byId, [id]: next } };
      }),

    remove: (id) =>
      set((s) => {
        if (!s.byId[id]) return s;
        const byId = { ...s.byId };
        delete byId[id];
        return { byId, order: s.order.filter((x) => x !== id) };
      }),

    bySubject: (subjectId) =>
      orderedNotes(get())
        .filter((n) => n.subjectId === subjectId)
        .sort((a, b) => b.updatedAt - a.updatedAt),

    latestForSubject: (subjectId) => {
      const list = get().bySubject(subjectId);
      return list.length > 0 ? list[0] : null;
    },

    exportSubject: (subjectId) => {
      const notes = orderedNotes(get()).filter((n) => n.subjectId === subjectId);
      return {
        app: "gailvlun",
        kind: "user-notes",
        version: 1,
        exportedAt: Date.now(),
        scope: "subject",
        subjectId,
        count: notes.length,
        notes,
      };
    },

    exportAll: () => {
      const notes = orderedNotes(get());
      return {
        app: "gailvlun",
        kind: "user-notes",
        version: 1,
        exportedAt: Date.now(),
        scope: "all",
        count: notes.length,
        notes,
      };
    },
  }),
  {
    name: PERSIST_KEYS.userNotes,
    storage: "idb",
    partialize: (s) => ({ byId: s.byId, order: s.order }),
    onRehydrateStorage: () => (state) => {
      state?._setHasHydrated(true);
    },
  },
);
