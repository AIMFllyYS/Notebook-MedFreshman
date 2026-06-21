import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage, PERSIST_KEYS } from "@/lib/storage/idbStorage";

// AI 生成的交互式 HTML 产物 —— 已从纯内存态升级为 IndexedDB 持久化。
// 刷新/重启后 artifact HTML 从 IndexedDB 恢复，不再"已失效"。
// viewerId 为临时 UI 状态，不持久化。
// connectStream 含 30s 超时兜底，防止子智能体无响应时永久转圈。
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
  /** 对指定 artifactId 建立独立 SSE 连接，接收子智能体流式输出。 */
  connectStream: (id: string) => void;
}

export const useArtifacts = create<ArtifactsState>()(
  persist(
    (set, get) => ({
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

      connectStream: (id) => {
        const a = get().byId[id];
        if (!a || a.status === 'done' || a.status === 'error') return;

        // 超时兜底：30s 内未收到 done/error → 标记失败，防止永久转圈
        const timeout = setTimeout(() => {
          const cur = get().byId[id];
          if (cur && cur.status === 'streaming') {
            get().fail(id);
          }
        }, 30000);

        (async () => {
          try {
            const res = await fetch(`/api/artifact-stream?id=${encodeURIComponent(id)}`);
            if (!res.ok || !res.body) { clearTimeout(timeout); return; }

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.startsWith('data:')) continue;
                const data = line.slice(5).trim();
                if (!data || data === '[DONE]') continue;
                try {
                  const event = JSON.parse(data);
                  if (event.type !== 'artifact') continue;
                  const st = get();
                  if (event.status === 'start') st.start(id, event.title || '交互演示');
                  else if (event.status === 'delta') st.append(id, event.delta || '');
                  else if (event.status === 'done') { clearTimeout(timeout); st.finish(id, event.html); }
                  else if (event.status === 'error') { clearTimeout(timeout); st.fail(id); }
                } catch {
                  // 忽略解析失败行
                }
              }
            }
          } catch {
            // 连接失败，超时机制会兜底标记 error
          }
        })();
      },
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
