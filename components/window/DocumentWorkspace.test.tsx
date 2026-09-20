import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DocumentWorkspace from "./DocumentWorkspace";
import { useAppMode } from "@/lib/stores/appMode";

describe("DocumentWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    useAppMode.setState({ mode: "studio", lastStudioPath: "/", hydrated: true });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // 目录列曾经有「固定 13.5rem、不可拖拽」的分支，窄窗口里不是太宽就是太窄。
  // 现在一律可拖拽 —— 这条测试锁住「默认就有分隔条」，别再退回固定宽度。
  it("目录列默认就带可拖拽分隔条，没有固定宽度分支", () => {
    render(
      <DocumentWorkspace outline={[{ id: "1", title: "目录项" }]} activeId="1" onSelect={() => {}}>
        正文
      </DocumentWorkspace>,
    );
    expect(screen.getByLabelText("目录")).toBeVisible();
    expect(screen.getByTestId("document-workspace-resize-handle")).toBeVisible();
  });

  it("带 outlineLabel 时同样可拖拽", () => {
    render(
      <DocumentWorkspace
        outline={[{ id: "1", title: "第一页", meta: "Slide 1" }]}
        activeId="1"
        onSelect={() => {}}
        outlineLabel="幻灯片"
        layoutKey="pptx"
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

  it("Agent 右栏：目录列挂到右侧，并且可以收起/展开", () => {
    useAppMode.setState({ mode: "agent" });
    const { container } = render(
      <DocumentWorkspace outline={[{ id: "1", title: "笔记甲" }]} activeId="1" onSelect={() => {}} outlineLabel="我的笔记">
        正文
      </DocumentWorkspace>,
    );
    const layout = container.querySelector(".document-workspace");
    expect(layout?.getAttribute("data-nav-side")).toBe("right");
    const toggle = screen.getByTestId("document-workspace-nav-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("我的笔记")).toBeVisible();

    fireEvent.click(toggle);
    expect(screen.queryByLabelText("我的笔记")).toBeNull();
    expect(screen.getByTestId("document-workspace-nav-toggle")).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByTestId("document-workspace-nav-toggle"));
    expect(screen.getByLabelText("我的笔记")).toBeVisible();
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
