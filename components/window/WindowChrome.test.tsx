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
