import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sparkles } from "lucide-react";
import WindowChrome from "@/components/window/WindowChrome";

function renderWindowChrome(actions?: React.ReactNode) {
  return render(
    <WindowChrome
      title="记录到复习板 · 有机化学"
      icon={<Sparkles data-testid="window-title-icon" size={15} />}
      onClose={vi.fn()}
      onMinimize={vi.fn()}
      onFullscreen={vi.fn()}
      isFullscreen={false}
      actions={actions}
    >
      <div>body</div>
    </WindowChrome>,
  );
}

describe("WindowChrome", () => {
  it("dock 窗口只留可横滚的业务动作行：标题与放大/缩小/关闭都交给标签条", () => {
    render(
      <WindowChrome
        title="笔记"
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onFullscreen={vi.fn()}
        isFullscreen={false}
        surface="dock"
        actions={<button type="button">业务动作</button>}
      >
        <div>body</div>
      </WindowChrome>,
    );

    const actions = screen.getByText("业务动作").closest('[data-testid="window-chrome-actions"]');
    expect(actions).not.toBeNull();
    expect(actions).toHaveClass("min-w-0", "overflow-x-auto");
    expect(screen.queryByTitle("关闭")).toBeNull();
    expect(screen.queryByTitle("收起当前标签")).toBeNull();
    expect(screen.queryByTitle("扩展右侧工作区")).toBeNull();
    expect(screen.queryByText("笔记")).toBeNull();
  });

  it("dock 窗口没有业务动作时整行标题栏都不渲染", () => {
    const { container } = render(
      <WindowChrome
        title="笔记"
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onFullscreen={vi.fn()}
        isFullscreen={false}
        surface="dock"
      >
        <div>body</div>
      </WindowChrome>,
    );

    expect(container.querySelector(".window-chrome-header")).toBeNull();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("centers the title independently from mac traffic buttons and right actions", () => {
    renderWindowChrome(<button type="button">extra action</button>);

    const title = screen.getByText("记录到复习板 · 有机化学");
    const titleWrap = title.parentElement;
    const header = titleWrap?.parentElement;

    expect(header).toHaveClass("relative");
    expect(titleWrap).toHaveClass("absolute", "inset-x-24", "justify-center");
    expect(titleWrap).not.toHaveClass("pl-4");
  });
});
