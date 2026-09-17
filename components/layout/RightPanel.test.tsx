import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useStore } from "@/lib/stores/ui";
import { useSettings } from "@/lib/hooks/useSettings";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="dynamic-tab" />,
}));

vi.mock("@/lib/hooks/useIsClient", () => ({
  useIsClient: () => true,
}));

vi.mock("@/lib/hooks/useBrowser", () => ({
  BROWSE_TAB: "browse",
  useBrowser: (sel: (s: Record<string, unknown>) => unknown) =>
    sel({
      bookmarks: [],
      activeTabId: "browse",
      openBrowse: () => {},
      openBookmark: () => {},
      removeBookmark: () => {},
    }),
}));

vi.mock("@/components/browser/BrowserSettingsButton", () => ({
  default: () => <button type="button">浏览器设置</button>,
}));

vi.mock("@/components/window/WindowTaskbar", () => ({
  default: ({ host }: { host: string }) => <div data-testid="window-taskbar-host">{host}</div>,
}));

vi.mock("@/lib/hooks/useAcademicYear", () => ({
  useAcademicYear: (sel: (s: { year: string }) => unknown) => sel({ year: "sophomore-1" }),
}));

import RightPanel from "./RightPanel";

describe("RightPanel layout flags", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettings.setState({ showRightPanelTabBar: true });
    useStore.setState({
      rightTab: "ai",
      rightTabs: ["ai", "video", "interactive", "browser"],
      layoutProfile: "full",
    });
  });

  it("rightTabs=['ai'] 时只渲染一个核心 tab 按钮", () => {
    useStore.setState({ rightTabs: ["ai"], rightTab: "ai", layoutProfile: "article" });
    render(<RightPanel />);
    expect(screen.getByRole("button", { name: "AI 对话" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "动画讲解" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "可交互" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "浏览器" })).not.toBeInTheDocument();
  });

  it("隐藏最顶部标签后不再渲染 AI 对话那一行和栏内收起按钮", () => {
    useSettings.setState({ showRightPanelTabBar: false });
    render(<RightPanel />);
    expect(screen.queryByRole("button", { name: "AI 对话" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "动画讲解" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "收起右侧面板" })).not.toBeInTheDocument();
  });

  it("Agent 模式隐藏 AI tab，并把最小化窗列表放到右栏", () => {
    render(<RightPanel hideAiTab showWindowDock />);
    expect(screen.queryByRole("button", { name: "AI 对话" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "动画讲解" })).toBeInTheDocument();
    expect(screen.getByTestId("window-taskbar-host")).toHaveTextContent("right-panel");
    expect(screen.getByRole("button", { name: "收起右侧面板" })).toBeInTheDocument();
  });

  it("当前 tab 不在允许列表时回退到列表首项", async () => {
    useStore.setState({ rightTabs: ["ai"], rightTab: "video", layoutProfile: "article" });
    render(<RightPanel />);
    await waitFor(() => {
      expect(useStore.getState().rightTab).toBe("ai");
    });
  });
});
