import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import AttachmentPreviewViewer, { lockHtmlPreviewToLocal } from "./AttachmentPreviewViewer";
import { openAttachmentPreview } from "@/lib/chat/openAttachmentPreview";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

describe("AttachmentPreviewViewer", () => {
  beforeEach(() => {
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  afterEach(() => {
    cleanup();
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  it("renders uploaded HTML in an offline, script-disabled iframe", () => {
    const html = '<!doctype html><html><head><title>课程</title></head><body><script>fetch("https://example.com")</script><h1>力学</h1></body></html>';
    openAttachmentPreview("html", { name: "lesson.html", mimeType: "text/html", kind: "html", content: html });
    render(<AttachmentPreviewViewer />);

    const frame = screen.getByTitle("lesson.html");
    expect(frame).toHaveAttribute("sandbox", "");
    expect(frame.getAttribute("srcdoc")).toContain("Content-Security-Policy");
    expect(frame.getAttribute("srcdoc")).toContain("default-src 'none'");
    expect(frame.getAttribute("srcdoc")).toContain('<h1>力学</h1>');
    expect(screen.getByText("仅本地")).toBeVisible();
  });

  it("uses the shared macOS minimize control and keeps a taskbar-restorable window", () => {
    openAttachmentPreview("pdf", {
      name: "lecture.pdf", mimeType: "application/pdf", kind: "pdf",
      content: "data:application/pdf;base64,JVBERi0xLjc=",
    });
    render(<AttachmentPreviewViewer />);

    expect(screen.getByTitle("lecture.pdf")).toHaveAttribute("src", "data:application/pdf;base64,JVBERi0xLjc=");
    fireEvent.click(screen.getByTitle("最小化"));
    expect(useWindowManager.getState().windows[0]?.minimized).toBe(true);
    expect(screen.queryByTitle("lecture.pdf")).not.toBeInTheDocument();
  });
});

describe("lockHtmlPreviewToLocal", () => {
  it("inserts the offline policy before uploaded head content", () => {
    const locked = lockHtmlPreviewToLocal("<html><head><link href='https://example.com/x.css'></head><body>ok</body></html>");
    expect(locked.indexOf("Content-Security-Policy")).toBeLessThan(locked.indexOf("<link"));
    expect(locked).toContain("form-action 'none'");
  });
});
