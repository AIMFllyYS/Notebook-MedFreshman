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
  it("keeps business actions scrollable next to the dock controls instead of overlapping them", () => {
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
    // 窗口控制按钮与业务动作是兄弟节点，窄栏里不会被业务动作挤走
    expect(actions?.nextElementSibling).toBe(screen.getByTitle("扩展右侧工作区"));
    expect(screen.getByTitle("关闭")).toBeInTheDocument();
    expect(screen.getByTitle("收起当前标签")).toBeInTheDocument();
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
