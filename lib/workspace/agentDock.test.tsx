import { afterEach, describe, expect, it } from "vitest";
import { RIGHT_PANEL_ID } from "@/lib/constants/layout";
import { useAppMode } from "@/lib/stores/appMode";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { isAgentWorkspace } from "@/lib/stores/workspace";
import {
  fallbackAgentDockRect,
  placeAgentDockWindow,
  resolveWorkspaceFullscreenRect,
} from "@/lib/workspace/agentDock";

function reset() {
  useAppMode.setState({ mode: "studio", lastStudioPath: "/", hydrated: true });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  document.getElementById(RIGHT_PANEL_ID)?.remove();
}

afterEach(() => {
  reset();
});

describe("agentDock", () => {
  it("Studio 模式不改窗口几何", () => {
    expect(isAgentWorkspace()).toBe(false);
    const input = { pos: { x: 12, y: 24 }, size: { width: 400, height: 300 } };
    expect(placeAgentDockWindow(input)).toEqual(input);
  });

  it("Agent 模式从右侧弹出并对齐右栏，放大铺右栏", () => {
    useAppMode.setState({ mode: "agent", lastStudioPath: "/", hydrated: true });
    const el = document.createElement("div");
    el.id = RIGHT_PANEL_ID;
    el.getBoundingClientRect = () =>
      ({
        left: 900, top: 48, width: 380, height: 700,
        right: 1280, bottom: 748, x: 900, y: 48, toJSON: () => {},
      }) as DOMRect;
    document.body.appendChild(el);

    const placed = placeAgentDockWindow({ pos: { x: 10, y: 10 }, size: { width: 500, height: 400 } });
    expect(placed.size.height).toBe(700);
    expect(placed.pos.y).toBe(48);
    expect(placed.pos.x + placed.size.width).toBe(1280);
    expect(placed.size.width).toBeGreaterThanOrEqual(380);

    const rect = resolveWorkspaceFullscreenRect("notes");
    expect(rect?.width).toBe(380);
    expect(rect?.left).toBe(900);
  });

  it("openWindow 在 Agent 模式走右侧坞", () => {
    useAppMode.setState({ mode: "agent", lastStudioPath: "/", hydrated: true });
    const dock = fallbackAgentDockRect();
    useWindowManager.getState().openWindow({
      id: "dock-1",
      type: "artifact-viewer",
      title: "演示",
      pos: { x: 8, y: 8 },
      size: { width: 200, height: 200 },
      data: { artifactId: "a1" },
    });
    const win = useWindowManager.getState().windows[0];
    expect(win?.pos.y).toBe(dock.top);
    expect((win?.pos.x ?? 0) + (win?.size.width ?? 0)).toBe(dock.left + dock.width);
  });
});
