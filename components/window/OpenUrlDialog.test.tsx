import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import OpenUrlDialog, { parseOpenableUrl } from "./OpenUrlDialog";
import { SPOTLIGHT_BODY_CLASS, SPOTLIGHT_PANEL_CLASS } from "@/components/search/spotlightChrome";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
});

describe("parseOpenableUrl", () => {
  it("accepts bare hosts and html paths", () => {
    expect(parseOpenableUrl("example.com/course")).toMatchObject({
      href: "https://example.com/course",
      hostname: "example.com",
      isHtml: false,
    });
    expect(parseOpenableUrl("https://notes.example/page.html#sec")).toMatchObject({
      href: "https://notes.example/page.html#sec",
      isHtml: true,
    });
  });

  it("rejects empty or incomplete addresses", () => {
    expect(parseOpenableUrl("")).toBeNull();
    expect(parseOpenableUrl("   ")).toBeNull();
    expect(parseOpenableUrl("http://")).toBeNull();
  });
});

describe("OpenUrlDialog", () => {
  it("reuses the search spotlight panel and stays shorter than the results body", () => {
    render(<OpenUrlDialog open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "输入网址" });
    expect(dialog).toHaveClass(...SPOTLIGHT_PANEL_CLASS.split(" "));
    expect(dialog.innerHTML).not.toContain("max-h-[58vh]");
    expect(SPOTLIGHT_BODY_CLASS).toContain("max-h-[58vh]");
  });

  it("shows a validation error instead of opening a preview", () => {
    render(<OpenUrlDialog open onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "打开" }));
    expect(screen.getByText("请输入有效的 http:// 或 https:// 地址")).toBeInTheDocument();
    expect(useWindowManager.getState().windows).toHaveLength(0);
  });
});
