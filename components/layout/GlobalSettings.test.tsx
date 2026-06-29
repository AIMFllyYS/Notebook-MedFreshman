import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_APPEARANCE_SETTINGS } from "@/lib/theme/appearance";
import { useTheme } from "@/lib/hooks/useTheme";
import GlobalSettings from "./GlobalSettings";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
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
  });

  it("renders score and appearance sections with details collapsed by default", () => {
    renderSettings();

    expect(screen.getByRole("button", { name: /成绩/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /快捷键/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /外观/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("清空全部成绩")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "彩色" })).not.toBeInTheDocument();
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

  it("expands appearance controls and applies custom color/font settings", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole("button", { name: /外观/ }));
    await user.click(screen.getByRole("button", { name: "自定义" }));
    fireEvent.change(await screen.findByLabelText("白天主色"), { target: { value: "#1166aa" } });
    await user.selectOptions(screen.getByLabelText("全局字体"), "songti");

    const state = useTheme.getState();
    expect(state.appearance.mode).toBe("custom");
    expect(state.appearance.custom.lightAccent).toBe("#1166aa");
    expect(state.appearance.custom.font).toBe("songti");
    expect(document.documentElement).toHaveAttribute("data-appearance", "custom");
  });
});
