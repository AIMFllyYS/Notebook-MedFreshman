import assert from "node:assert/strict";
import { test } from "node:test";
import {
  APP_MENU_Z_INDEX,
  computeAnchoredMenuBox,
  isUsableAnchorRect,
} from "./anchoredMenuPosition";

test("menu z-index covers Agent settings overlay, dialogs, and Mac windows", () => {
  assert.ok(APP_MENU_Z_INDEX > 10000, "Agent settings overlay is 10000");
  assert.ok(APP_MENU_Z_INDEX > 10020, "app-dialog-backdrop is 10020");
  assert.ok(APP_MENU_Z_INDEX > 5000, "ManagedWindow topZ starts at 5000");
});

test("zero-size first layout rect is not usable", () => {
  assert.equal(isUsableAnchorRect({ left: 0, top: 0, bottom: 0, width: 0, height: 0 }), false);
  assert.equal(isUsableAnchorRect({ left: 400, top: 200, bottom: 236, width: 240, height: 36 }), true);
});

test("places the menu under a mid-screen trigger", () => {
  assert.deepEqual(
    computeAnchoredMenuBox({
      anchor: { left: 400, top: 200, bottom: 236, width: 240, height: 36 },
      menuHeight: 180,
      viewport: { width: 1280, height: 800 },
      preferredWidth: 280,
    }),
    { left: 400, top: 242, width: 280, maxHeight: 360 },
  );
});

test("opens upward when preferred placement is top and there is room", () => {
  const box = computeAnchoredMenuBox({
    anchor: { left: 80, top: 600, bottom: 636, width: 160, height: 36 },
    menuHeight: 160,
    viewport: { width: 1280, height: 800 },
    preferredWidth: 240,
    placement: "top",
  });
  assert.equal(box.top, 600 - 160 - 6);
  assert.equal(box.left, 80);
});

test("clamps to the viewport instead of using a top-left fallback", () => {
  const box = computeAnchoredMenuBox({
    anchor: { left: 1200, top: 760, bottom: 796, width: 200, height: 36 },
    menuHeight: 200,
    viewport: { width: 1280, height: 800 },
    preferredWidth: 280,
  });
  assert.ok(box.left >= 8);
  assert.ok(box.left + box.width <= 1280 - 8);
  assert.ok(box.top >= 8);
  assert.notEqual(box.left, 8);
  assert.notEqual(box.top, 8);
});
