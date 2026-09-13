import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WindowTaskbar from "./WindowTaskbar";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { MAX_LOCAL_FILE_SIZE } from "@/lib/ai/imageUtils";

describe("WindowTaskbar add content", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
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
});
