import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgentWorkspace from "./AgentWorkspace";
import { useStore } from "@/lib/stores/ui";

let mobile = false;
let chatReady = true;

vi.mock("@/lib/hooks/useIsMobile", () => ({
  useIsMobile: () => mobile,
}));

vi.mock("next/dynamic", () => ({
  default: (_factory: unknown, options?: { loading?: () => ReactNode }) => {
    return function DynamicChatPanel(props: { chatContext: { subjectId: string } }) {
      if (!chatReady) return options?.loading?.() ?? null;
      return <div data-testid="chat-panel-entry">{props.chatContext.subjectId}</div>;
    };
  },
}));

vi.mock("./AgentConversationSidebar", () => ({
  default: () => <div>对话</div>,
}));

vi.mock("./RightPanel", () => ({
  default: () => <div>窗口</div>,
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
    chatReady = true;
  });

  it("CSR 占位不含加号，避免未挂载的死输入框", () => {
    chatReady = false;
    render(<AgentWorkspace />);
    expect(screen.getByTestId("agent-chat-pending")).toHaveTextContent("正在打开对话");
    expect(document.querySelector('[data-testid="composer-plus"]')).toBeNull();
    expect(screen.queryByTestId("chat-panel-entry")).toBeNull();
  });

  it("桌面三栏槽位 + 复用 ChatPanel 入口，切到 Agent 不崩", () => {
    mobile = false;
    render(<AgentWorkspace />);
    expect(document.querySelector("[data-agent-workspace]")).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="conversations"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).not.toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByTestId("chat-panel-entry")).toBeInTheDocument();
  });

  it("收起时卸下左右槽，主画布留展开按钮", () => {
    mobile = false;
    useStore.setState({
      sidebarCollapsed: true,
      layoutProfile: "full",
      rightCollapsedByProfile: { full: true, article: true, reference: false },
    });
    render(<AgentWorkspace />);
    expect(document.querySelector('[data-agent-slot="conversations"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="windows"]')).toBeNull();
    expect(document.querySelector('[data-agent-slot="main"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "展开对话栏" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开右侧面板" })).toBeInTheDocument();
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
