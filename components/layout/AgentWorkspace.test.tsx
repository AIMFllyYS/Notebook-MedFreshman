import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentWorkspace from "./AgentWorkspace";

let mobile = false;

vi.mock("@/lib/hooks/useIsMobile", () => ({
  useIsMobile: () => mobile,
}));

vi.mock("./AgentConversationSidebar", () => ({
  default: () => <div>对话</div>,
}));

vi.mock("./RightPanel", () => ({
  default: () => <div>窗口</div>,
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
    mobile = false;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByTestId("chat-panel-entry")).toBeInTheDocument();
  });

  it("手机不套桌面左对话+右侧窗，只留主对话", () => {
    mobile = true;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
  });
});
