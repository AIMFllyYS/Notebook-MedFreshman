import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { APP_MENU_Z_INDEX, computeAnchoredMenuBox } from "@/lib/ui/anchoredMenuPosition";
import AnchoredMenu from "./AnchoredMenu";
import AppSelect from "./AppSelect";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mockAnchorLayout(anchor: { left: number; top: number; width: number; height: number }, menuHeight = 160) {
  const bottom = anchor.top + anchor.height;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.tagName === "BUTTON" && this.getAttribute("aria-haspopup")) {
      return {
        left: anchor.left,
        top: anchor.top,
        right: anchor.left + anchor.width,
        bottom,
        width: anchor.width,
        height: anchor.height,
        x: anchor.left,
        y: anchor.top,
        toJSON() {},
      };
    }
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON() {},
    };
  });
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("role") === "listbox" || this.getAttribute("role") === "menu" ? menuHeight : 36;
  });
}

describe("AnchoredMenu placement", () => {
  it("stays hidden at an unusable 0×0 rect instead of flashing at 8,8", async () => {
    mockAnchorLayout({ left: 0, top: 0, width: 0, height: 0 });
    render(
      <AnchoredMenu label="全局字体" role="listbox" testId="font-select" trigger={<span>系统默认</span>}>
        {() => <button type="button" role="option">思源宋体</button>}
      </AnchoredMenu>,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("font-select"));
    });
    const menu = screen.getByRole("listbox", { name: "全局字体" });
    expect(menu).toHaveAttribute("data-placed", "false");
    expect(menu.style.left).toBe("0px");
    expect(menu.style.top).toBe("0px");
    expect(menu.style.left).not.toBe("8px");
    expect(menu.style.top).not.toBe("8px");
  });

  it("writes the measured box before becoming visible", async () => {
    const anchor = { left: 400, top: 200, width: 240, height: 36 };
    mockAnchorLayout(anchor, 180);
    render(
      <AnchoredMenu label="摘录模型" role="listbox" testId="record-model" width={280} trigger={<span>DeepSeek</span>}>
        {() => <button type="button" role="option">DeepSeek V4 Flash</button>}
      </AnchoredMenu>,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("record-model"));
    });
    const expected = computeAnchoredMenuBox({
      anchor: { ...anchor, bottom: 236 },
      menuHeight: 180,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      preferredWidth: 280,
    });
    const menu = screen.getByRole("listbox", { name: "摘录模型" });
    expect(menu).toHaveAttribute("data-placed", "true");
    expect(menu.style.left).toBe(`${expected.left}px`);
    expect(menu.style.top).toBe(`${expected.top}px`);
    expect(menu.style.zIndex).toBe(String(APP_MENU_Z_INDEX));
  });

  it("retries after the first fixed-layout rect is 0", async () => {
    let usable = false;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (!(this.tagName === "BUTTON" && this.getAttribute("aria-haspopup"))) {
        return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
      }
      if (!usable) {
        return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
      }
      return { left: 360, top: 280, right: 600, bottom: 316, width: 240, height: 36, x: 360, y: 280, toJSON() {} };
    });
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.getAttribute("role") === "listbox" ? 140 : 36;
    });

    render(
      <AppSelect
        label="全局字体"
        value="system"
        onValueChange={() => {}}
        options={[
          { value: "system", label: "系统默认" },
          { value: "song", label: "思源宋体" },
        ]}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "全局字体" }));
    });
    expect(screen.getByRole("listbox", { name: "全局字体" })).toHaveAttribute("data-placed", "false");

    usable = true;
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    const menu = screen.getByRole("listbox", { name: "全局字体" });
    expect(menu).toHaveAttribute("data-placed", "true");
    expect(menu.style.left).toBe("360px");
    expect(Number.parseInt(menu.style.top, 10)).toBeGreaterThan(8);
    expect(menu.style.zIndex).toBe(String(APP_MENU_Z_INDEX));
  });
});
