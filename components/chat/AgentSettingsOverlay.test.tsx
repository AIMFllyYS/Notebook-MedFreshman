import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AgentSettingsOverlay from "./AgentSettingsOverlay";
import { useStore } from "@/lib/stores/ui";

vi.mock("@/components/chat/ChatSettings", () => ({
  default: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="chat-settings-workspace">
      <button type="button" onClick={onClose}>返回对话</button>
    </div>
  ),
}));

describe("AgentSettingsOverlay", () => {
  beforeEach(() => {
    useStore.setState({ agentSettingsOpen: false });
  });

  afterEach(() => {
    cleanup();
    useStore.setState({ agentSettingsOpen: false });
  });

  it("stays closed until the shared store opens it", () => {
    render(<AgentSettingsOverlay />);
    expect(screen.queryByTestId("agent-settings-overlay")).toBeNull();
    expect(screen.queryByRole("dialog", { name: "Agent 设置" })).toBeNull();
  });

  it("renders the existing ChatSettings workspace in a centered dialog", () => {
    useStore.setState({ agentSettingsOpen: true });
    render(<AgentSettingsOverlay />);
    const dialog = screen.getByRole("dialog", { name: "Agent 设置" });
    expect(dialog).toHaveClass("agent-settings-dialog");
    expect(screen.getByTestId("chat-settings-workspace")).toBeInTheDocument();
    expect(dialog.closest("[data-testid=agent-settings-overlay]")).toHaveClass("agent-settings-overlay");
  });

  it("closes from the reused workspace back control", () => {
    useStore.setState({ agentSettingsOpen: true });
    render(<AgentSettingsOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "返回对话" }));
    expect(useStore.getState().agentSettingsOpen).toBe(false);
    expect(screen.queryByTestId("agent-settings-overlay")).toBeNull();
  });

  it("closes when clicking the dimmed backdrop", () => {
    useStore.setState({ agentSettingsOpen: true });
    render(<AgentSettingsOverlay />);
    fireEvent.mouseDown(screen.getByTestId("agent-settings-overlay"));
    expect(useStore.getState().agentSettingsOpen).toBe(false);
  });
});
