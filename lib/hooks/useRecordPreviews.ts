import { create } from "zustand";

// 「记录」预览浮窗的临时态（内存，不持久化）。每个预览窗绑定一张 ReviewCard（cardId）。
// 卡片本身已在 useReviewCards 持久化；本 store 只管「窗口开/关/层级/位置」这类 UI 态。

export interface RecordPreview {
  id: string;
  cardId: string;
  pos: { x: number; y: number };
  z: number;
}

const WIDTH = 420;
const HEIGHT = 520;
const genId = () => Math.random().toString(36).slice(2, 11);

interface RecordPreviewsState {
  previews: RecordPreview[];
  topZ: number;
  open: (cardId: string, anchor: { x: number; y: number }) => string;
  close: (id: string) => void;
  move: (id: string, dx: number, dy: number) => void;
  bringToFront: (id: string) => void;
}

export const useRecordPreviews = create<RecordPreviewsState>((set) => ({
  previews: [],
  topZ: 4000,

  open: (cardId, anchor) => {
    const id = genId();
    set((s) => {
      const off = (s.previews.length % 6) * 30;
      const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
      const vh = typeof window !== "undefined" ? window.innerHeight : 900;
      let x = Math.min(anchor.x + 16 + off, vw - WIDTH - 16);
      let y = Math.min(anchor.y - 40 + off, vh - HEIGHT - 16);
      x = Math.max(16, x);
      y = Math.max(16, y);
      const z = s.topZ + 1;
      return { previews: [...s.previews, { id, cardId, pos: { x, y }, z }], topZ: z };
    });
    return id;
  },

  close: (id) => set((s) => ({ previews: s.previews.filter((p) => p.id !== id) })),

  move: (id, dx, dy) =>
    set((s) => ({
      previews: s.previews.map((p) =>
        p.id === id ? { ...p, pos: { x: p.pos.x + dx, y: p.pos.y + dy } } : p,
      ),
    })),

  bringToFront: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, previews: s.previews.map((p) => (p.id === id ? { ...p, z } : p)) };
    }),
}));

export const RECORD_PREVIEW_SIZE = { width: WIDTH, height: HEIGHT };
