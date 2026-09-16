import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserNoteLayer from "./UserNoteLayer";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useChatUI } from "@/lib/stores/chatUI";
import { createAndOpenNote, openNoteLibrary } from "@/lib/notes/openUserNote";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
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
      libraryOpen: false,
      libraryIntent: "browse",
      librarySubjectId: null,
    });
    useChatUI.getState().clearQuotedText();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("edits markdown in split view and live-renders formulas", () => {
    const id = createAndOpenNote("probability");
    render(<UserNoteLayer />);

    const editor = screen.getByLabelText("笔记正文（Markdown）");
    fireEvent.change(editor, {
      target: { value: "# 期望\n\n行内 $E(X)=\\lambda$\n\n$$\\int_0^1 x\\,dx$$" },
    });

    expect(useUserNotes.getState().byId[id]?.title).toBe("期望");
    expect(screen.getByLabelText("笔记标题")).toHaveValue("期望");
    expect(screen.getByText("期望", { selector: "h1" })).toBeTruthy();
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
