"use client";

import { useEffect, useRef } from "react";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useStore } from "@/lib/stores/ui";
import { isAgentWorkspace } from "@/lib/stores/workspace";
import { useAgentDockRuntime } from "@/lib/window/agentDockRuntime";

/**
 * Stable outer host for the Agent right workspace. The actual content node is
 * owned by RightPanel so the tab bar stays outside every window portal.
 *
 * 它只做两件外壳级的事：把用户「收起右栏」的意图同步给标签条（`data-dock-collapsed`），
 * 以及在没有活动窗口时把活动权交给 z 最高的窗口（`activeWindowId` 是唯一真相源）。
 */
export default function AgentDockHost({ children }: { children: React.ReactNode }) {
  const windows = useWindowManager((state) => state.windows);
  const activeWindowId = useWindowManager((state) => state.activeWindowId);
  const setActiveWindow = useWindowManager((state) => state.setActiveWindow);
  const dockCollapsed = useStore((state) => state.agentDockCollapsed);
  const setAgentDockCollapsed = useStore((state) => state.setAgentDockCollapsed);
  const openRequest = useAgentDockRuntime((state) => state.openRequest);
  const dockGlobal = useAgentDockRuntime((state) => state.dockGlobal);
  const setDockGlobal = useAgentDockRuntime((state) => state.setDockGlobal);
  const handledOpenRequest = useRef(openRequest);

  useEffect(() => {
    if (!isAgentWorkspace()) return;
    const visible = windows.filter((window) => !window.minimized);
    if (openRequest !== handledOpenRequest.current) {
      handledOpenRequest.current = openRequest;
      if (dockCollapsed) setAgentDockCollapsed(false);
    }

    if (visible.length === 0) return;
    if (activeWindowId && visible.some((window) => window.id === activeWindowId)) return;
    const next = visible.reduce((top, window) => (window.z > top.z ? window : top));
    setActiveWindow(next.id);
  }, [activeWindowId, dockCollapsed, openRequest, setActiveWindow, setAgentDockCollapsed, windows]);

  // 「全屏」不落盘：右栏一收起就自动退出，不会留下半个全屏态。
  // （窗口增删不用管：全屏是面板级状态，切标签就是切全屏里显示的内容。）
  useEffect(() => {
    if (dockGlobal && dockCollapsed) setDockGlobal(false);
  }, [dockCollapsed, dockGlobal, setDockGlobal]);

  return (
    <div
      data-agent-dock-host
      data-dock-collapsed={dockCollapsed || undefined}
      className="flex h-full min-h-0 min-w-0 flex-col"
    >
      {children}
    </div>
  );
}
