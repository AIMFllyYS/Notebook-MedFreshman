import { create } from "zustand";

/**
 * 全站主题（深色 / 浅色）单一真相源。
 * 侧栏底部的快捷切换与「设置」面板共用此 store，避免两处状态各自漂移。
 * 落地 localStorage；首屏由 app/layout.tsx 内联脚本在 paint 前应用，杜绝闪烁。
 */
export type ThemeMode = "light" | "dark";

const LS_KEY = "gailvlun-theme";

/** 读 DOM 上当前生效的主题（无 data-theme 时默认深色，见 globals.css :root）。 */
function domTheme(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function apply(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(LS_KEY, mode);
  } catch {
    /* ignore */
  }
}

interface ThemeState {
  theme: ThemeMode;
  /** 是否已与 DOM/本地存储对齐（用于避免 SSR/首挂载误显示）。 */
  hydrated: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
  /** 客户端挂载后调用：从 DOM（已由内联脚本应用本地值）回填真实主题。 */
  hydrate: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark",
  hydrated: false,
  setTheme: (mode) => {
    apply(mode);
    set({ theme: mode });
  },
  toggle: () => {
    const next: ThemeMode = get().theme === "light" ? "dark" : "light";
    apply(next);
    set({ theme: next });
  },
  hydrate: () => set({ theme: domTheme(), hydrated: true }),
}));
