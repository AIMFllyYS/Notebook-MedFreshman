import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgentWorkspace from "./AgentWorkspace";
import { useStore } from "@/lib/stores/ui";

let mobile = false;

vi.mock("@/lib/hooks/useIsMobile", () => ({
  useIsMobile: () => mobile,
}));

vi.mock("./AgentConversationSidebar", () => ({
  default: () => <div>对话</div>,
}));

vi.mock("@/components/chat/ChatPanel", () => ({
  default: ({ chatContext }: { chatContext: { subjectId: string } }) => (
    <div data-testid="chat-panel-entry">{chatContext.subjectId}</div>
  ),
}));

describe("AgentWorkspace", () => {
  afterEach(() => {
    cleanup();
    useStore.setState({
      sidebarCollapsed: false,
      layoutProfile: "full",
      rightCollapsedByProfile: { full: false, article: true, reference: false },
    });
    mobile = false;
  });

  it("桌面固定左对话栏 + 中央对话；右侧工作区不在这里（由顶层外壳承载）", () => {
    mobile = false;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).toBeNull();
    expect(screen.getByTestId("chat-panel-entry")).toBeInTheDocument();
  });

  it("左对话栏可收起：槽位消失并留展开按钮", () => {
    mobile = false;
    useStore.setState({ sidebarCollapsed: true });
    render(<AgentWorkspace />);
    expect(document.querySelector('[data-agent-slot="conversations"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "展开对话栏" })).toBeInTheDocument();
  });

  it("手机只留主对话，不套桌面左栏", () => {
    mobile = true;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
  });
});
