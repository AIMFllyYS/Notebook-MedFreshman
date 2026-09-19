import { create } from "zustand";

export type AgentDockBuiltinId = "ai" | "video" | "interactive" | "browser";

export type AgentDockActiveRef =
  | { kind: "managed"; id: string }
  | { kind: "builtin"; id: AgentDockBuiltinId }
  | null;

export interface AgentDockPanelControls {
  collapse: () => void;
  expand: () => void;
  toggleExpand: () => void;
}

interface AgentDockRuntimeState {
  /** The one stable DOM node used by all docked surface portals. */
  contentHost: HTMLElement | null;
  active: AgentDockActiveRef;
  collapsed: boolean;
  /** Monotonic requests used to expand a user-collapsed dock when new content opens. */
  openRequest: number;
  panelControls: AgentDockPanelControls | null;
  registerContentHost: (host: HTMLElement | null) => void;
  setActive: (active: AgentDockActiveRef) => void;
  setCollapsed: (collapsed: boolean) => void;
  requestOpen: () => void;
  registerPanelControls: (controls: AgentDockPanelControls | null) => void;
  togglePanelExpand: () => void;
}

export const useAgentDockRuntime = create<AgentDockRuntimeState>((set, get) => ({
  contentHost: null,
  active: null,
  collapsed: false,
  openRequest: 0,
  panelControls: null,

  registerContentHost: (host) =>
    set((state) => (state.contentHost === host ? state : { contentHost: host })),

  setActive: (active) => set({ active }),

  setCollapsed: (collapsed) => set({ collapsed }),

  requestOpen: () => set((state) => ({ openRequest: state.openRequest + 1 })),

  registerPanelControls: (controls) => set({ panelControls: controls }),

  togglePanelExpand: () => get().panelControls?.toggleExpand(),
}));

export function activateManagedSurface(id: string): void {
  useAgentDockRuntime.getState().setActive({ kind: "managed", id });
}

export function activateBuiltinSurface(id: AgentDockBuiltinId): void {
  useAgentDockRuntime.getState().setActive({ kind: "builtin", id });
}
