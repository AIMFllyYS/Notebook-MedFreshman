import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgentLinksPane from "./AgentLinksPane";
import { translate } from "@/lib/i18n";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useStore } from "@/lib/stores/ui";

const zh = (key: string, vars?: Record<string, string | number>) => translate("zh", key, vars);

const notes: TraceSource[] = [{ kind: "note", title: "心肌的结构", path: "anatomy/textbook/ch09", snippet: "片段" }];
const web: TraceSource[] = [{ kind: "web", title: "细胞膜", url: "https://example.edu/cell", snippet: "片段" }];
const rounds: SourceRound[] = [
  { id: "searchNotes:0:心肌", tool: "searchNotes", query: "心肌", sources: notes },
  { id: "webSearch:0:细胞膜", tool: "webSearch", query: "细胞膜", sources: web },
];
const all = [...notes, ...web];

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ agentDockCollapsed: true });
});

describe("AgentLinksPane", () => {
  it("explains the empty state instead of rendering a blank panel", () => {
    render(<AgentLinksPane rounds={[]} sources={[]} />);
    expect(screen.getByTestId("agent-links-empty")).toBeVisible();
    expect(screen.getByText(zh("agent.links.empty"))).toBeVisible();
  });

  it("shows every search round together with the query that produced it", () => {
    render(<AgentLinksPane rounds={rounds} sources={all} />);
    // 分组标题取轮次自己的 label，没给才退回工具名——这里锁的是"每一轮都看得见"。
    expect(screen.getAllByText(zh("agent.sources.round.notes")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(zh("agent.sources.round.web")).length).toBeGreaterThan(0);
    expect(screen.getByText(zh("agent.sources.query", { query: "心肌" }))).toBeVisible();
    expect(screen.getByText(zh("agent.sources.query", { query: "细胞膜" }))).toBeVisible();
    expect(screen.getByText("心肌的结构")).toBeVisible();
  });

  it("opens the source panel and expands the right dock when a source is clicked", () => {
    render(<AgentLinksPane rounds={rounds} sources={all} />);
    fireEvent.click(screen.getByText("心肌的结构"));
    expect(useStore.getState().agentDockCollapsed).toBe(false);
    expect(useWindowManager.getState().windows.some((win) => win.type === "source-trace-viewer")).toBe(true);
  });
});
