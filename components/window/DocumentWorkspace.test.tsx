import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DocumentWorkspace from "./DocumentWorkspace";

describe("DocumentWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps a fixed sidebar without a splitter by default", () => {
    render(
      <DocumentWorkspace outline={[{ id: "1", title: "目录项" }]} activeId="1" onSelect={() => {}}>
        正文
      </DocumentWorkspace>,
    );
    expect(screen.getByLabelText("目录")).toBeVisible();
    expect(screen.queryByTestId("document-workspace-resize-handle")).not.toBeInTheDocument();
  });

  it("shows a draggable splitter when resizable", () => {
    render(
      <DocumentWorkspace
        resizable
        outline={[{ id: "1", title: "第一页", meta: "Slide 1" }]}
        activeId="1"
        onSelect={() => {}}
        outlineLabel="幻灯片"
      >
        舞台
      </DocumentWorkspace>,
    );
    expect(screen.getByLabelText("幻灯片")).toBeVisible();
    expect(screen.getByTestId("document-workspace-resize-handle")).toBeVisible();
  });

  it("splits the left pane so the folder tree sits under the outline", () => {
    render(
      <DocumentWorkspace
        outline={[{ id: "1", title: "笔记甲" }]}
        activeId="1"
        onSelect={() => {}}
        outlineLabel="我的笔记"
        folderTree={<nav aria-label="文件夹">学年树</nav>}
      >
        正文
      </DocumentWorkspace>,
    );
    expect(screen.getByLabelText("我的笔记")).toBeVisible();
    expect(screen.getByLabelText("文件夹")).toBeVisible();
    expect(screen.getByTestId("folder-tree-resize-handle")).toBeVisible();
  });

  it("wraps outline meta when asked so long URLs stay on the panel", () => {
    render(
      <DocumentWorkspace
        outline={[{ id: "1", title: "课程", meta: "https://example.edu/very/long/path", metaWrap: true }]}
        activeId="1"
        onSelect={() => {}}
      >
        正文
      </DocumentWorkspace>,
    );
    const meta = screen.getByText("https://example.edu/very/long/path");
    expect(meta).toBeVisible();
    expect(meta.className).toContain("is-wrap");
  });
});
