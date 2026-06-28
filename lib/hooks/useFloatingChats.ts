import { create } from "zustand";
import { useStore } from "@/lib/store";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import type { ChatContext } from "@/lib/types/chat";

export const FLOATING_DEFAULT_MODEL = "Qwen/Qwen3.6-27B";

export type SeedMode = "explain" | "example" | "ask";

export interface FloatingWin {
  id: string;
  sessionId: string;
  modelId: string;
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
  openWindow: (opts: OpenOpts) => string;
  restoreWindow: (sessionId: string) => void;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, patch: Partial<FloatingWin>) => void;
}

const MIN_W = 360;
const MAX_W = 1200;
const MIN_H = 320;
const MAX_H = 1000;
const SIZE_KEY = "quickExplainWindowSize";

const genId = () => Math.random().toString(36).slice(2, 11);

function getSavedSize(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 420, height: 480 };
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    if (raw) {
      const size = JSON.parse(raw);
      if (size.width >= MIN_W && size.width <= MAX_W && size.height >= MIN_H && size.height <= MAX_H) {
        return size;
      }
    }
  } catch {
    /* ignore */
  }
  return { width: 420, height: 480 };
}

function currentChatContext(): ChatContext {
  const state = useStore.getState();
  return {
    subjectId: state.activeSubjectId,
    categoryId: state.activeCategoryId,
    itemId: state.activeItemId,
    currentTopic: `${state.activeSubjectId} ${state.activeCategoryId} ${state.activeItemId}`,
  };
}

function initialGeometry(anchor: { x: number; y: number }, existingCount: number) {
  const size = getSavedSize();
  const offset = (existingCount % 6) * 28;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const x = Math.max(16, Math.min(anchor.x + 20 + offset, vw - size.width - 16));
  const y = Math.max(16, Math.min(anchor.y - 40 + offset, vh - size.height - 16));
  return { pos: { x, y }, size };
}

function floatingTitle(seedMode: SeedMode, seedText: string) {
  const text = seedText.trim().replace(/\s+/g, " ");
  if (text) return text.length > 20 ? `${text.slice(0, 20)}...` : text;
  if (seedMode === "explain") return "AI 解释";
  if (seedMode === "example") return "AI 举例";
  return "AI 追问";
}

export const useFloatingChats = create<FloatingChatsState>((set, get) => ({
  windows: [],

  openWindow: (opts) => {
    const sessionId = useChatHistory.getState().createSession(currentChatContext(), "floating");
    const title = floatingTitle(opts.seedMode, opts.seedText);
    if (opts.seedText.trim()) {
      useChatHistory.setState((state) => ({
        sessions: state.sessions.map((session) => (session.id === sessionId ? { ...session, title } : session)),
      }));
    }

    const id = genId();
    const floatingWin: FloatingWin = {
      id,
      sessionId,
      modelId: FLOATING_DEFAULT_MODEL,
      seedText: opts.seedText,
      seedMode: opts.seedMode,
      seedNonce: 1,
    };
    const { pos, size } = initialGeometry(opts.anchor, get().windows.length);
    useWindowManager.getState().openWindow({
      id,
      type: "floating-chat",
      title,
      pos,
      size,
      data: { sessionId, modelId: FLOATING_DEFAULT_MODEL },
    });
    set((state) => ({ windows: [...state.windows, floatingWin] }));
    return id;
  },

  restoreWindow: (sessionId) => {
    const existing = get().windows.find((win) => win.sessionId === sessionId);
    if (existing) {
      useWindowManager.getState().restoreWindow(existing.id);
      return;
    }
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const id = genId();
    const floatingWin: FloatingWin = {
      id,
      sessionId,
      modelId: FLOATING_DEFAULT_MODEL,
      seedText: "",
      seedMode: "ask",
      seedNonce: 0,
    };
    const { pos, size } = initialGeometry({ x: vw * 0.42, y: vh * 0.34 }, get().windows.length);
    const sessionTitle = useChatHistory.getState().sessions.find((session) => session.id === sessionId)?.title ?? "AI 追问";
    useWindowManager.getState().openWindow({
      id,
      type: "floating-chat",
      title: sessionTitle,
      pos,
      size,
      data: { sessionId, modelId: FLOATING_DEFAULT_MODEL },
    });
    set((state) => ({ windows: [...state.windows, floatingWin] }));
  },

  closeWindow: (id) => {
    const sessionId = get().windows.find((win) => win.id === id)?.sessionId ?? null;
    useWindowManager.getState().closeWindow(id);
    set((state) => ({ windows: state.windows.filter((win) => win.id !== id) }));
    if (sessionId) {
      const session = useChatHistory.getState().sessions.find((item) => item.id === sessionId);
      if (session && session.messages.length === 0) useChatHistory.getState().deleteSession(sessionId);
    }
  },

  updateWindow: (id, patch) => {
    set((state) => ({ windows: state.windows.map((win) => (win.id === id ? { ...win, ...patch } : win)) }));
    if (patch.modelId) {
      useWindowManager.getState().updateWindow(id, { data: { sessionId: get().windows.find((win) => win.id === id)?.sessionId ?? "", modelId: patch.modelId } });
    }
  },
}));

export function persistFloatingSize(size: { width: number; height: number }): void {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify(size));
  } catch {
    /* ignore */
  }
}

export { MIN_W as FLOATING_MIN_W, MIN_H as FLOATING_MIN_H, MAX_W as FLOATING_MAX_W, MAX_H as FLOATING_MAX_H };
