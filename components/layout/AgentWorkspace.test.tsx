import { act, cleanup, render, screen } from "@testing-library/react";
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

vi.mock("./RightPanel", () => ({
  default: () => <div>窗口</div>,
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
      agentPanelOpen: false,
      layoutProfile: "full",
      rightCollapsedByProfile: { full: false, article: true, reference: false },
    });
    mobile = false;
  });

  it("桌面只保留主对话 + 右侧窗坞，左栏不再常驻", () => {
    mobile = false;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByTestId("chat-panel-entry")).toBeInTheDocument();
  });

  it("左侧面板默认不弹出，打开后顶部与导航栏平齐地覆盖显示", () => {
    mobile = false;
    render(<AgentWorkspace />);
    expect(document.querySelector('[data-testid="agent-left-panel"]')).toBeNull();

    act(() => useStore.getState().setAgentPanelOpen(true));
    const panel = document.querySelector('[data-testid="agent-left-panel"]');
    expect(panel).not.toBeNull();
    expect(panel?.closest('[data-testid="agent-left-panel-root"]')).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("dialog");
  });

  it("收起右栏时保留右侧宿主以维持正文实例，主画布留展开按钮", () => {
    mobile = false;
    useStore.setState({
      layoutProfile: "full",
      rightCollapsedByProfile: { full: true, article: true, reference: false },
    });
    render(<AgentWorkspace />);
    expect(document.querySelector('[data-agent-slot="windows"]')).not.toBeNull();
    expect(document.querySelector("[data-agent-dock-host]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "展开右侧面板" })).toBeInTheDocument();
  });

  it("手机不套桌面右侧窗坞，只留主对话，也不渲染左侧面板", () => {
    mobile = true;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="agent-left-panel"]')).toBeNull();
  });
});
