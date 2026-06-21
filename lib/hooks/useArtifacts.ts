import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage, PERSIST_KEYS } from "@/lib/storage/idbStorage";

// AI 生成的交互式 HTML 产物 —— 已从纯内存态升级为 IndexedDB 持久化。
// 刷新/重启后 artifact HTML 从 IndexedDB 恢复，不再"已失效"。
// viewerId 为临时 UI 状态，不持久化。
// artifact 事件通过主 /api/chat SSE 流内联推送，无需独立 SSE 端点。
/** AI 生成的交互式 HTML 产物（IndexedDB 持久化）。 */
export interface Artifact {
  id: string;
  title: string;
  html: string;
  status: "streaming" | "done" | "error";
}

interface ArtifactsState {
  order: string[];
  byId: Record<string, Artifact>;
  /** 当前在弹窗中查看的产物 id；null 表示未打开。 */
  viewerId: string | null;
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  start: (id: string, title: string) => void;
  append: (id: string, delta: string) => void;
  finish: (id: string, html?: string) => void;
  fail: (id: string) => void;
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

      start: (id, title) =>
        set((s) => {
          if (s.byId[id]) return s;
          return {
            order: [...s.order, id],
            byId: { ...s.byId, [id]: { id, title, html: "", status: "streaming" } },
          };
        }),

      append: (id, delta) =>
        set((s) => {
          const a = s.byId[id];
          if (!a) return s;
          return { byId: { ...s.byId, [id]: { ...a, html: a.html + delta } } };
        }),

      finish: (id, html) =>
        set((s) => {
          const a = s.byId[id];
          if (!a) return s;
          return { byId: { ...s.byId, [id]: { ...a, status: "done", html: html ?? a.html } } };
        }),

      fail: (id) =>
        set((s) => {
          const a = s.byId[id];
          if (!a) return s;
          return { byId: { ...s.byId, [id]: { ...a, status: "error" } } };
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
