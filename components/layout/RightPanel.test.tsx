import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("Agent 右栏没有任何内置栏目，只留窗口坞和收起按钮", () => {
    render(<RightPanel hideBuiltinTabs showWindowDock />);
    expect(screen.queryByRole("button", { name: "AI 对话" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "动画讲解" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "可交互" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "浏览器" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "浏览器设置" })).not.toBeInTheDocument();
    expect(screen.getByTestId("window-taskbar-host")).toHaveTextContent("right-panel");
    expect(screen.getByRole("button", { name: "收起右侧面板" })).toBeInTheDocument();
  });

  it("右栏收起内置栏目时，store 里的 rightTab 停在 video 也不会挂动画讲解", () => {
    useStore.setState({ rightTab: "video" });
    render(<RightPanel hideBuiltinTabs showWindowDock />);
    expect(screen.queryByTestId("dynamic-tab")).not.toBeInTheDocument();
  });

  it("收起按钮默认收起当前档位，传入 onCollapse 时以它为准", async () => {
    const onCollapse = vi.fn();
    useStore.setState({ rightCollapsedByProfile: { full: false, article: true, reference: false } });
    render(<RightPanel onCollapse={onCollapse} />);
    await userEvent.click(screen.getByRole("button", { name: "收起右侧面板" }));
    expect(onCollapse).toHaveBeenCalledTimes(1);
    expect(useStore.getState().rightCollapsedByProfile.full).toBe(false);
  });

  it("当前 tab 不在允许列表时回退到列表首项", async () => {
    useStore.setState({ rightTabs: ["ai"], rightTab: "video", layoutProfile: "article" });
    render(<RightPanel />);
    await waitFor(() => {
      expect(useStore.getState().rightTab).toBe("ai");
    });
  });
});
