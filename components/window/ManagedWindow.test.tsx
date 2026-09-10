import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManagedWindow from "@/components/window/ManagedWindow";
import { NOTES_PANEL_ID } from "@/lib/constants/layout";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

const WIN_ID = "test-managed-window";

function openTestWindow() {
  useWindowManager.getState().openWindow({
    id: WIN_ID,
    type: "source-preview",
    title: "测试窗",
    pos: { x: 40, y: 50 },
    size: { width: 480, height: 360 },
    data: { url: "https://example.com", title: "测试窗" },
  });
}

function mountNotesPanel(rect: { left: number; top: number; width: number; height: number }) {
  const el = document.createElement("div");
  el.id = NOTES_PANEL_ID;
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => {},
    }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  document.getElementById(NOTES_PANEL_ID)?.remove();
});

describe("ManagedWindow", () => {
  it("renders null when the window is not in the manager", () => {
    render(
      <ManagedWindow windowId="missing" title="缺失" onClose={() => {}}>
        <span>payload</span>
      </ManagedWindow>,
    );
    expect(screen.queryByText("payload")).not.toBeInTheDocument();
    expect(screen.queryByText("缺失")).not.toBeInTheDocument();
  });

  it("snaps to #notes-panel when fullscreenTarget is notes", async () => {
    mountNotesPanel({ left: 100, top: 80, width: 700, height: 500 });
    openTestWindow();
    render(
      <ManagedWindow windowId={WIN_ID} title="测试窗" onClose={() => {}} fullscreenTarget="notes">
        <span>payload</span>
      </ManagedWindow>,
    );

    await userEvent.click(screen.getByTitle("全屏"));

    await waitFor(() => {
      const win = useWindowManager.getState().windows.find((w) => w.id === WIN_ID);
      expect(win?.fullscreen).toBe(true);
      expect(win?.pos).toEqual({ x: 100, y: 80 });
      expect(win?.size).toEqual({ width: 700, height: 500 });
    });
  });

  it("fills the viewport when fullscreenTarget is viewport", async () => {
    openTestWindow();
    render(
      <ManagedWindow windowId={WIN_ID} title="测试窗" onClose={() => {}} fullscreenTarget="viewport">
        <span>payload</span>
      </ManagedWindow>,
    );

    await userEvent.click(screen.getByTitle("全屏"));

    await waitFor(() => {
      const win = useWindowManager.getState().windows.find((w) => w.id === WIN_ID);
      expect(win?.fullscreen).toBe(true);
      expect(win?.pos).toEqual({ x: 0, y: 0 });
      expect(win?.size).toEqual({ width: window.innerWidth, height: window.innerHeight });
    });
  });

  it("restores pre-expand geometry when leaving fullscreen", async () => {
    mountNotesPanel({ left: 100, top: 80, width: 700, height: 500 });
    openTestWindow();
    render(
      <ManagedWindow windowId={WIN_ID} title="测试窗" onClose={() => {}} fullscreenTarget="notes">
        <span>payload</span>
      </ManagedWindow>,
    );

    await userEvent.click(screen.getByTitle("全屏"));
    await waitFor(() => {
      expect(useWindowManager.getState().windows[0]?.fullscreen).toBe(true);
    });
    await userEvent.click(screen.getByTitle("还原"));

    await waitFor(() => {
      const win = useWindowManager.getState().windows.find((w) => w.id === WIN_ID);
      expect(win?.fullscreen).toBe(false);
      expect(win?.pos).toEqual({ x: 40, y: 50 });
      expect(win?.size).toEqual({ width: 480, height: 360 });
    });
  });

  it("unmounts children when unmountWhenMinimized is true", async () => {
    openTestWindow();
    render(
      <ManagedWindow windowId={WIN_ID} title="测试窗" onClose={() => {}} unmountWhenMinimized>
        <span>payload</span>
      </ManagedWindow>,
    );
    expect(screen.getByText("payload")).toBeInTheDocument();

    act(() => {
      useWindowManager.getState().minimizeWindow(WIN_ID);
    });

    await waitFor(() => {
      expect(screen.queryByText("payload")).not.toBeInTheDocument();
    });
  });
});
