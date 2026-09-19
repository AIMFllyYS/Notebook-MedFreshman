import { create } from "zustand";

interface AgentDockRuntimeState {
  /** The one stable DOM node used by all docked surface portals. */
  contentHost: HTMLElement | null;
  /** Monotonic requests used to expand a user-collapsed dock when new content opens. */
  openRequest: number;
  /**
   * 「全屏」态：右栏铺满左侧对话栏之外的全部区域（中央对话与顶栏让位）。
   * 它是**面板级**状态而不是某个窗口的属性——没有打开的窗口时也能全屏看这个板块，
   * 切换标签就是切换全屏里显示的内容。只影响 Agent 外壳，且不落盘。
   */
  dockGlobal: boolean;
  registerContentHost: (host: HTMLElement | null) => void;
  requestOpen: () => void;
  setDockGlobal: (value: boolean) => void;
}

/**
 * Agent 右栏的运行时接线：portal 宿主、打开请求、全屏开关。
 *
 * 「当前展示哪个窗口」不在这里——唯一真相源是 `useWindowManager.activeWindowId`（见
 * `useManagedWindowSurface`）。右栏是否收起也不在这里：唯一真相源是 `useStore.agentDockCollapsed`。
 */
export const useAgentDockRuntime = create<AgentDockRuntimeState>((set) => ({
  contentHost: null,
  openRequest: 0,
  dockGlobal: false,

  registerContentHost: (host) =>
    set((state) => (state.contentHost === host ? state : { contentHost: host })),

  requestOpen: () => set((state) => ({ openRequest: state.openRequest + 1 })),

  setDockGlobal: (value) => set((state) => (state.dockGlobal === value ? state : { dockGlobal: value })),
}));
