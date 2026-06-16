import { create } from "zustand";
import type { VideoEntry } from "@/lib/content/types";

export type RightTab = "ai" | "video" | "interactive";
export type ModelTier = "pro" | "flash";

export interface OutboundMessage {
  /** 要发送给 AI 的完整内容（可能含划词引用） */
  content: string;
  /** 触发发送的递增序号；ChatPanel 监听其变化以发起请求 */
  nonce: number;
}

interface AppState {
  // ── 导航 ──────────────────────────────────────────────
  activeChapterId: string;
  activeSectionId: string;
  setActiveSection: (chapterId: string, sectionId: string) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  expandedChapters: Record<string, boolean>;
  toggleChapter: (id: string) => void;

  // ── 右侧面板 ──────────────────────────────────────────
  rightTab: RightTab;
  setRightTab: (t: RightTab) => void;

  // ── AI 对话 ───────────────────────────────────────────
  model: ModelTier;
  setModel: (m: ModelTier) => void;

  /** 划词 / 外部触发的待发送消息 */
  outbound: OutboundMessage | null;
  /** 把一段文本送入 AI 对话并切到 AI Tab（用于划词问答与建议追问） */
  sendToChat: (content: string) => void;
  clearOutbound: () => void;

  // ── 小窗视频（PiP）─────────────────────────────────────
  /** 当前在浮动小窗播放的视频；null 表示未打开 */
  pipVideo: VideoEntry | null;
  openPip: (v: VideoEntry) => void;
  closePip: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeChapterId: "ch01",
  activeSectionId: "1.1",
  setActiveSection: (chapterId, sectionId) =>
    set({ activeChapterId: chapterId, activeSectionId: sectionId }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  expandedChapters: { ch01: true },
  toggleChapter: (id) =>
    set((s) => ({
      expandedChapters: { ...s.expandedChapters, [id]: !s.expandedChapters[id] },
    })),

  rightTab: "ai",
  setRightTab: (t) => set({ rightTab: t }),

  model: "pro",
  setModel: (m) => set({ model: m }),

  outbound: null,
  sendToChat: (content) =>
    set((s) => ({
      rightTab: "ai",
      outbound: { content, nonce: (s.outbound?.nonce ?? 0) + 1 },
    })),
  clearOutbound: () => set({ outbound: null }),

  pipVideo: null,
  openPip: (v) => set({ pipVideo: v }),
  closePip: () => set({ pipVideo: null }),
}));
