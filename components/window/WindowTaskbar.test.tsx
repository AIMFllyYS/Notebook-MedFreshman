import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { strToU8, zipSync } from "fflate";
import WindowTaskbar from "./WindowTaskbar";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { MAX_LOCAL_FILE_SIZE } from "@/lib/ai/imageUtils";

describe("WindowTaskbar add content", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    useUserNotes.setState({ byId: {}, order: [] });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    useUserNotes.setState({ byId: {}, order: [] });
  });

  it("keeps a glowing plus slot available and opens a URL as a taskbar window", () => {
    render(<WindowTaskbar host="topbar" />);
    fireEvent.click(screen.getByRole("button", { name: "添加内容" }));
    const menu = screen.getByRole("menu", { name: "添加内容" });
    expect(menu).toBeVisible();
    expect(menu.parentElement).toBe(document.body);

    fireEvent.change(screen.getByRole("textbox", { name: "网址" }), { target: { value: "example.com/course" } });
    fireEvent.click(screen.getByRole("button", { name: "打开" }));

    const preview = useWindowManager.getState().windows.find((win) => win.type === "source-preview");
    expect(preview?.title).toBe("网址 · example.com");
    expect(preview?.data).toMatchObject({ url: "https://example.com/course" });
    expect(screen.getByRole("button", { name: "添加内容" })).toBeVisible();
  });

  it("shows a modal when a local file exceeds the workspace limit", async () => {
    const { container } = render(<WindowTaskbar host="topbar" />);
    const file = new File(["x"], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: MAX_LOCAL_FILE_SIZE + 1 });
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("alertdialog", { name: "文件添加失败" })).toHaveTextContent("超过 100 MB");
    });
  });

  it("creates a markdown note window from the plus menu", () => {
    render(<WindowTaskbar host="topbar" />);
    fireEvent.click(screen.getByRole("button", { name: "添加内容" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /新建笔记/ }));

    const noteWin = useWindowManager.getState().windows.find((win) => win.type === "user-notes");
    expect(noteWin).toBeDefined();
    expect(noteWin?.title).toMatch(/我的笔记/);
    expect(screen.getByRole("button", { name: "添加内容" })).toBeVisible();
  });

  it("opens a note citation picker from the plus menu", () => {
    render(<WindowTaskbar host="topbar" />);
    fireEvent.click(screen.getByRole("button", { name: "添加内容" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /引用笔记/ }));
    expect(screen.getByRole("searchbox", { name: "搜索笔记" })).toBeVisible();
    expect(screen.getByRole("button", { name: "引用到对话" })).toBeDisabled();
  });

  it("opens a flashcard citation picker from the plus menu", () => {
    render(<WindowTaskbar host="topbar" />);
    fireEvent.click(screen.getByRole("button", { name: "添加内容" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /引用复习闪卡/ }));
    expect(screen.getByRole("searchbox", { name: "搜索闪卡" })).toBeVisible();
    expect(screen.getByRole("button", { name: "引用到对话" })).toBeDisabled();
  });

  it("opens a pptx as PowerPoint, not PDF", async () => {
    const { container } = render(<WindowTaskbar host="topbar" />);
    const archive = zipSync({ "ppt/slides/slide1.xml": strToU8("<p:sld><a:t>第一页</a:t></p:sld>") });
    const file = new File([archive], "课.slides.pptx", {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
      const preview = useWindowManager.getState().windows.find((win) => win.type === "attachment-preview");
      expect(preview?.data).toMatchObject({
        kind: "ppt",
        name: "课.slides.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
    });
  });
});
