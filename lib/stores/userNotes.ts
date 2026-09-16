import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { createPersistedStore } from "@/lib/stores/_persist";
import { useComposerCitations, userNoteCitationId } from "@/lib/stores/composerCitations";
import {
  DEFAULT_USER_NOTE_MARKDOWN,
  DEFAULT_USER_NOTE_TITLE,
  type UserNote,
} from "@/lib/user-notes/types";
import { filterUserNotes, orderedUserNotes } from "@/lib/user-notes/list";

// 用户自己写的 Markdown 笔记仓库（IndexedDB 持久化，复用 useReviewCards 范式）。
// 与教材笔记（content/）无关，也不进云同步：本机数据，和复习卡一个待遇。

const genId = () => Math.random().toString(36).slice(2, 11);

interface UserNotesState {
  byId: Record<string, UserNote>;
  order: string[];
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  /** 新建一篇笔记，返回 note id。缺省标题「未命名笔记」+ 带公式示例的起始模板。 */
  create: (input: { subjectId: string; title?: string; markdown?: string }) => string;
  update: (id: string, patch: Partial<Pick<UserNote, "title" | "markdown" | "subjectId">>) => void;
  remove: (id: string) => void;
  /** 取某科目下的笔记（按 updatedAt 倒序，最近改的在前）。 */
  bySubject: (subjectId: string) => UserNote[];
  /** 标题 + 正文全文检索，大小写不敏感；传 subjectId 则限定科目。 */
  search: (query: string, subjectId?: string) => UserNote[];
}

export const useUserNotes = createPersistedStore<UserNotesState>(
  (set, get) => ({
    byId: {},
    order: [],
    _hasHydrated: false,
    _setHasHydrated: (v) => set({ _hasHydrated: v }),

    create: ({ subjectId, title, markdown }) => {
      const id = genId();
      const now = Date.now();
      const note: UserNote = {
        id,
        title: title?.trim() || DEFAULT_USER_NOTE_TITLE,
        markdown: markdown ?? DEFAULT_USER_NOTE_MARKDOWN,
        subjectId,
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
        return { byId: { ...s.byId, [id]: { ...prev, ...patch, updatedAt: Date.now() } } };
      }),

    remove: (id) => {
      // 笔记没了，输入框里的引用芯片也不能留着（发送时会取不到正文）。
      useComposerCitations.getState().removeCitation(userNoteCitationId(id));
      set((s) => {
        if (!s.byId[id]) return s;
        const byId = { ...s.byId };
        delete byId[id];
        return { byId, order: s.order.filter((x) => x !== id) };
      });
    },

    bySubject: (subjectId) => {
      const { byId, order } = get();
      return filterUserNotes(orderedUserNotes(byId, order), { subjectId });
    },

    search: (query, subjectId) => {
      const { byId, order } = get();
      return filterUserNotes(orderedUserNotes(byId, order), { query, subjectId });
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
