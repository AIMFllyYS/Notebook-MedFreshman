"use client";

import { useEffect, useRef } from "react";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useStore } from "@/lib/stores/ui";
import { isAgentWorkspace } from "@/lib/stores/workspace";
import { useAgentDockRuntime, activateManagedSurface } from "@/lib/window/agentDockRuntime";

/**
 * Stable outer host for the Agent right workspace. The actual content node is
 * owned by RightPanel so the tab bar stays outside every window portal.
 */
export default function AgentDockHost({ children }: { children: React.ReactNode }) {
  const windows = useWindowManager((state) => state.windows);
  const setActiveWindow = useWindowManager((state) => state.setActiveWindow);
  const active = useAgentDockRuntime((state) => state.active);
  const setRightCollapsedForProfile = useStore((state) => state.setRightCollapsedForProfile);
  const layoutProfile = useStore((state) => state.layoutProfile);
  const rightCollapsed = useStore((state) => state.rightCollapsedByProfile[layoutProfile]);
  const setCollapsed = useAgentDockRuntime((state) => state.setCollapsed);
  const openRequest = useAgentDockRuntime((state) => state.openRequest);
  const handledOpenRequest = useRef(openRequest);

  useEffect(() => {
    setCollapsed(rightCollapsed);
  }, [rightCollapsed, setCollapsed]);

  useEffect(() => {
    if (!isAgentWorkspace()) return;
    const visible = windows.filter((window) => !window.minimized);
    if (openRequest !== handledOpenRequest.current) {
      handledOpenRequest.current = openRequest;
      if (rightCollapsed) setRightCollapsedForProfile(layoutProfile, false);
    }

    if (visible.length === 0) return;

    const activeManaged = active?.kind === "managed" ? active.id : null;
    const activeExists = activeManaged && visible.some((window) => window.id === activeManaged);
    if (!activeExists && active?.kind !== "builtin") {
      const next = visible.reduce((top, window) => (window.z > top.z ? window : top));
      setActiveWindow(next.id);
      activateManagedSurface(next.id);
    }
  }, [active, layoutProfile, openRequest, rightCollapsed, setActiveWindow, setRightCollapsedForProfile, windows]);

  return (
    <div
      data-agent-dock-host
      data-dock-collapsed={rightCollapsed || undefined}
      className="flex h-full min-h-0 min-w-0 flex-col"
    >
      {children}
    </div>
  );
}
