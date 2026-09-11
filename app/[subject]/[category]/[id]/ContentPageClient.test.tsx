import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LayoutFlags } from "@/lib/content/layoutProfile";
import { useStore } from "@/lib/stores/ui";

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));
vi.mock("@/lib/hooks/useIsMobile", () => ({ useIsMobile: () => false }));
vi.mock("@/lib/hooks/useToc", () => ({ useToc: () => {} }));
vi.mock("@/lib/hooks/useCitationLocator", () => ({ useCitationLocator: () => {} }));
vi.mock("@/components/notes/SelectionPopover", () => ({
  default: () => <div data-testid="selection-popover" />,
}));
vi.mock("@/components/window/WindowTaskbar", () => ({
  default: () => <div data-testid="window-taskbar" />,
}));
vi.mock("@/components/search/GlobalSearchButton", () => ({
  default: () => <button type="button">搜索</button>,
}));
vi.mock("@/lib/content/componentRegistry", () => ({
  ComponentRenderer: () => null,
}));

import ContentPageClient from "./ContentPageClient";

const flagsFull: LayoutFlags = {
  showExamplesTab: true,
  showQuizTab: true,
  showToc: true,
  rightTabs: ["ai", "video", "interactive", "browser"],
  defaultRightCollapsed: false,
  articleMaxWidth: "prose",
};

const flagsArticle: LayoutFlags = {
  showExamplesTab: false,
  showQuizTab: false,
  showToc: true,
  rightTabs: ["ai"],
  defaultRightCollapsed: true,
  articleMaxWidth: "wide",
};

function renderPage(
  overrides: Partial<React.ComponentProps<typeof ContentPageClient>> = {},
) {
  return render(
    <ContentPageClient
      subjectId="physics"
      categoryId="summary"
      itemId="sum-01"
      initialContent="# hi"
      renderedNote={<p>note</p>}
      initialExamples={[]}
      sectionId=""
      exampleChapterId=""
      itemTitle="纪要"
      itemSummary=""
      subjectName="大学物理"
      categoryName="课堂纪要"
      itemStatus="done"
      renderType="markdown"
      layoutProfile="article"
      layoutFlags={flagsArticle}
      {...overrides}
    />,
  );
}

describe("ContentPageClient layout flags", () => {
  beforeEach(() => {
    useStore.setState({ topBarCollapsed: false });
  });

  it("showExamplesTab=false && showQuizTab=false 时无 tab 栏", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /正文/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /例题/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /题目测试/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /纪要/ })).toBeInTheDocument();
    expect(screen.getByTestId("selection-popover")).toBeInTheDocument();
  });

  it("full 时三个 tab", () => {
    renderPage({
      categoryId: "detail",
      itemId: "1.1",
      layoutProfile: "full",
      layoutFlags: flagsFull,
    });
    expect(screen.getByRole("button", { name: /正文/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /例题/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /题目测试/ })).toBeInTheDocument();
  });

  it("article 用更宽阅读列", () => {
    const { container } = renderPage();
    expect(container.querySelector("article")?.className).toContain("max-w-4xl");
  });

  it("reference 也挂载划词弹窗", () => {
    renderPage({
      layoutProfile: "reference",
      layoutFlags: { ...flagsArticle, rightTabs: ["ai"], defaultRightCollapsed: false },
    });
    expect(screen.getByTestId("selection-popover")).toBeInTheDocument();
  });
});
