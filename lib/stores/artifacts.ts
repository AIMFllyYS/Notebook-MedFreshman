import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { createPersistedStore } from "@/lib/stores/_persist";
import { scheduleCloudTombstone, scheduleCloudUpsert } from "@/lib/sync/schedule";
import { stripViewerId } from "@/lib/stores/windowPersist";

/**
 * HTML 演示（Artifact）store。链路：tools.ts renderInteractive → ArtifactCard → 本 store → ArtifactViewer。
 * viewerId 只表示「哪个演示浮窗开着」，浮窗由 AppShell 挂载，不是笔记区组件。
 */

/** AI 生成的交互式 HTML 产物（IndexedDB 持久化）。 */
export interface Artifact {
  id: string;
  title: string;
  html: string;
  status: "done";
  /** 生成时的思考过程，刷新后仍要能展开查看。 */
  reasoning?: string;
}

interface ArtifactsState {
  order: string[];
  byId: Record<string, Artifact>;
  /** 当前在弹窗中查看的产物 id；null 表示未打开。 */
  viewerId: string | null;
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  saveDone: (id: string, title: string, html: string, reasoning?: string) => void;
  openViewer: (id: string, title?: string) => void;
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

export const useArtifacts = createPersistedStore<ArtifactsState>(
    (set) => ({
      order: [],
      byId: {},
      viewerId: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      saveDone: (id, title, html, reasoning) =>
        set((s) => {
          const exists = s.byId[id];
          const order = exists ? s.order : [...s.order, id];
          const prev = s.byId[id];
          scheduleCloudUpsert("artifact", id);
          return {
            order,
            byId: {
              ...s.byId,
              [id]: {
                id,
                title,
                html,
                status: "done",
                reasoning: reasoning || prev?.reasoning || "",
              },
            },
          };
        }),

      /**
       * 打开（或复用）演示浮窗。
       *
       * **产物还没落盘也要开窗**：Agent 面里卡片是 silent 的（中间栏不画），生成中就能从右上
       * 参考列点进来——以前这里 `if (artifact)` 才开窗，于是生成中/生成失败时点一下毫无反应
       * （用户口径「不好使」）。现在窗口先开出来，ArtifactViewer 自己渲染「生成中 / 数据缺失」态。
       * `title` 供产物尚未落盘时给窗口一个像样的标题（调用方通常拿的是产物标题）。
       */
      openViewer: (id, title) =>
        set((state) => {
          const artifact = state.byId[id];
          const windowId = artifactWindowId(id);
          const wm = useWindowManager.getState();
          const existing = wm.windows.find((win) => win.id === windowId);
          const nextTitle = artifact?.title || title || windowId;
          if (existing) {
            wm.updateWindow(windowId, { title: nextTitle });
            if (existing.minimized) wm.restoreWindow(windowId);
            else wm.bringToFront(windowId);
          } else {
            const { pos, size } = artifactWindowGeometry();
            wm.openWindow({
              id: windowId,
              type: "artifact-viewer",
              title: nextTitle,
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
            } else {
              scheduleCloudTombstone("artifact", id);
            }
          }
          for (const id of Object.keys(s.byId)) {
            if (!keepSet.has(id) && !s.order.includes(id)) scheduleCloudTombstone("artifact", id);
          }
          return { byId: newById, order: newOrder };
        }),
    }),
    {
      name: PERSIST_KEYS.artifacts,
      storage: "idb",
      partialize: (s) => ({ order: s.order, byId: s.byId }),
      onRehydrateStorage: () => (state) => {
        if (state) stripViewerId(state);
        state?._setHasHydrated(true);
      },
    },
);
