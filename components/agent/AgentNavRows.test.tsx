import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "@/lib/stores/settings";
import AgentNavRows from "./AgentNavRows";

vi.mock("next/navigation", () => ({
  usePathname: () => "/agent",
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  useSettings.setState({ locale: "zh" });
});

/** 迁移到词典后仍要能真的切成英文：默认中文，切 locale 后整块导航都跟着变。 */
describe("AgentNavRows 文案语言", () => {
  it("默认渲染中文，且标题与 aria-label 都走词典", () => {
    render(<AgentNavRows onNewChat={() => {}} />);
    expect(screen.getByTestId("agent-nav-new-chat")).toHaveTextContent("新对话");
    expect(screen.getByTestId("agent-nav-assets")).toHaveTextContent("我的资产");
    expect(screen.getByTestId("agent-nav-scheduled")).toHaveTextContent("定时任务");
    expect(screen.getByTestId("agent-nav-plugins")).toHaveTextContent("插件市场");
    expect(screen.getByTestId("agent-nav")).toHaveAttribute("aria-label", "Agent 板块导航");
  });

  it("切到 en 后渲染英文", () => {
    render(<AgentNavRows onNewChat={() => {}} />);
    act(() => {
      useSettings.getState().setLocale("en");
    });
    expect(screen.getByTestId("agent-nav-new-chat")).toHaveTextContent("New chat");
    expect(screen.getByTestId("agent-nav-assets")).toHaveTextContent("My assets");
    expect(screen.getByTestId("agent-nav-scheduled")).toHaveTextContent("Scheduled");
    expect(screen.getByTestId("agent-nav-plugins")).toHaveTextContent("Plugins");
    expect(screen.getByTestId("agent-nav")).toHaveAttribute("aria-label", "Agent section navigation");
  });
});
