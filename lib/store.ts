import { create } from "zustand";
import type { VideoEntry } from "@/lib/content/types";
import type { SubjectId } from "@/lib/types/content";

export type RightTab = "ai" | "video" | "interactive" | "browser";
export type MobileTab = "detail" | "video" | "ai" | "interactive" | "browser";

export interface OutboundMessage {
  /** 要发送给 AI 的完整内容（可能含划词引用） */
  content: string;
  /** 触发发送的递增序号；ChatPanel 监听其变化以发起请求 */
  nonce: number;
}

/** Layout 折叠状态持久化 key。 */
const LS_KEY_SIDEBAR = "gailvlun-sidebar-collapsed";
const LS_KEY_TOPBAR = "gailvlun-topbar-collapsed";

function readBoolean(key: string, fallback: boolean): boolean {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v === "true" ? true : v === "false" ? false : fallback;
  } catch {
    return fallback;
  }
}

function writeBoolean(key: string, value: boolean): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

/** 同步 layout 折叠状态到 html 的 data 属性（供 CSS 在首屏 paint 前应用）。 */
function setLayoutAttr(name: string, value: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(name, String(value));
}

/** 从 DOM 属性读取 layout 折叠状态（由 app/layout.tsx 内联脚本在 paint 前应用）。 */
function domBoolean(name: string): boolean | null {
  if (typeof document === "undefined") return null;
  const v = document.documentElement.getAttribute(name);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

/** detail/recording/english 分类下的 quiz key 推导。recording/english 直接用 itemId。 */
function deriveChapterId(categoryId: string, itemId: string): string {
  if (categoryId === "recording") return itemId;
  if (categoryId === "english") return itemId;
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

  // 顶部导航栏折叠
  topBarCollapsed: boolean;
  toggleTopBar: () => void;
  setTopBarCollapsed: (v: boolean) => void;

  /** 从 DOM 回填本地持久化的布局状态（首屏避免闪烁）。 */
  hydrateLayout: () => void;

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

  // ── 手机端 ──────────────────────────────────────────────
  mobileTab: MobileTab;
  setMobileTab: (t: MobileTab) => void;
  mobileChapterPickerOpen: boolean;
  toggleMobileChapterPicker: () => void;
  setMobileChapterPickerOpen: (v: boolean) => void;

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

export const useStore = create<AppState>((set) => ({
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

  sidebarCollapsed: readBoolean(LS_KEY_SIDEBAR, false),
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed;
      writeBoolean(LS_KEY_SIDEBAR, next);
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (v) => {
    writeBoolean(LS_KEY_SIDEBAR, v);
    set({ sidebarCollapsed: v });
  },

  topBarCollapsed: false,
  toggleTopBar: () =>
    set((s) => {
      const next = !s.topBarCollapsed;
      writeBoolean(LS_KEY_TOPBAR, next);
      setLayoutAttr("data-topbar-collapsed", next);
      return { topBarCollapsed: next };
    }),
  setTopBarCollapsed: (v) => {
    writeBoolean(LS_KEY_TOPBAR, v);
    setLayoutAttr("data-topbar-collapsed", v);
    set({ topBarCollapsed: v });
  },

  hydrateLayout: () => {
    const topBar = domBoolean("data-topbar-collapsed");
    const sidebar = domBoolean("data-sidebar-collapsed");
    const updates: Partial<AppState> = {};
    if (topBar !== null) updates.topBarCollapsed = topBar;
    if (sidebar !== null) updates.sidebarCollapsed = sidebar;
    if (Object.keys(updates).length > 0) set(updates);
  },

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
      mobileTab: "ai",
      outbound: { content, nonce: (s.outbound?.nonce ?? 0) + 1 },
    })),
  clearOutbound: () => set({ outbound: null }),

  mobileTab: "detail",
  setMobileTab: (t) => set({ mobileTab: t }),
  mobileChapterPickerOpen: false,
  toggleMobileChapterPicker: () =>
    set((s) => ({ mobileChapterPickerOpen: !s.mobileChapterPickerOpen })),
  setMobileChapterPickerOpen: (v) => set({ mobileChapterPickerOpen: v }),

  pipVideo: null,
  pipStartTime: 0,
  pipReturnTime: null,
  pipGeometry: null,
  setPipGeometry: (g) => set({ pipGeometry: g }),
  openPip: (v, startTime = 0) => set({ pipVideo: v, pipStartTime: startTime }),
  closePip: (returnTime) =>
    set({ pipVideo: null, pipReturnTime: returnTime ?? null }),
}));
