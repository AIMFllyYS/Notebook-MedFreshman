import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgentConversationSidebar from "./AgentConversationSidebar";

const historyState = {
  sessionsMeta: [
    { id: "main-1", title: "细胞生物学复习", kind: "main", updatedAt: 1_700_000_000_000, messageCount: 8, preview: "线粒体" },
    { id: "float-1", title: "解释线粒体", kind: "floating", updatedAt: 1_700_000_100_000, messageCount: 3 },
    { id: "note-1", title: "被覆上皮", kind: "note", updatedAt: 1_700_000_200_000, messageCount: 2 },
  ],
  activeSessionId: "main-1",
  createSession: vi.fn(() => "new-1"),
  deleteSession: vi.fn(),
  switchSession: vi.fn(),
};

const restoreWindow = vi.fn();
const openLibrary = vi.fn();

vi.mock("@/lib/hooks/useChatHistory", () => ({
  useChatHistory: Object.assign(
    (selector: (state: typeof historyState) => unknown) => selector(historyState),
    { getState: () => historyState },
  ),
}));
vi.mock("@/lib/hooks/useFloatingChats", () => ({
  useFloatingChats: { getState: () => ({ windows: [], closeWindow: vi.fn(), restoreWindow }) },
}));
vi.mock("@/lib/hooks/useAuthSession", () => ({
  useAuthSession: () => ({ status: "signedOut", email: null }),
}));
vi.mock("@/lib/hooks/useTokenTracker", () => ({
  useTokenTracker: { getState: () => ({ resetSession: vi.fn() }) },
}));
vi.mock("@/lib/notes/openUserNote", () => ({
  openNoteLibrary: (...args: unknown[]) => openLibrary(...args),
}));
vi.mock("./GlobalSettings", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const ctx = {
  subjectId: "anatomy" as const,
  categoryId: "detail",
  itemId: "1.1",
  currentTopic: "anatomy detail 1.1",
};

describe("AgentConversationSidebar", () => {
  it("两栏分组：正常对话与划词助手，笔记会话不出现", () => {
    render(<AgentConversationSidebar chatContext={ctx} />);
    expect(screen.getByTestId("agent-conversation-sidebar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新对话" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "我的资产" })).toBeInTheDocument();
    expect(screen.getByLabelText("正常对话")).toBeInTheDocument();
    expect(screen.getByLabelText("划词助手对话")).toBeInTheDocument();
    expect(screen.getByText("细胞生物学复习")).toBeInTheDocument();
    expect(screen.getByText("解释线粒体")).toBeInTheDocument();
    expect(screen.queryByText("被覆上皮")).toBeNull();
    expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
  });

  it("新对话 / 我的资产 / 点选主对话与划词会话", () => {
    render(<AgentConversationSidebar chatContext={ctx} />);
    fireEvent.click(screen.getByRole("button", { name: "新对话" }));
    expect(historyState.createSession).toHaveBeenCalledWith(ctx);
    fireEvent.click(screen.getByRole("button", { name: "我的资产" }));
    expect(openLibrary).toHaveBeenCalledWith({ intent: "browse" });
    fireEvent.click(screen.getByLabelText("细胞生物学复习"));
    expect(historyState.switchSession).toHaveBeenCalledWith("main-1");
    fireEvent.click(screen.getByLabelText("解释线粒体"));
    expect(restoreWindow).toHaveBeenCalledWith("float-1");
  });
});
