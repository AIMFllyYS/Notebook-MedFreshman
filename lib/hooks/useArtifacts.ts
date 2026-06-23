import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage, PERSIST_KEYS } from "@/lib/storage/idbStorage";

// AI 生成的交互式 HTML 产物最终态存储。
// 流式 delta 由 ArtifactCard 本地 state 承接，完成后才写入 IndexedDB。
// viewerId 为临时 UI 状态，不持久化。

/** AI 生成的交互式 HTML 产物（IndexedDB 持久化）。 */
export interface Artifact {
  id: string;
  title: string;
  html: string;
  status: "done";
}

interface ArtifactsState {
  order: string[];
  byId: Record<string, Artifact>;
  /** 当前在弹窗中查看的产物 id；null 表示未打开。 */
  viewerId: string | null;
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  saveDone: (id: string, title: string, html: string) => void;
  openViewer: (id: string) => void;
  closeViewer: () => void;
  /** 删除不在 keepIds 中的 artifact，用于跨 store 孤儿清理。 */
  prune: (keepIds: string[]) => void;
}

export const useArtifacts = create<ArtifactsState>()(
  persist(
    (set) => ({
      order: [],
      byId: {},
      viewerId: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      saveDone: (id, title, html) =>
        set((s) => {
          const exists = s.byId[id];
          const order = exists ? s.order : [...s.order, id];
          return {
            order,
            byId: {
              ...s.byId,
              [id]: { id, title, html, status: "done" },
            },
          };
        }),

      openViewer: (id) => set({ viewerId: id }),
      closeViewer: () => set({ viewerId: null }),

      prune: (keepIds) =>
        set((s) => {
          const keepSet = new Set(keepIds);
          const newById: Record<string, Artifact> = {};
          const newOrder: string[] = [];
          for (const id of s.order) {
            if (keepSet.has(id)) {
              newById[id] = s.byId[id];
              newOrder.push(id);
            }
          }
          return { byId: newById, order: newOrder };
        }),
    }),
    {
      name: PERSIST_KEYS.artifacts,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ order: s.order, byId: s.byId }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);
