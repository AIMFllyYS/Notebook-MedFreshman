import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { strToU8, zipSync } from "fflate";
import AttachmentPreviewViewer, { lockHtmlPreviewToLocal } from "./AttachmentPreviewViewer";
import { openAttachmentPreview } from "@/lib/chat/openAttachmentPreview";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

describe("AttachmentPreviewViewer", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
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
    expect(frame.getAttribute("srcdoc")).toContain("<h1>力学</h1>");
    expect(screen.getByText("仅本地")).toBeVisible();
  });

  it("uses the shared macOS minimize control and keeps a taskbar-restorable window", () => {
    openAttachmentPreview("pdf", {
      name: "lecture.pdf", mimeType: "application/pdf", kind: "pdf",
      content: "blob:http://localhost/test-pdf",
    });
    render(<AttachmentPreviewViewer />);

    const win = screen.getByTestId("attachment-preview-window");
    expect(win).toBeInTheDocument();
    expect(screen.getByTestId("document-workspace-resize-handle")).toBeVisible();
    fireEvent.click(screen.getByTitle("最小化"));
    expect(useWindowManager.getState().windows[0]?.minimized).toBe(true);
    expect(win).toHaveStyle({ display: "none" });
  });

  it("reuses the shared Markdown renderer for .md previews", () => {
    openAttachmentPreview("md", {
      name: "outline.md", mimeType: "text/markdown", kind: "markdown",
      content: "# 复习提纲\n\n- 第一章",
    });
    render(<AttachmentPreviewViewer />);
    expect(screen.getByRole("heading", { name: "复习提纲" })).toBeVisible();
    expect(screen.getByText("第一章")).toBeVisible();
    expect(screen.queryByTestId("document-workspace-resize-handle")).not.toBeInTheDocument();
  });

  it("shows PPTX slide text as local slide cards", async () => {
    const archive = zipSync({ "ppt/slides/slide1.xml": strToU8("<p:sld><a:t>考试重点</a:t></p:sld>") });
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${Buffer.from(archive).toString("base64")}`;
    openAttachmentPreview("pptx", {
      name: "重点.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      kind: "ppt", content: dataUrl,
    });
    render(<AttachmentPreviewViewer />);
    await waitFor(() => {
      expect(screen.getAllByText("考试重点").length).toBeGreaterThan(0);
    });
    expect(screen.getByTestId("document-workspace-resize-handle")).toBeVisible();
  });

  it("does not send a pptx through the PDF renderer even if kind was stored as pdf", async () => {
    const archive = zipSync({ "ppt/slides/slide1.xml": strToU8("<p:sld><a:t>第一页标题</a:t></p:sld>") });
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${Buffer.from(archive).toString("base64")}`;
    openAttachmentPreview("pptx-misfiled", {
      name: "课.slides.pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      kind: "pdf",
      content: dataUrl,
    });
    render(<AttachmentPreviewViewer />);
    await waitFor(() => {
      expect(screen.getAllByText("第一页标题").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText("无法渲染 PDF")).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid PDF structure/i)).not.toBeInTheDocument();
  });
});

describe("lockHtmlPreviewToLocal", () => {
  it("inserts the offline policy before uploaded head content", () => {
    const locked = lockHtmlPreviewToLocal("<html><head><link href='https://example.com/x.css'></head><body>ok</body></html>");
    expect(locked.indexOf("Content-Security-Policy")).toBeLessThan(locked.indexOf("<link"));
    expect(locked).toContain("form-action 'none'");
  });
});
