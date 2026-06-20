import { create } from "zustand";

/** AI 生成的交互式 HTML 产物（会话内存态）。 */
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

  start: (id: string, title: string) => void;
  append: (id: string, delta: string) => void;
  finish: (id: string, html?: string) => void;
  fail: (id: string) => void;
  openViewer: (id: string) => void;
  closeViewer: () => void;
  /** 对指定 artifactId 建立独立 SSE 连接，接收子智能体流式输出。 */
  connectStream: (id: string) => void;
}

export const useArtifacts = create<ArtifactsState>((set) => ({
  order: [],
  byId: {},
  viewerId: null,

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

  connectStream: (id) => {
    const a = useArtifacts.getState().byId[id];
    if (!a || a.status === 'done' || a.status === 'error') return;

    (async () => {
      try {
        const res = await fetch(`/api/artifact-stream?id=${encodeURIComponent(id)}`);
        if (!res.ok || !res.body) return;

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
              const st = useArtifacts.getState();
              if (event.status === 'start') st.start(id, event.title || '交互演示');
              else if (event.status === 'delta') st.append(id, event.delta || '');
              else if (event.status === 'done') st.finish(id, event.html);
              else if (event.status === 'error') st.fail(id);
            } catch {
              // 忽略解析失败行
            }
          }
        }
      } catch {
        // 连接失败，静默处理（前端卡片会保持 streaming 状态直到超时）
      }
    })();
  },
}));
