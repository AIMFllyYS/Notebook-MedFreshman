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
  finish: (id: string) => void;
  fail: (id: string) => void;
  openViewer: (id: string) => void;
  closeViewer: () => void;
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

  finish: (id) =>
    set((s) => {
      const a = s.byId[id];
      if (!a) return s;
      return { byId: { ...s.byId, [id]: { ...a, status: "done" } } };
    }),

  fail: (id) =>
    set((s) => {
      const a = s.byId[id];
      if (!a) return s;
      return { byId: { ...s.byId, [id]: { ...a, status: "error" } } };
    }),

  openViewer: (id) => set({ viewerId: id }),
  closeViewer: () => set({ viewerId: null }),
}));
