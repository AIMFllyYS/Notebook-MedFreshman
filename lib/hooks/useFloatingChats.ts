import { create } from "zustand";
import { useStore } from "@/lib/store";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import type { ChatContext } from "@/lib/types/chat";

// 划词追问浮窗的默认模型：硅基流动较快的 MoE Qwen（A3B 激活，速度/成本均衡）。
// 用户可在每个浮窗底部的模型菜单单独切换，互不影响、也不改全局选择。
export const FLOATING_DEFAULT_MODEL = "Qwen/Qwen3.6-35B-A3B";

export type SeedMode = "explain" | "example" | "ask";

/**
 * 一个「打开中」的划词浮窗：只持有窗口几何 + 引用的持久会话 id。
 * 消息本身存于 useChatHistory（kind:'floating'），所以关窗不丢、可从历史「划词」栏还原。
 */
export interface FloatingWin {
  id: string; // 窗口实例 id（临时态，仅用于多开区分）
  sessionId: string; // 绑定的持久会话 id（useChatHistory，kind:'floating'）
  pos: { x: number; y: number };
  size: { width: number; height: number };
  fullscreen: boolean;
  z: number;
  modelId: string; // 每窗独立模型
  // 初始种子：开窗时消费一次（explain/example 自动发问；ask 首条附选区引用）。
  // 还原旧会话时 seedNonce=0，不触发任何自动行为。
  seedText: string;
  seedMode: SeedMode;
  seedNonce: number;
}

interface OpenOpts {
  anchor: { x: number; y: number };
  seedMode: SeedMode;
  seedText: string;
}

interface FloatingChatsState {
  windows: FloatingWin[];
  topZ: number;
  /** 划词「解释/举例/追问」开新窗：新建一个持久划词会话并绑定。返回窗口 id。 */
  openWindow: (opts: OpenOpts) => string;
  /** 历史「划词」栏点「还原」：已开则置顶，否则重开一个绑定旧会话的窗（不自动发问）。 */
  restoreWindow: (sessionId: string) => void;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, patch: Partial<FloatingWin>) => void;
  /** 拖拽/缩放松手时一次性落库几何（移动过程零重渲，见 useDraggable/useResizable）。 */
  commitGeometry: (id: string, geom: { pos?: { x: number; y: number }; size?: { width: number; height: number } }) => void;
  bringToFront: (id: string) => void;
  setFullscreen: (id: string, on: boolean) => void;
}

// 浮窗现承载完整对话（消息+工具+底部控制条），放宽上限让用户能拉大窗口阅读。
const MIN_W = 360, MAX_W = 1200, MIN_H = 320, MAX_H = 1000;
const SIZE_KEY = "quickExplainWindowSize"; // 沿用既有尺寸持久化键

function getSavedSize(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 420, height: 480 };
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.width >= MIN_W && s.width <= MAX_W && s.height >= MIN_H && s.height <= MAX_H) return s;
    }
  } catch {
    /* ignore */
  }
  return { width: 420, height: 480 };
}

const genId = () => Math.random().toString(36).slice(2, 11);

/** 当前页面上下文（划词浮窗携带，否则 /api/chat 会 fallback 到默认科目）。 */
function currentChatContext(): ChatContext {
  const s = useStore.getState();
  return {
    subjectId: s.activeSubjectId,
    categoryId: s.activeCategoryId,
    itemId: s.activeItemId,
    currentTopic: `${s.activeSubjectId} ${s.activeCategoryId} ${s.activeItemId}`,
  };
}

/** 在锚点附近、按已开窗数级联偏移地放置一个新窗，并夹紧到视口内。 */
function placeWin(
  id: string,
  sessionId: string,
  anchor: { x: number; y: number },
  existingCount: number,
  z: number,
  seed: { seedText: string; seedMode: SeedMode; seedNonce: number },
): FloatingWin {
  const size = getSavedSize();
  const off = (existingCount % 6) * 28;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  let x = Math.min(anchor.x + 20 + off, vw - size.width - 16);
  let y = Math.min(anchor.y - 40 + off, vh - size.height - 16);
  x = Math.max(16, x);
  y = Math.max(16, y);
  return { id, sessionId, pos: { x, y }, size, fullscreen: false, z, modelId: FLOATING_DEFAULT_MODEL, ...seed };
}

export const useFloatingChats = create<FloatingChatsState>((set) => ({
  windows: [],
  topZ: 2000,

  openWindow: (opts) => {
    // 新建一个持久化划词会话（kind:'floating'，不抢占主面板 activeSessionId）。
    const sessionId = useChatHistory.getState().createSession(currentChatContext(), "floating");
    // 用选区文本预置标题，历史「划词」栏更可辨识（useChat 不会覆盖非默认标题）。
    const t = opts.seedText.trim().replace(/\s+/g, " ");
    if (t) {
      const title = t.length > 20 ? t.slice(0, 20) + "…" : t;
      useChatHistory.setState((st) => ({
        sessions: st.sessions.map((s) => (s.id === sessionId ? { ...s, title } : s)),
      }));
    }
    const id = genId();
    set((s) => {
      const z = s.topZ + 1;
      const win = placeWin(id, sessionId, opts.anchor, s.windows.length, z, {
        seedText: opts.seedText,
        seedMode: opts.seedMode,
        seedNonce: 1,
      });
      return { windows: [...s.windows, win], topZ: z };
    });
    return id;
  },

  restoreWindow: (sessionId) =>
    set((s) => {
      const existing = s.windows.find((w) => w.sessionId === sessionId);
      const z = s.topZ + 1;
      if (existing) {
        return { topZ: z, windows: s.windows.map((w) => (w.id === existing.id ? { ...w, z, fullscreen: false } : w)) };
      }
      const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
      const vh = typeof window !== "undefined" ? window.innerHeight : 900;
      const win = placeWin(genId(), sessionId, { x: vw * 0.42, y: vh * 0.34 }, s.windows.length, z, {
        seedText: "",
        seedMode: "ask",
        seedNonce: 0, // 还原旧会话：绝不自动发问
      });
      return { windows: [...s.windows, win], topZ: z };
    }),

  closeWindow: (id) => {
    let sessionId: string | null = null;
    set((s) => {
      sessionId = s.windows.find((w) => w.id === id)?.sessionId ?? null;
      return { windows: s.windows.filter((w) => w.id !== id) };
    });
    // 用户开窗后未发任何消息即关闭 → 删除空会话，避免污染历史「划词」栏。
    if (sessionId) {
      const sess = useChatHistory.getState().sessions.find((x) => x.id === sessionId);
      if (sess && sess.messages.length === 0) useChatHistory.getState().deleteSession(sessionId);
    }
  },

  updateWindow: (id, patch) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),

  commitGeometry: (id, geom) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, ...(geom.pos ? { pos: geom.pos } : {}), ...(geom.size ? { size: geom.size } : {}) } : w,
      ),
    })),

  bringToFront: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)) };
    }),

  // 全屏即把窗铺满中间内容栏（#notes-panel）并置顶；两个浮窗都全屏时按 z 叠放（相互覆盖）。
  setFullscreen: (id, on) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, fullscreen: on, z } : w)) };
    }),
}));

/** 仅在「用户手动缩放」松手时持久化窗口尺寸（全屏的临时尺寸不入库）。 */
export function persistFloatingSize(size: { width: number; height: number }): void {
  try { localStorage.setItem(SIZE_KEY, JSON.stringify(size)); } catch { /* ignore */ }
}

export { MIN_W as FLOATING_MIN_W, MIN_H as FLOATING_MIN_H, MAX_W as FLOATING_MAX_W, MAX_H as FLOATING_MAX_H };
