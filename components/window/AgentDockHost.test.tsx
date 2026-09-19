import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AgentDockHost from "./AgentDockHost";
import { useAppMode } from "@/lib/stores/appMode";
import { useStore } from "@/lib/stores/ui";
import { useAgentDockRuntime } from "@/lib/window/agentDockRuntime";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

function reset() {
  cleanup();
  useAppMode.setState({ mode: "studio", lastStudioPath: "/", hydrated: true });
  useStore.setState({
    layoutProfile: "full",
    rightCollapsedByProfile: { full: false, article: true, reference: false },
  });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useAgentDockRuntime.setState({ contentHost: null, active: null, collapsed: false, openRequest: 0, panelControls: null });
}

afterEach(reset);

describe("AgentDockHost", () => {
  it("does not undo an intentional collapse when existing windows are present", async () => {
    useAppMode.setState({ mode: "agent", lastStudioPath: "/", hydrated: true });
    useStore.setState({ rightCollapsedByProfile: { full: true, article: true, reference: false } });
    useWindowManager.getState().openWindow({
      id: "existing-window",
      type: "source-preview",
      title: "已有窗口",
      pos: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      data: { url: "https://example.com", title: "已有窗口" },
    });
    render(<AgentDockHost><div>内容</div></AgentDockHost>);

    await waitFor(() => expect(useStore.getState().rightCollapsedByProfile.full).toBe(true));
  });

  it("expands a collapsed dock when new content asks for it, even without managed windows", async () => {
    useAppMode.setState({ mode: "agent", lastStudioPath: "/", hydrated: true });
    useStore.setState({ rightCollapsedByProfile: { full: true, article: true, reference: false } });
    render(<AgentDockHost><div>内容</div></AgentDockHost>);

    act(() => useAgentDockRuntime.getState().requestOpen());

    await waitFor(() => expect(useStore.getState().rightCollapsedByProfile.full).toBe(false));
  });
});
