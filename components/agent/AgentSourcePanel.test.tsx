import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgentSourcePanel from "./AgentSourcePanel";
import { translate } from "@/lib/i18n";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { SOURCES_PANEL_DEFAULT_SIZE, useAgentCenter } from "@/lib/stores/agentCenter";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useStore } from "@/lib/stores/ui";

const zh = (key: string, vars?: Record<string, string | number>) => translate("zh", key, vars);

/** jsdom 没有 PointerEvent，fireEvent.pointerXxx 造出来的事件不带坐标 —— 用 MouseEvent 带坐标派发。 */
function pointer(el: Element, type: "pointerdown" | "pointermove", x: number, y: number) {
  fireEvent(el, new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
}

const sources: TraceSource[] = [
  { kind: "web", title: "细胞膜的结构", url: "https://www.example.edu/cell", snippet: "磷脂双分子层构成基本骨架。" },
  { kind: "note", title: "心肌", path: "anatomy/textbook/ch09", snippet: "心肌纤维的横纹。" },
];
const rounds: SourceRound[] = [{ id: "webSearch:0:细胞膜", tool: "webSearch", query: "细胞膜", sources }];

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ agentDockCollapsed: true });
  useAgentCenter.setState({ sourcesPanelSize: { ...SOURCES_PANEL_DEFAULT_SIZE }, sourcesPanelOpen: true });
});

describe("AgentSourcePanel", () => {
  it("renders nothing when this conversation produced no sources", () => {
    render(<AgentSourcePanel rounds={[]} sources={[]} />);
    expect(screen.queryByTestId("agent-source-panel")).not.toBeInTheDocument();
  });

  it("looks like a floating card but reserves real width so it never covers the conversation", () => {
    render(<AgentSourcePanel rounds={rounds} sources={sources} />);
    // 卡片本身是浮起来的（圆角 + 阴影 + 留白），像悬浮窗而不是占满整列的侧栏。
    const card = screen.getByTestId("agent-source-panel");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("shadow-");
    expect(card.className).toContain("ml-3");
    // 外层这一列必须占真实宽度：对话列因此被压窄，正文不会钻到卡片底下。
    const column = screen.getByTestId("agent-source-column");
    expect(column.className).toContain("shrink-0");
    expect(column.style.width).toBe(`${SOURCES_PANEL_DEFAULT_SIZE.width + 24}px`);
  });

  it("shows the count plus every source's title, snippet and host", () => {
    render(<AgentSourcePanel rounds={rounds} sources={sources} />);
    expect(screen.getByText(zh("agent.sources.count", { count: 2 }))).toBeVisible();
    expect(screen.getByText("细胞膜的结构")).toBeVisible();
    expect(screen.getByText("磷脂双分子层构成基本骨架。")).toBeVisible();
    expect(screen.getByText("example.edu")).toBeVisible();
    expect(screen.getByText("心肌")).toBeVisible();
    expect(screen.getByText("anatomy/textbook/ch09")).toBeVisible();
  });

  it("opens the source panel and expands the right dock when a card is clicked", () => {
    render(<AgentSourcePanel rounds={rounds} sources={sources} />);
    fireEvent.click(screen.getByText("心肌"));
    expect(useStore.getState().agentDockCollapsed).toBe(false);
    expect(useWindowManager.getState().windows.some((win) => win.type === "source-trace-viewer")).toBe(true);
  });

  it("is resizable from the left edge (drag left = wider)", () => {
    render(<AgentSourcePanel rounds={rounds} sources={sources} />);
    const handle = screen.getByTestId("agent-source-panel-resize-x");
    pointer(handle, "pointerdown", 500, 100);
    pointer(handle, "pointermove", 420, 100);
    // 锚点在右上角：左边缘向左拖 80px = 变宽 80px。
    expect(useAgentCenter.getState().sourcesPanelSize.width).toBe(SOURCES_PANEL_DEFAULT_SIZE.width + 80);
  });

  it("is resizable from the bottom edge and clamps to the minimum", () => {
    render(<AgentSourcePanel rounds={rounds} sources={sources} />);
    const handle = screen.getByTestId("agent-source-panel-resize-y");
    pointer(handle, "pointerdown", 100, 300);
    pointer(handle, "pointermove", 100, -5000);
    // 往上拖到负数：夹到最小高度，而不是变成 NaN 或负值。
    expect(useAgentCenter.getState().sourcesPanelSize.height).toBe(200);
  });
});
