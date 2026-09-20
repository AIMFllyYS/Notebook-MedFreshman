import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgentSourceDock from "./AgentSourceDock";
import { translate } from "@/lib/i18n";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useStore } from "@/lib/stores/ui";

const zh = (key: string, vars?: Record<string, string | number>) => translate("zh", key, vars);

const sources: TraceSource[] = [
  { kind: "web", title: "细胞膜", url: "https://www.example.edu/cell", snippet: "片段" },
  { kind: "note", title: "心肌", path: "anatomy/textbook/ch09", snippet: "片段" },
];
const rounds: SourceRound[] = [{ id: "webSearch:0:细胞膜", tool: "webSearch", query: "细胞膜", sources }];

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ agentDockCollapsed: true });
});

describe("AgentSourceDock", () => {
  it("stays hidden when the right panel is already open", () => {
    render(<AgentSourceDock rounds={rounds} sources={sources} hidden />);
    expect(screen.queryByTestId("agent-source-dock")).not.toBeInTheDocument();
  });

  it("stays hidden when this conversation produced no sources", () => {
    render(<AgentSourceDock rounds={[]} sources={[]} hidden={false} />);
    expect(screen.queryByTestId("agent-source-dock")).not.toBeInTheDocument();
  });

  it("shows the count with host and note labels", () => {
    render(<AgentSourceDock rounds={rounds} sources={sources} hidden={false} />);
    expect(screen.getByText(zh("agent.sources.count", { count: 2 }))).toBeVisible();
    expect(screen.getByText("example.edu")).toBeVisible();
    // 笔记 chip 显示标题而不是路径尾段——「ch09」认不出是哪篇。
    expect(screen.getByText("心肌")).toBeVisible();
  });

  it("opens the docked source trace window on click", () => {
    render(<AgentSourceDock rounds={rounds} sources={sources} hidden={false} />);
    fireEvent.click(screen.getByTestId("agent-source-dock"));
    const opened = useWindowManager.getState().windows.find((win) => win.type === "source-trace-viewer");
    expect(opened).toBeTruthy();
    expect((opened?.data as { rounds?: SourceRound[] } | undefined)?.rounds).toHaveLength(1);
  });
});
