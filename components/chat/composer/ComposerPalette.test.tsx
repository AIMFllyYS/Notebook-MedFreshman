import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { APP_MENU_Z_INDEX, computeAnchoredMenuBox } from "@/lib/ui/anchoredMenuPosition";
import ComposerPalette from "./ComposerPalette";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mockAnchorLayout(anchor: { left: number; top: number; width: number; height: number }, menuHeight = 180) {
  const bottom = anchor.top + anchor.height;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute("data-testid") === "composer-plus") {
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
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
  });
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("data-testid") === "composer-palette" ? menuHeight : 36;
  });
}

function PaletteHost({ open = true }: { open?: boolean }) {
  const plusRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(open);
  return (
    <>
      <button ref={plusRef} type="button" data-testid="composer-plus">加</button>
      <ComposerPalette
        open={visible}
        anchorRef={plusRef}
        ignoreRefs={[plusRef]}
        label="对话命令"
        onClose={() => setVisible(false)}
      >
        <button type="button" role="option" aria-selected={false}>生成长文</button>
      </ComposerPalette>
    </>
  );
}

describe("ComposerPalette placement", () => {
  it("stays hidden at an unusable 0×0 rect instead of flashing at 8,8", async () => {
    mockAnchorLayout({ left: 0, top: 0, width: 0, height: 0 });
    render(<PaletteHost />);
    const menu = screen.getByTestId("composer-palette");
    expect(menu).toHaveAttribute("data-placed", "false");
    expect(menu.style.left).toBe("0px");
    expect(menu.style.top).toBe("0px");
    expect(menu.style.left).not.toBe("8px");
    expect(menu.style.top).not.toBe("8px");
  });

  it("portals to body, writes the measured box, then becomes visible", async () => {
    const anchor = { left: 72, top: 540, width: 32, height: 32 };
    mockAnchorLayout(anchor, 200);
    render(<PaletteHost />);
    const expected = computeAnchoredMenuBox({
      anchor: { ...anchor, bottom: 572 },
      menuHeight: 200,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      preferredWidth: 320,
      placement: "top",
    });
    const menu = screen.getByTestId("composer-palette");
    expect(menu.parentElement).toBe(document.body);
    expect(menu).toHaveAttribute("data-placed", "true");
    expect(menu.style.left).toBe(`${expected.left}px`);
    expect(menu.style.top).toBe(`${expected.top}px`);
    expect(menu.style.zIndex).toBe(String(APP_MENU_Z_INDEX));
  });

  it("retries after the first fixed-layout rect is 0", async () => {
    let usable = false;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute("data-testid") !== "composer-plus") {
        return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
      }
      if (!usable) {
        return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
      }
      return { left: 80, top: 560, right: 112, bottom: 592, width: 32, height: 32, x: 80, y: 560, toJSON() {} };
    });
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.getAttribute("data-testid") === "composer-palette" ? 160 : 36;
    });

    render(<PaletteHost />);
    expect(screen.getByTestId("composer-palette")).toHaveAttribute("data-placed", "false");

    usable = true;
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    const menu = screen.getByTestId("composer-palette");
    expect(menu).toHaveAttribute("data-placed", "true");
    expect(menu.style.left).toBe("80px");
    expect(Number.parseInt(menu.style.top, 10)).toBeGreaterThan(8);
  });

  it("does not dismiss when pointerdown hits the ignored plus trigger", () => {
    mockAnchorLayout({ left: 80, top: 540, width: 32, height: 32 });
    render(<PaletteHost />);
    expect(screen.getByTestId("composer-palette")).toBeTruthy();
    fireEvent.pointerDown(screen.getByTestId("composer-plus"));
    expect(screen.getByTestId("composer-palette")).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByTestId("composer-palette")).toBeNull();
  });
});
