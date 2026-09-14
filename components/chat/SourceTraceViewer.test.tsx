import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SourceTraceViewer from "./SourceTraceViewer";
import { openSourceTrace, openWebSearchSources } from "@/lib/chat/openSourceTrace";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

describe("SourceTraceViewer", () => {
  beforeEach(() => {
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  afterEach(() => {
    cleanup();
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  it("shows a left-hand source directory and keeps notes in the window", () => {
    openSourceTrace([
      { kind: "note", title: "课堂笔记", path: "probability/detail/1.1", snippet: "样本空间" },
      { kind: "web", title: "维基百科", url: "https://example.org/wiki", snippet: "定义" },
    ]);
    render(<SourceTraceViewer />);
    expect(screen.getByLabelText("来源目录")).toBeVisible();
    expect(screen.getByText("课堂笔记")).toBeVisible();
    expect(screen.getByText("维基百科")).toBeVisible();
    expect(screen.getByText("样本空间")).toBeVisible();
    fireEvent.click(screen.getByText("维基百科"));
    expect(screen.getByTitle("维基百科")).toHaveAttribute("src", "https://example.org/wiki");
    expect(screen.getByRole("link", { name: "https://example.org/wiki" })).toHaveAttribute("href", "https://example.org/wiki");
    expect(useWindowManager.getState().windows).toHaveLength(1);
  });

  it("gives unique keys when several web sources have no url", () => {
    openSourceTrace([
      { kind: "web", title: "空链接甲", url: "", snippet: "甲" },
      { kind: "web", title: "空链接乙", url: "", snippet: "乙" },
    ]);
    render(<SourceTraceViewer />);
    expect(screen.getAllByText("空链接甲").length).toBeGreaterThan(0);
    expect(screen.getAllByText("空链接乙").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText("空链接乙")[0]);
    expect(screen.getByText("乙")).toBeVisible();
    expect(screen.getByTestId("web-source-address")).toHaveTextContent("此来源未提供链接");
  });

  it("opens one window for a web-search result set", () => {
    openWebSearchSources(
      [
        { title: "课程 A", url: "https://example.edu/a", snippet: "摘要 A" },
        { title: "课程 B", url: "https://example.edu/b", snippet: "摘要 B" },
      ],
      "https://example.edu/b",
    );
    render(<SourceTraceViewer />);
    expect(useWindowManager.getState().windows).toHaveLength(1);
    expect(screen.getByText("课程 A")).toBeVisible();
    expect(screen.getByTitle("课程 B")).toHaveAttribute("src", "https://example.edu/b");
    expect(screen.getByRole("link", { name: "https://example.edu/b" })).toHaveAttribute("href", "https://example.edu/b");
    fireEvent.click(screen.getByText("课程 A"));
    expect(screen.getByRole("link", { name: "https://example.edu/a" })).toHaveAttribute("href", "https://example.edu/a");
  });
});
