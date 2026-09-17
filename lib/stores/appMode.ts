"use client";

import { create } from "zustand";
import {
  APP_MODE_STORAGE_KEY,
  DEFAULT_APP_MODE,
  DEFAULT_STUDIO_PATH,
  appModeFromPathname,
  isRememberableStudioPath,
  parseAppModePersist,
  type AppMode,
  type AppModePersist,
} from "@/lib/constants/app-mode";

export type { AppMode, AppModePersist };

function emptyPersist(): AppModePersist {
  return { mode: DEFAULT_APP_MODE, lastStudioPath: DEFAULT_STUDIO_PATH };
}

function readPersist(): AppModePersist {
  if (typeof window === "undefined") return emptyPersist();
  try {
    return parseAppModePersist(window.localStorage.getItem(APP_MODE_STORAGE_KEY));
  } catch {
    return emptyPersist();
  }
}

function writePersist(value: AppModePersist): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APP_MODE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

function setModeAttr(mode: AppMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-app-mode", mode);
}

interface AppModeState {
  /** 当前模式。路由同步后与 URL 一致；`/login` 不改此字段。 */
  mode: AppMode;
  /** 离开 Studio 前记住的路径，切回 Studio 时落地。 */
  lastStudioPath: string;
  hydrated: boolean;
  setMode: (mode: AppMode) => void;
  /** 由 AppShell 根据 pathname 回写，其它代理勿各写一套同步。 */
  syncFromPathname: (pathname: string, options?: { retainAgentOnStudio?: boolean }) => void;
  rememberStudioPath: (pathname: string) => void;
  hydrate: () => void;
}

/**
 * 三模式单一真相源。落地 `studysolo-app-mode`。
 * 读：`useAppMode((s) => s.mode)` 或 `useAppMode.getState().mode`。
 */
export const useAppMode = create<AppModeState>((set, get) => ({
  mode: DEFAULT_APP_MODE,
  lastStudioPath: DEFAULT_STUDIO_PATH,
  hydrated: false,
  setMode: (mode) => {
    const prev = get();
    if (prev.mode === mode && prev.hydrated) return;
    const next = { mode, lastStudioPath: prev.lastStudioPath };
    writePersist(next);
    setModeAttr(mode);
    set({ ...next, hydrated: true });
  },
  syncFromPathname: (pathname, options) => {
    const fromPath = appModeFromPathname(pathname);
    if (!fromPath) return;
    const prev = get();
    if (options?.retainAgentOnStudio && prev.mode === "agent" && fromPath === "studio") return;
    if (prev.mode === fromPath && prev.hydrated) return;
    const next = { mode: fromPath, lastStudioPath: prev.lastStudioPath };
    writePersist(next);
    setModeAttr(fromPath);
    set({ ...next, hydrated: true });
  },
  rememberStudioPath: (pathname) => {
    if (!isRememberableStudioPath(pathname)) return;
    const prev = get();
    if (prev.lastStudioPath === pathname) return;
    const next = { mode: prev.mode, lastStudioPath: pathname };
    writePersist(next);
    set({ lastStudioPath: pathname });
  },
  hydrate: () => {
    const stored = readPersist();
    setModeAttr(stored.mode);
    set({ ...stored, hydrated: true });
  },
}));
