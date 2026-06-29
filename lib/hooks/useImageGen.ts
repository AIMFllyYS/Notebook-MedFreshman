import { create } from "zustand";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

/**
 * AI 生图会话与窗口管理。
 * 流程：ImageGenCard 用户批准 → openViewer(session) 打开独立弹窗 → ImageGenViewer 调用
 * /api/image-gen 拉取图片 → updateSession 更新 status / images。
 *
 * 与 useArtifacts 不同：图片 URL 由硅基流动签名，**1 小时后失效**，故不持久化到 IndexedDB；
 * 重新打开会话时若图片已过期，用户可点「重新生成」重新拉取。
 */

export type ImageGenStatus = "idle" | "loading" | "done" | "error";

export interface ImageGenSession {
  id: string;
  prompt: string;
  title: string;
  size: string;
  count: number;
  status: ImageGenStatus;
  images: { url: string }[];
  error?: string;
  /** 创建时间戳，用于显示「已过期 X 分钟」提示。 */
  createdAt: number;
}

export interface ImageGenSessionInit {
  id: string;
  prompt: string;
  title: string;
  size?: string;
  count?: number;
}

interface ImageGenState {
  /** 当前打开的弹窗 session id；null 表示未打开。 */
  viewerId: string | null;
  sessions: Record<string, ImageGenSession>;

  openViewer: (init: ImageGenSessionInit) => void;
  closeViewer: () => void;
  bringToFront: (id: string) => void;
  updateSession: (id: string, patch: Partial<ImageGenSession>) => void;
  startLoading: (id: string) => void;
  removeSession: (id: string) => void;
}

function imageGenWindowId(id: string) {
  return `image-gen-viewer:${id}`;
}

function imageGenWindowGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 60, y: 80 }, size: { width: 720, height: 720 } };
  }
  const width = Math.min(720, Math.floor(window.innerWidth * 0.6));
  const height = Math.min(820, Math.floor(window.innerHeight * 0.88));
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.16)),
      y: Math.max(16, Math.floor(window.innerHeight * 0.04)),
    },
    size: { width, height },
  };
}

export const useImageGen = create<ImageGenState>((set, get) => ({
  viewerId: null,
  sessions: {},

  openViewer: (init) => {
    const id = init.id;
    const existing = get().sessions[id];
    const session: ImageGenSession = existing ?? {
      id,
      prompt: init.prompt,
      title: init.title || "AI 生图",
      size: init.size || "1024x1024",
      count: init.count || 1,
      status: "idle",
      images: [],
      createdAt: Date.now(),
    };

    const { pos, size } = imageGenWindowGeometry();
    useWindowManager.getState().openWindow({
      id: imageGenWindowId(id),
      type: "image-gen-viewer",
      title: session.title,
      pos,
      size,
      data: { imageGenId: id },
    });

    set((state) => ({
      viewerId: id,
      sessions: { ...state.sessions, [id]: session },
    }));
  },

  closeViewer: () => {
    const { viewerId } = get();
    if (viewerId) useWindowManager.getState().closeWindow(imageGenWindowId(viewerId));
    set({ viewerId: null });
  },

  bringToFront: (id) => {
    useWindowManager.getState().bringToFront(imageGenWindowId(id));
    set({ viewerId: id });
  },

  startLoading: (id) =>
    set((state) => {
      const cur = state.sessions[id];
      if (!cur) return state;
      return {
        sessions: {
          ...state.sessions,
          [id]: { ...cur, status: "loading", error: undefined },
        },
      };
    }),

  updateSession: (id, patch) =>
    set((state) => {
      const cur = state.sessions[id];
      if (!cur) return state;
      return {
        sessions: { ...state.sessions, [id]: { ...cur, ...patch } },
      };
    }),

  removeSession: (id) =>
    set((state) => {
      const next = { ...state.sessions };
      delete next[id];
      useWindowManager.getState().closeWindow(imageGenWindowId(id));
      return {
        sessions: next,
        viewerId: state.viewerId === id ? null : state.viewerId,
      };
    }),
}));

export { imageGenWindowId };
