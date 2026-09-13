import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WindowTaskbar from "./WindowTaskbar";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

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
});
