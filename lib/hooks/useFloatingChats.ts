import { create } from "zustand";
import { useSettings } from "@/lib/hooks/useSettings";

// 划词追问浮窗的默认模型：硅基流动较快的 MoE Qwen（A3B 激活，速度/成本均衡）。
// 用户可在每个浮窗的模型菜单里单独切换，互不影响、也不改全局选择。
export const FLOATING_DEFAULT_MODEL = "Qwen/Qwen3.6-35B-A3B";

export type SeedMode = "explain" | "example" | "ask";

export interface FloatingMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoningContent?: string;
  timestamp: number;
}

/** 一个独立的划词浮窗会话（临时态，内存，不持久化）。 */
export interface FloatingWin {
  id: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
  fullscreen: boolean;
  z: number;
  modelId: string;
  enableThinking: boolean;
  enableSearch: boolean;
  messages: FloatingMsg[];
  isLoading: boolean;
  error: string | null;
  // 选区原文 + 初始动作；seedNonce 让组件只触发一次自动行为（explain/example 自动发问）。
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
  openWindow: (opts: OpenOpts) => string;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, patch: Partial<FloatingWin>) => void;
  bringToFront: (id: string) => void;
  appendMessage: (id: string, msg: FloatingMsg) => void;
  patchMessage: (id: string, msgId: string, patch: Partial<FloatingMsg>) => void;
  setFullscreen: (id: string, on: boolean) => void;
}

// 复用既有的浮窗尺寸持久化键（与旧快捷解释浮窗一致）。
const SIZE_KEY = "quickExplainWindowSize";
function getSavedSize(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 400, height: 450 };
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.width >= 360 && s.width <= 800 && s.height >= 320 && s.height <= 600) return s;
    }
  } catch {
    /* ignore */
  }
  return { width: 400, height: 450 };
}

const genId = () => Math.random().toString(36).slice(2, 11);

export const useFloatingChats = create<FloatingChatsState>((set) => ({
  windows: [],
  topZ: 2000,

  openWindow: (opts) => {
    const id = genId();
    set((s) => {
      const size = getSavedSize();
      // 级联偏移：再次划词另开一个窗，不与已开窗完全重叠（互不影响）。
      const off = (s.windows.length % 6) * 28;
      const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
      const vh = typeof window !== "undefined" ? window.innerHeight : 900;
      let x = Math.min(opts.anchor.x + 20 + off, vw - size.width - 16);
      let y = Math.min(opts.anchor.y - 40 + off, vh - size.height - 16);
      x = Math.max(16, x);
      y = Math.max(16, y);
      const z = s.topZ + 1;
      const win: FloatingWin = {
        id,
        pos: { x, y },
        size,
        fullscreen: false,
        z,
        modelId: FLOATING_DEFAULT_MODEL,
        enableThinking: useSettings.getState().defaultThinking,
        enableSearch: false,
        messages: [],
        isLoading: false,
        error: null,
        seedText: opts.seedText,
        seedMode: opts.seedMode,
        seedNonce: 1,
      };
      return { windows: [...s.windows, win], topZ: z };
    });
    return id;
  },

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  updateWindow: (id, patch) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),

  bringToFront: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)) };
    }),

  appendMessage: (id, msg) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, messages: [...w.messages, msg] } : w)),
    })),

  patchMessage: (id, msgId, patch) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id
          ? { ...w, messages: w.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) }
          : w,
      ),
    })),

  // 全屏即把窗铺满中间内容栏（#notes-panel）；同时置顶 —— 两个浮窗都全屏时按 z 叠放（相互覆盖）。
  setFullscreen: (id, on) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, fullscreen: on, z } : w)) };
    }),
}));

export { genId as genFloatingId, getSavedSize as getFloatingSavedSize, SIZE_KEY as FLOATING_SIZE_KEY };
