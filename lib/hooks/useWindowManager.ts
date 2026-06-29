import { create } from "zustand";

export type ManagedWindowType = "floating-chat" | "record-preview" | "artifact-viewer" | "image-gen-viewer" | "billing-dashboard";

export interface WindowPoint {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface FloatingChatData {
  sessionId: string;
  modelId?: string;
}

export interface RecordPreviewData {
  cardId: string;
}

export interface ArtifactViewerData {
  artifactId: string;
}

export interface ImageGenViewerData {
  imageGenId: string;
}

export interface BillingDashboardData {
  // 可以留空，或者未来支持传入初始过滤器参数
}

export type ManagedWindowData = FloatingChatData | RecordPreviewData | ArtifactViewerData | ImageGenViewerData | BillingDashboardData | Record<string, unknown>;

export interface ManagedWindow<TData = ManagedWindowData> {
  id: string;
  type: ManagedWindowType;
  title: string;
  icon?: string;
  pos: WindowPoint;
  size: WindowSize;
  z: number;
  fullscreen: boolean;
  minimized: boolean;
  badge?: number;
  data: TData;
}

export type ManagedWindowInput<TData = ManagedWindowData> = Omit<
  ManagedWindow<TData>,
  "z" | "fullscreen" | "minimized" | "badge"
> &
  Partial<Pick<ManagedWindow<TData>, "fullscreen" | "minimized">>;

function pickNextActiveWindow(windows: ManagedWindow[], closedId: string): string | null {
  const remaining = windows.filter((w) => w.id !== closedId && !w.minimized);
  if (remaining.length === 0) return null;
  return remaining.reduce((a, b) => (a.z >= b.z ? a : b)).id;
}

interface WindowManagerState {
  windows: ManagedWindow[];
  topZ: number;
  activeWindowId: string | null;
  openWindow: <TData = ManagedWindowData>(win: ManagedWindowInput<TData>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setFullscreen: (id: string, on: boolean) => void;
  bringToFront: (id: string) => void;
  commitGeometry: (id: string, geom: { pos?: WindowPoint; size?: WindowSize }) => void;
  updateWindow: (id: string, patch: Partial<Omit<ManagedWindow, "id" | "type" | "badge">>) => void;
}

function withBadges(windows: ManagedWindow[]): ManagedWindow[] {
  const counts = new Map<ManagedWindowType, number>();
  return windows.map((win) => {
    const badge = (counts.get(win.type) ?? 0) + 1;
    counts.set(win.type, badge);
    return { ...win, badge };
  });
}

export const useWindowManager = create<WindowManagerState>((set) => ({
  windows: [],
  topZ: 5000,
  activeWindowId: null,

  openWindow: (input) => {
    set((state) => {
      const existing = state.windows.some((win) => win.id === input.id);
      const z = state.topZ + 1;
      const nextWindow: ManagedWindow = {
        id: input.id,
        type: input.type,
        title: input.title,
        icon: input.icon,
        pos: input.pos,
        size: input.size,
        data: input.data as ManagedWindowData,
        z,
        fullscreen: input.fullscreen ?? false,
        minimized: input.minimized ?? false,
      };
      const windows = existing
        ? state.windows.map((win) => (win.id === input.id ? { ...win, ...nextWindow } : win))
        : [...state.windows, nextWindow];
      return { windows: withBadges(windows), topZ: z, activeWindowId: input.id };
    });
    return input.id;
  },

  closeWindow: (id) =>
    set((state) => {
      const windows = withBadges(state.windows.filter((win) => win.id !== id));
      const activeWindowId =
        state.activeWindowId === id ? pickNextActiveWindow(state.windows, id) : state.activeWindowId;
      return { windows, activeWindowId };
    }),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, minimized: true, fullscreen: false } : win,
      ),
    })),

  restoreWindow: (id) =>
    set((state) => {
      const z = state.topZ + 1;
      return {
        topZ: z,
        activeWindowId: id,
        windows: state.windows.map((win) =>
          win.id === id ? { ...win, minimized: false, z } : win,
        ),
      };
    }),

  setFullscreen: (id, on) =>
    set((state) => {
      const z = state.topZ + 1;
      return {
        topZ: z,
        activeWindowId: on ? id : state.activeWindowId,
        windows: state.windows.map((win) => {
          if (win.id === id) return { ...win, fullscreen: on, minimized: false, z };
          if (on && win.fullscreen) return { ...win, fullscreen: false, minimized: true };
          return win;
        }),
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      const z = state.topZ + 1;
      return {
        topZ: z,
        activeWindowId: id,
        windows: state.windows.map((win) => (win.id === id ? { ...win, z } : win)),
      };
    }),

  commitGeometry: (id, geom) =>
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id
          ? {
              ...win,
              ...(geom.pos ? { pos: geom.pos } : {}),
              ...(geom.size ? { size: geom.size } : {}),
            }
          : win,
      ),
    })),

  updateWindow: (id, patch) =>
    set((state) => ({
      windows: withBadges(state.windows.map((win) => (win.id === id ? { ...win, ...patch } : win))),
    })),
}));
