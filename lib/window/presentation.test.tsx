import { describe, expect, it } from "vitest";
import { isManagedWindowInteractive, resolveManagedWindowPresentation } from "./presentation";

describe("managed window presentation", () => {
  it("keeps Studio floating and uses a real dock only when the host exists", () => {
    expect(resolveManagedWindowPresentation({ agent: false, mobile: false, dockHostAvailable: false })).toBe("floating");
    expect(resolveManagedWindowPresentation({ agent: true, mobile: false, dockHostAvailable: false })).toBe("pending");
    expect(resolveManagedWindowPresentation({ agent: true, mobile: false, dockHostAvailable: true })).toBe("dock");
  });

  it("falls back to a sheet on narrow Agent screens without requiring a dock node", () => {
    expect(resolveManagedWindowPresentation({ agent: true, mobile: true, dockHostAvailable: false })).toBe("sheet");
    expect(isManagedWindowInteractive({ presentation: "sheet", minimized: false, active: false, dockCollapsed: true })).toBe(true);
  });

  it("only exposes the active, non-collapsed dock surface to window shortcuts", () => {
    expect(isManagedWindowInteractive({ presentation: "dock", minimized: false, active: true, dockCollapsed: false })).toBe(true);
    expect(isManagedWindowInteractive({ presentation: "dock", minimized: false, active: false, dockCollapsed: false })).toBe(false);
    expect(isManagedWindowInteractive({ presentation: "dock", minimized: false, active: true, dockCollapsed: true })).toBe(false);
    expect(isManagedWindowInteractive({ presentation: "dock", minimized: true, active: true, dockCollapsed: false })).toBe(false);
  });
});
