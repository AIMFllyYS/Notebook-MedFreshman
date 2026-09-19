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

  it("左对话栏可收起：面板留在树上（宽度 0）并留展开按钮", () => {
    mobile = false;
    useStore.setState({ sidebarCollapsed: true });
    render(<AgentWorkspace />);
    // 收起不再卸载面板：分栏库要留着它才能在展开时还原用户上次拖到的宽度。
    const conversations = document.querySelector('[data-agent-slot="conversations"]');
    expect(conversations).not.toBeNull();
    expect(conversations).toHaveAttribute("data-collapsed", "true");
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "展开对话栏" })).toBeInTheDocument();
  });

  it("中间对话面板里没有悬浮的全屏按钮（F11 那个键归顶栏）", () => {
    mobile = false;
    render(<AgentWorkspace />);
    // 悬浮版会压在第一条消息上（实测 1440 下按钮 y=60~92，正文从 48 起），
    // 现在它挂在顶栏、紧贴右侧工作区开关左侧；这里只断言"面板里不再有它"。
    expect(screen.queryByRole("button", { name: "全屏" })).toBeNull();
    expect(screen.queryByRole("button", { name: "退出全屏" })).toBeNull();
    expect(document.querySelector('[data-testid="agent-chat-fullscreen"]')).toBeNull();
    expect(document.querySelector('[data-testid="browser-fullscreen"]')).toBeNull();
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
