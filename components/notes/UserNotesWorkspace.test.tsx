import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserNotesLayer from "./UserNotesLayer";
import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { createAndOpenUserNote, openUserNotesLibrary } from "@/lib/user-notes/workspace";

describe("UserNotesWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    useUserNotes.setState({ byId: {}, order: [] });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    useUserNotes.setState({ byId: {}, order: [] });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  it("分栏编辑 Markdown，预览走 NoteRenderer 渲染公式", () => {
    createAndOpenUserNote("physics");
    render(<UserNotesLayer />);

    expect(screen.getByRole("textbox", { name: "笔记标题" })).toHaveValue("未命名笔记");
    const editor = screen.getByRole("textbox", { name: "笔记正文（Markdown）" });
    expect((editor as HTMLTextAreaElement).value).toContain("$$");
    fireEvent.change(editor, { target: { value: "动能 $$E_k = \\frac{1}{2}mv^2$$" } });

    const katex = document.querySelector(".katex");
    expect(katex).not.toBeNull();
    expect(katex).toHaveTextContent(/E/);
  });

  it("空科目库显示空状态，不自动建笔记", () => {
    openUserNotesLibrary("chemistry");
    render(<UserNotesLayer />);
    expect(screen.getByText("「有机化学」还没有笔记")).toBeVisible();
    expect(useUserNotes.getState().order).toEqual([]);
  });
});
