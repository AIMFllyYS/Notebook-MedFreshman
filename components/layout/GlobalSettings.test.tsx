import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_APPEARANCE_SETTINGS } from "@/lib/theme/appearance";
import { useTheme } from "@/lib/hooks/useTheme";
import GlobalSettings from "./GlobalSettings";
import { useStore } from "@/lib/stores/ui";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

function renderSettings() {
  const anchor = document.createElement("button");
  document.body.appendChild(anchor);
  const anchorRef = { current: anchor } as React.RefObject<HTMLButtonElement>;
  const result = render(<GlobalSettings anchorRef={anchorRef} onClose={() => {}} />);
  return {
    ...result,
    anchor,
  };
}

describe("GlobalSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-appearance");
    document.documentElement.removeAttribute("data-font");
    document.documentElement.removeAttribute("style");
    useTheme.setState({
      theme: "dark",
      hydrated: true,
      appearance: DEFAULT_APPEARANCE_SETTINGS,
    });
    (window as unknown as { scrollTo: () => void }).scrollTo = vi.fn();
    useStore.setState({ agentSettingsOpen: false });
  });

  it("renders score and appearance sections with details collapsed by default", () => {
    renderSettings();

    expect(screen.getByRole("button", { name: /成绩/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /快捷键/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /外观/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "打开 Agent 设置" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    expect(screen.getByText("未登录")).toBeInTheDocument();
    expect(screen.queryByText("清空全部成绩")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "彩色" })).not.toBeInTheDocument();
  });

  it("opens the centered Agent settings overlay from the left dock entry", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    const anchorRef = { current: anchor } as React.RefObject<HTMLButtonElement>;
    render(<GlobalSettings anchorRef={anchorRef} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "打开 Agent 设置" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useStore.getState().agentSettingsOpen).toBe(true);
  });

  it("expands score details and keeps data actions inside the score section", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole("button", { name: /成绩/ }));

    expect(await screen.findByText("已测章节")).toBeInTheDocument();
    expect(await screen.findByText("清空全部成绩")).toBeInTheDocument();
  });

  it("expands keyboard section and shows shortcut toggles", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole("button", { name: /快捷键/ }));

    expect(await screen.findByText("全局搜索")).toBeInTheDocument();
    expect(screen.getByLabelText("启用 全局搜索")).toBeInTheDocument();
  });

  it("expands only one section at a time", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole("button", { name: /成绩/ }));
    expect(await screen.findByText("已测章节")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /外观/ }));
    expect(await screen.findByRole("button", { name: "彩色" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("已测章节")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /成绩/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /^外观$/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("renders 切换学年 and switching years persists the academic year", async () => {
    const user = userEvent.setup();
    renderSettings();
    expect(screen.getByRole("group", { name: "切换学年" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "大二上学期" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "大五" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "大一" }));
    await user.click(screen.getByRole("radio", { name: "大一下学期" }));
    const { useAcademicYear } = await import("@/lib/hooks/useAcademicYear");
    expect(useAcademicYear.getState().year).toBe("freshman-2");
    expect(localStorage.getItem("gailvlun-academic-year")).toBe("freshman-2");
  });

  it("expands appearance controls and applies custom color/font settings", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole("button", { name: /外观/ }));
    await user.click(screen.getByRole("button", { name: "自定义" }));
    fireEvent.change(await screen.findByLabelText("白天主色"), { target: { value: "#1166aa" } });
    await user.click(screen.getByRole("button", { name: "全局字体" }));
    await user.click(screen.getByRole("option", { name: "宋体阅读" }));

    const state = useTheme.getState();
    expect(state.appearance.mode).toBe("custom");
    expect(state.appearance.custom.lightAccent).toBe("#1166aa");
    expect(state.appearance.custom.font).toBe("songti");
    expect(document.documentElement).toHaveAttribute("data-appearance", "custom");
  });
});
