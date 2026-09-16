import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatInput from "./ChatInput";
import { useSettings } from "@/lib/hooks/useSettings";
import { useComposerCitations } from "@/lib/hooks/useComposerCitations";
import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { citeUserNotes } from "@/lib/user-notes/workspace";

vi.mock("@/components/chat/TokenDashboard", () => ({ default: () => <div /> }));
vi.mock("@/components/chat/ModelMenu", () => ({ default: () => <div /> }));
vi.mock("@/lib/hooks/useChatUI", () => ({
  useChatUI: () => ({ quotedText: null, clearQuotedText: vi.fn() }),
}));
vi.mock("@/lib/hooks/useImageAttachments", () => ({
  useImageAttachments: () => ({
    attachments: [],
    addFiles: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    toChatFormat: () => [],
    handlePaste: vi.fn(),
    handleDrop: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnter: vi.fn(),
    handleDragLeave: vi.fn(),
    isDragging: false,
    error: null,
    info: null,
  }),
}));

const context = { subjectId: "physics", categoryId: "textbook", itemId: "1", currentTopic: "力学" };

describe("ChatInput composer citations", () => {
  beforeEach(() => {
    useComposerCitations.setState({ citations: [] });
    useUserNotes.setState({ byId: {}, order: [] });
    useSettings.setState({ selectedModelId: "mimo-v2.5", customApiGroups: [], defaultThinking: false, defaultSearch: false });
  });

  afterEach(() => {
    cleanup();
    useComposerCitations.setState({ citations: [] });
    useUserNotes.setState({ byId: {}, order: [] });
  });

  it("只有引用芯片时也能发送，附件是 markdown 文档", () => {
    const onSend = vi.fn();
    const noteId = useUserNotes.getState().create({
      subjectId: "physics",
      title: "动能定理",
      markdown: "$$W = \\Delta E_k$$",
    });
    citeUserNotes([noteId]);
    render(
      <ChatInput onSend={onSend} onStop={vi.fn()} isLoading={false} chatContext={context} />,
    );

    expect(screen.getByText("动能定理")).toBeVisible();
    expect(screen.getByText("笔记")).toBeVisible();
    fireEvent.click(screen.getByTitle("发送"));

    expect(onSend).toHaveBeenCalledWith(
      "请阅读并分析附件",
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            type: "document",
            mimeType: "text/markdown",
            name: "动能定理.md",
            text: expect.stringContaining("$$W = \\Delta E_k$$"),
          }),
        ],
      }),
    );
    expect(useComposerCitations.getState().citations).toEqual([]);
  });
});
