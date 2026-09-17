import { RIGHT_PANEL_ID, resolveFullscreenRect, type FullscreenTarget } from "@/lib/constants/layout";
import { isAgentWorkspace } from "@/lib/stores/workspace";
import { useStore } from "@/lib/stores/ui";

export interface DockGeometry {
  pos: { x: number; y: number };
  size: { width: number; height: number };
}

const FALLBACK_TOP = 48;
const MIN_POPOUT_WIDTH = 360;

export function fallbackAgentDockRect(): DOMRect {
  if (typeof window === "undefined") {
    return new DOMRect(1020, FALLBACK_TOP, 420, 720);
  }
  const width = Math.min(420, Math.max(MIN_POPOUT_WIDTH, Math.floor(window.innerWidth * 0.3)));
  const height = Math.max(240, window.innerHeight - FALLBACK_TOP);
  return new DOMRect(window.innerWidth - width, FALLBACK_TOP, width, height);
}

export function agentDockRect(): DOMRect {
  return resolveFullscreenRect("right") ?? fallbackAgentDockRect();
}

export function resolveWorkspaceFullscreenRect(target: FullscreenTarget): DOMRect | null {
  if (!isAgentWorkspace()) return resolveFullscreenRect(target);
  if (target === "viewport") return resolveFullscreenRect("viewport");
  const dock = resolveFullscreenRect("right");
  if (dock && dock.width > 0 && dock.height > 0) return dock;
  return fallbackAgentDockRect();
}

export function ensureAgentRightPanelOpen(): void {
  if (!isAgentWorkspace()) return;
  const ui = useStore.getState();
  if (ui.rightCollapsedByProfile[ui.layoutProfile]) {
    ui.setRightCollapsedForProfile(ui.layoutProfile, false);
  }
}

export function placeAgentDockWindow(input: DockGeometry): DockGeometry {
  if (!isAgentWorkspace()) return input;
  ensureAgentRightPanelOpen();
  const dock = agentDockRect();
  const maxWidth =
    typeof window === "undefined" ? Math.max(dock.width, input.size.width) : Math.floor(window.innerWidth * 0.62);
  const width = Math.min(Math.max(input.size.width, Math.max(dock.width, MIN_POPOUT_WIDTH)), maxWidth);
  return {
    pos: { x: dock.left + dock.width - width, y: dock.top },
    size: { width, height: dock.height },
  };
}

export function agentFullscreenPanelId(): string | null {
  return isAgentWorkspace() ? RIGHT_PANEL_ID : null;
}
