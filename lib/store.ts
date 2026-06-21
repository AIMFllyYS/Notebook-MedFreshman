import { create } from "zustand";
import type { VideoEntry } from "@/lib/content/types";
import type { SubjectId } from "@/lib/types/content";

export type RightTab = "ai" | "video" | "interactive" | "browser";

export interface OutboundMessage {
  /** 要发送给 AI 的完整内容（可能含划词引用） */
  content: string;
  /** 触发发送的递增序号；ChatPanel 监听其变化以发起请求 */
  nonce: number;
}

/** detail/recording 分类下的 quiz key 推导。recording 直接用 itemId（"rec-01"）。 */
function deriveChapterId(categoryId: string, itemId: string): string {
  if (categoryId === "recording") return itemId;
  if (categoryId !== "detail") return "";
  const n = parseInt(itemId.split(".")[0], 10);
  return Number.isNaN(n) ? "" : `ch${String(n).padStart(2, "0")}`;
}

interface AppState {
  // ── 导航（始终反映当前路由，由 AppShell 统一同步）──────────
  activeSubjectId: SubjectId;
  /** 当前分类（detail/recording/summary/textbook…），用于 AI 上下文 */
  activeCategoryId: string;
  /** 当前内容项原始 id（如 "1.1" / "rec-01"），用于 AI 上下文 */
  activeItemId: string;
  /** 仅 detail 分类下有意义；非 detail 为 ""，使右侧视频/交互/例题显示空态而非串科目 */
  activeChapterId: string;
  activeSectionId: string;
  setActiveSubject: (s: SubjectId) => void;
  /** 由路由 (subjectId, categoryId, itemId) 统一驱动导航状态 */
  setActiveRoute: (subjectId: SubjectId, categoryId: string, itemId: string) => void;

  // 侧边栏折叠（单一真相源，驱动 react-resizable-panels 的左面板）
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  /** 已展开的科目/分类/章节键。科目用 `${subjectId}`，分类用 `${subjectId}-${categoryId}`，
   *  叶子用 `${subjectId}/${categoryId}/${itemId}`（命名空间化，避免跨学科碰撞）。 */
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;

  // ── 右侧面板 ──────────────────────────────────────────
  rightTab: RightTab;
  setRightTab: (t: RightTab) => void;

  // ── AI 对话 ───────────────────────────────────────────
  /** 划词 / 外部触发的待发送消息 */
  outbound: OutboundMessage | null;
  /** 把一段文本送入 AI 对话并切到 AI Tab（用于划词问答与建议追问） */
  sendToChat: (content: string) => void;
  clearOutbound: () => void;

  // ── 小窗视频（PiP）─────────────────────────────────────
  /** 当前在浮动小窗播放的视频；null 表示未打开 */
  pipVideo: VideoEntry | null;
  /** 小窗开始播放位置（秒），用于内嵌→小窗续播 */
  pipStartTime: number;
  /** 小窗关闭时记录的播放位置，供内嵌续播 */
  pipReturnTime: number | null;
  /** 浮窗几何状态记忆（跨视频关闭/打开持久化） */
  pipGeometry: { x: number; y: number; width: number; height: number } | null;
  /** 保存浮窗几何状态 */
  setPipGeometry: (g: { x: number; y: number; width: number; height: number }) => void;
  openPip: (v: VideoEntry, startTime?: number) => void;
  closePip: (returnTime?: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeSubjectId: "probability",
  activeCategoryId: "detail",
  activeItemId: "1.1",
  activeChapterId: "ch01",
  activeSectionId: "1.1",
  setActiveSubject: (s) => set({ activeSubjectId: s }),
  setActiveRoute: (subjectId, categoryId, itemId) =>
    set({
      activeSubjectId: subjectId,
      activeCategoryId: categoryId,
      activeItemId: itemId,
      activeChapterId: deriveChapterId(categoryId, itemId),
      activeSectionId: categoryId === "detail" ? itemId : "",
    }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  // 初始展开：概率论科目 + 其详解分类（catId 规则为 `${subjectId}-${categoryId}`）。
  expandedIds: new Set(["probability", "probability-detail"]),
  toggleExpand: (id) =>
    set((s) => {
      const next = new Set(s.expandedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { expandedIds: next };
    }),

  rightTab: "ai",
  setRightTab: (t) => set({ rightTab: t }),

  outbound: null,
  sendToChat: (content) =>
    set((s) => ({
      rightTab: "ai",
      outbound: { content, nonce: (s.outbound?.nonce ?? 0) + 1 },
    })),
  clearOutbound: () => set({ outbound: null }),

  pipVideo: null,
  pipStartTime: 0,
  pipReturnTime: null,
  pipGeometry: null,
  setPipGeometry: (g) => set({ pipGeometry: g }),
  openPip: (v, startTime = 0) => set({ pipVideo: v, pipStartTime: startTime }),
  closePip: (returnTime) =>
    set({ pipVideo: null, pipReturnTime: returnTime ?? null }),
}));
