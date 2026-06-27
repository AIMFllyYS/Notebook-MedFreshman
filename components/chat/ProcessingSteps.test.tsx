import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProcessingSteps from "./ProcessingSteps";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";

vi.mock("@/components/chat/ReasoningBlock", () => ({
  ReasoningBlock: ({ content }: { content: string }) => (
    <div data-testid="reasoning">{content}</div>
  ),
}));

vi.mock("@/components/chat/ToolCallDashboard", () => ({
  ToolCallDashboard: ({ toolCalls }: { toolCalls: unknown[] }) => (
    <div data-testid="tool-calls">{toolCalls.length} tools</div>
  ),
}));

vi.mock("@/lib/hooks/useProcessingDisclosure", () => ({
  useProcessingDisclosure: (isProcessing: boolean) => {
    const [expanded, setExpanded] = [true, (v?: boolean) => {}];
    return [expanded, setExpanded] as const;
  },
}));

function makeMsg(overrides: Partial<ChatMessageType> = {}): ChatMessageType {
  return {
    id: "msg-1",
    role: "assistant",
    content: "测试内容",
    timestamp: Date.now(),
    ...overrides,
  } as ChatMessageType;
}

describe("ProcessingSteps", () => {
  it("无 reasoning 和 toolCalls 时返回 null", () => {
    const { container } = render(<ProcessingSteps msg={makeMsg()} />);
    expect(container.firstChild).toBeNull();
  });

  it("有 reasoningContent 时渲染推理块", () => {
    const msg = makeMsg({ reasoningContent: "思考过程..." });
    render(<ProcessingSteps msg={msg} />);
    expect(screen.getByTestId("reasoning")).toBeInTheDocument();
    expect(screen.getByText("思考过程...")).toBeInTheDocument();
  });

  it("有 toolCalls 时渲染工具调用面板", () => {
    const msg = makeMsg({
      toolCalls: [{ id: "t1", name: "getCurrentPage", args: {}, status: "done" } as never],
    });
    render(<ProcessingSteps msg={msg} />);
    expect(screen.getByTestId("tool-calls")).toBeInTheDocument();
  });

  it("streaming 时显示正在思考", () => {
    const msg = makeMsg({ reasoningContent: "思考中" });
    render(<ProcessingSteps msg={msg} streaming />);
    expect(screen.getByText(/正在深度思考/)).toBeInTheDocument();
  });

  it("非 streaming 且有内容时显示处理完毕", () => {
    const msg = makeMsg({ reasoningContent: "思考完成" });
    render(<ProcessingSteps msg={msg} />);
    expect(screen.getByText("处理完毕")).toBeInTheDocument();
  });
});
