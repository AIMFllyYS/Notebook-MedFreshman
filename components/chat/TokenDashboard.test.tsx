import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TokenDashboard from "./TokenDashboard";
import { useChatHistory } from "@/lib/stores/chatHistory";

vi.mock("@/components/chat/AccountQuota", () => ({
  AccountQuota: () => <div>会员与额度</div>,
}));
vi.mock("@/lib/billing/syncUsageLedger", () => ({
  refreshBillingFromLedger: vi.fn(),
}));
vi.mock("@/lib/window/openBillingDashboard", () => ({
  openBillingDashboard: vi.fn(),
}));

afterEach(() => {
  cleanup();
  useChatHistory.setState({
    sessionsMeta: [],
    messagesById: {},
    activeSessionId: null,
  });
});

describe("TokenDashboard session storage", () => {
  it("expands the details menu by default and shows this conversation's local storage", async () => {
    useChatHistory.setState({
      activeSessionId: "s1",
      sessionsMeta: [{
        id: "s1",
        title: "测试",
        createdAt: 1,
        updatedAt: 1,
        messageCount: 1,
        artifactIds: [],
      }],
      messagesById: {
        s1: [{
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "hello" }],
          timestamp: 1,
          attachments: [{ id: "blob-1", type: "image", mimeType: "image/png", name: "a.png", size: 20_480 }],
        }],
      },
    });

    render(<TokenDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "打开上下文看板" }));
    const details = document.querySelector("details");
    expect(details).toHaveAttribute("open");
    const conversationBar = await screen.findByRole("progressbar", { name: "对话占用" });
    expect(Number(conversationBar.getAttribute("aria-valuenow"))).toBeLessThan(5);
    expect(screen.getByText(/4\.0 MB/)).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "附件占用" })).toBeNull();
    expect(screen.getByText(/20 KB/)).toBeInTheDocument();
    expect(screen.getByText(/1 个/)).toBeInTheDocument();
  });
});
