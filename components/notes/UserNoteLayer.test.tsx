import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserNoteLayer from "./UserNoteLayer";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useChatUI } from "@/lib/stores/chatUI";
import { useStore } from "@/lib/stores/ui";
import { applyUpdateUserNoteEvents, resetAppliedUserNoteEdits } from "@/lib/notes/applyUserNoteAgent";
import { createAndOpenNote, openNoteLibrary } from "@/lib/notes/openUserNote";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/components/notes/MilkdownNoteEditor", () => ({
  default: () => <div data-testid="crepe-stub">渲染编辑器</div>,
}));

describe("personal note windows", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    useUserNotes.setState({
      byId: {},
      order: [],
      openEditorIds: [],
      agentEditingNoteId: null,
      libraryOpen: false,
      libraryIntent: "browse",
      librarySubjectId: null,
    });
    useChatUI.getState().clearQuotedText();
    useChatHistory.setState({ messagesById: {}, activeSessionId: null });
    resetAppliedUserNoteEdits();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("edits markdown in split view and live-renders formulas", () => {
    const id = createAndOpenNote("probability");
    render(<UserNoteLayer />);

    fireEvent.click(screen.getByRole("button", { name: "分栏" }));
    const editor = screen.getByLabelText("笔记正文（Markdown）");
    fireEvent.change(editor, {
      target: { value: "# 期望\n\n行内 $E(X)=\\lambda$\n\n$$\\int_0^1 x\\,dx$$" },
    });

    expect(useUserNotes.getState().byId[id]?.title).toBe("期望");
    expect(screen.getByLabelText("笔记标题")).toHaveValue("期望");
    expect(screen.getByText("期望", { selector: "h1" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "分享到对话" }));
    expect(useChatUI.getState().quotedText).toMatch(/【笔记】期望/);
  });

  it("places the AI conversation icon between the title and subject", () => {
    createAndOpenNote("anatomy", { title: "被覆上皮", markdown: "# 被覆上皮" });
    render(<UserNoteLayer />);

    const title = screen.getByLabelText("笔记标题");
    const ai = screen.getByRole("button", { name: "让小岸编辑这篇笔记" });
    const subject = screen.getByText("系统解剖学");
    expect(title.compareDocumentPosition(ai) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(ai.compareDocumentPosition(subject) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(ai.querySelector("svg")).toBeTruthy();
    expect(ai.innerHTML).toMatch(/lucide-message-square|message-square/i);
  });

  it("opens the existing Agent and writes a mocked tool result back into the note", () => {
    const id = createAndOpenNote("anatomy", { title: "被覆上皮", markdown: "旧稿" });
    useStore.setState({ rightTab: "video", mobileTab: "detail" });
    render(<UserNoteLayer />);

    fireEvent.click(screen.getByRole("button", { name: "让小岸编辑这篇笔记" }));
    expect(useUserNotes.getState().agentEditingNoteId).toBe(id);
    expect(useChatUI.getState().quotedText).toMatch(/【笔记】被覆上皮/);
    expect(useStore.getState().rightTab).toBe("ai");

    act(() => {
      useChatHistory.setState({
        messagesById: {
          s1: [
            {
              id: "a1",
              role: "assistant",
              timestamp: 1,
              parts: [
                {
                  type: "tool-updateUserNote",
                  toolCallId: "u-layer",
                  state: "output-available",
                  input: { markdown: "# 被覆上皮\n\n1. 单层扁平" },
                  output: {
                    text: "已写回",
                    noteId: id,
                    markdown: "# 被覆上皮\n\n1. 单层扁平",
                    applied: true,
                  },
                },
              ],
            },
          ],
        },
      });
    });

    expect(useUserNotes.getState().byId[id]?.markdown).toBe("# 被覆上皮\n\n1. 单层扁平");
    expect(screen.getByLabelText("笔记标题")).toHaveValue("被覆上皮");
    expect(applyUpdateUserNoteEvents(Object.values(useChatHistory.getState().messagesById).flat())).toEqual([]);
  });

  it("cites a user note into the chat quote tray from the library", () => {
    const id = useUserNotes.getState().createNote("probability");
    useUserNotes.getState().updateNote(id, { title: "课堂备忘", markdown: "记住 $P(A \\cup B)$。" });
    openNoteLibrary({ subjectId: "probability", intent: "cite" });
    render(<UserNoteLayer />);

    fireEvent.click(screen.getByRole("button", { name: "引用到对话" }));
    expect(useChatUI.getState().quotedText).toMatch(/【笔记】课堂备忘/);
    expect(useChatUI.getState().quotedText).toMatch(/P\(A \\cup B\)/);
  });
});
