import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage, PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

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

function artifactWindowGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 24, y: 64 }, size: { width: 860, height: 720 } };
  }
  const width = Math.min(860, Math.floor(window.innerWidth * 0.72));
  const height = Math.floor(window.innerHeight * 0.94);
  return {
    pos: { x: Math.max(16, Math.floor(window.innerWidth * 0.02)), y: Math.max(16, Math.floor(window.innerHeight * 0.03)) },
    size: { width, height },
  };
}

function artifactWindowId(id: string) {
  return `artifact-viewer:${id}`;
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

      openViewer: (id) =>
        set((state) => {
          const artifact = state.byId[id];
          if (artifact) {
            const { pos, size } = artifactWindowGeometry();
            useWindowManager.getState().openWindow({
              id: artifactWindowId(id),
              type: "artifact-viewer",
              title: artifact.title,
              pos,
              size,
              data: { artifactId: id },
            });
          }
          return { viewerId: id };
        }),
      closeViewer: () =>
        set((state) => {
          if (state.viewerId) useWindowManager.getState().closeWindow(artifactWindowId(state.viewerId));
          return { viewerId: null };
        }),

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
