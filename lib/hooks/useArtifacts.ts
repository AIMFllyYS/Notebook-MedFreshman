import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage, PERSIST_KEYS } from "@/lib/storage/idbStorage";

// AI 生成的交互式 HTML 产物 —— 已从纯内存态升级为 IndexedDB 持久化。
// 刷新/重启后 artifact HTML 从 IndexedDB 恢复，不再"已失效"。
// viewerId 为临时 UI 状态，不持久化。
// artifact 事件通过主 /api/chat SSE 流内联推送，无需独立 SSE 端点。

/**
 * Debounce 包装的 IndexedDB 存储适配器。
 * 流式 append 期间 Zustand persist 每次 set() 都会触发 setItem()，
 * debounce 800ms 将数百次写入合并为一次，避免 O(n²) 序列化开销。
 * flushArtifactsWrite() 供 finish/fail 调用以立即持久化最终状态。
 */
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
let _pendingName = "";
let _pendingValue = "";
const DEBOUNCE_MS = 800;

function flushArtifactsWrite(): void {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  if (_pendingName) {
    void idbStorage.setItem(_pendingName, _pendingValue);
    _pendingName = "";
    _pendingValue = "";
  }
}

const debouncedArtifactsStorage = {
  getItem: (name: string) => idbStorage.getItem(name),
  setItem: (name: string, value: string) => {
    _pendingName = name;
    _pendingValue = value;
    if (_debounceTimer) clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      _debounceTimer = null;
      if (_pendingName) {
        void idbStorage.setItem(_pendingName, _pendingValue);
        _pendingName = "";
        _pendingValue = "";
      }
    }, DEBOUNCE_MS);
  },
  removeItem: (name: string) => {
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
      _debounceTimer = null;
      _pendingName = "";
      _pendingValue = "";
    }
    void idbStorage.removeItem(name);
  },
};

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

      finish: (id, html) => {
        set((s) => {
          const a = s.byId[id];
          if (!a) return s;
          return { byId: { ...s.byId, [id]: { ...a, status: "done", html: html ?? a.html } } };
        });
        flushArtifactsWrite();
      },

      fail: (id) => {
        set((s) => {
          const a = s.byId[id];
          if (!a) return s;
          return { byId: { ...s.byId, [id]: { ...a, status: "error" } } };
        });
        flushArtifactsWrite();
      },

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
      storage: createJSONStorage(() => debouncedArtifactsStorage),
      partialize: (s) => ({ order: s.order, byId: s.byId }),
      // 自定义 merge：水合时深合并 byId 和 order，current state 优先于 persisted state。
      // 防止水合竞态：若 streaming artifact 已在内存中，不会被 IndexedDB 旧数据覆盖。
      merge: (persistedState, currentState) => {
        const p = (persistedState ?? {}) as { order?: string[]; byId?: Record<string, Artifact> };
        const persistedById = p.byId ?? {};
        const currentById = currentState.byId ?? {};
        const mergedById = { ...persistedById, ...currentById };
        const mergedOrder = [...new Set([...(p.order ?? []), ...currentState.order])];
        return {
          ...currentState,
          byId: mergedById,
          order: mergedOrder,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);
