import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgentSourceRail from "./AgentSourceRail";
import { translate } from "@/lib/i18n";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useStore } from "@/lib/stores/ui";

const zh = (key: string, vars?: Record<string, string | number>) => translate("zh", key, vars);

const sources: TraceSource[] = [
  { kind: "web", title: "细胞膜的结构", url: "https://www.example.edu/cell", snippet: "磷脂双分子层构成基本骨架。" },
  { kind: "note", title: "心肌", path: "anatomy/textbook/ch09", snippet: "心肌纤维的横纹。" },
];
const rounds: SourceRound[] = [{ id: "webSearch:0:细胞膜", tool: "webSearch", query: "细胞膜", sources }];

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ agentDockCollapsed: true });
});

describe("AgentSourceRail", () => {
  it("renders nothing when this conversation produced no sources", () => {
    render(<AgentSourceRail rounds={[]} sources={[]} />);
    expect(screen.queryByTestId("agent-source-rail")).not.toBeInTheDocument();
  });

  it("shows the count plus every source's title, snippet and host", () => {
    render(<AgentSourceRail rounds={rounds} sources={sources} />);
    expect(screen.getByText(zh("agent.sources.count", { count: 2 }))).toBeVisible();
    // 能读摘要是这条栏存在的理由：标题和摘要都要真的渲染出来。
    expect(screen.getByText("细胞膜的结构")).toBeVisible();
    expect(screen.getByText("磷脂双分子层构成基本骨架。")).toBeVisible();
    expect(screen.getByText("example.edu")).toBeVisible();
    expect(screen.getByText("心肌")).toBeVisible();
    expect(screen.getByText("anatomy/textbook/ch09")).toBeVisible();
  });

  it("opens the source panel and expands the right dock when a card is clicked", () => {
    render(<AgentSourceRail rounds={rounds} sources={sources} />);
    fireEvent.click(screen.getByText("心肌"));
    expect(useStore.getState().agentDockCollapsed).toBe(false);
    const opened = useWindowManager.getState().windows.find((win) => win.type === "source-trace-viewer");
    expect(opened).toBeTruthy();
  });
});
