import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentWorkspace from "./AgentWorkspace";

vi.mock("@/lib/hooks/useIsMobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/components/chat/ChatPanel", () => ({
  default: ({ chatContext }: { chatContext: { subjectId: string } }) => (
    <div data-testid="chat-panel-entry">{chatContext.subjectId}</div>
  ),
}));

vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<{ default: unknown }>) => {
    void loader();
    return ({ chatContext }: { chatContext: { subjectId: string } }) => (
      <div data-testid="chat-panel-entry">{chatContext.subjectId}</div>
    );
  },
}));

describe("AgentWorkspace", () => {
  it("桌面三栏槽位 + 复用 ChatPanel 入口，切到 Agent 不崩", () => {
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).toHaveTextContent("对话");
    expect(document.querySelector('[data-agent-slot="windows"]')).toHaveTextContent("窗口");
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByTestId("chat-panel-entry")).toBeInTheDocument();
  });
});
