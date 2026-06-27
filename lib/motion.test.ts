import assert from "node:assert/strict";
import { test } from "node:test";
import { DURATION, EASE, fadeInUpVariants, scaleInVariants, collapseVariants, tabPanelVariants } from "./motion.ts";

test("DURATION：5 个时长值且为正数", () => {
  assert.ok(DURATION.instant > 0);
  assert.ok(DURATION.fast > 0);
  assert.ok(DURATION.normal > 0);
  assert.ok(DURATION.slow > 0);
  assert.ok(DURATION.sidebar > 0);
});

test("DURATION：递增顺序", () => {
  assert.ok(DURATION.instant < DURATION.fast);
  assert.ok(DURATION.fast < DURATION.normal);
  assert.ok(DURATION.normal < DURATION.slow);
});

test("EASE：4 条曲线各 4 个控制点", () => {
  for (const [name, curve] of Object.entries(EASE)) {
    assert.equal(curve.length, 4, `EASE.${name} 应有 4 个控制点`);
  }
});

test("fadeInUpVariants：有 initial/animate/exit", () => {
  assert.ok(fadeInUpVariants.initial);
  assert.ok(fadeInUpVariants.animate);
  assert.ok(fadeInUpVariants.exit);
});

test("scaleInVariants：有 initial/animate/exit", () => {
  assert.ok(scaleInVariants.initial);
  assert.ok(scaleInVariants.animate);
  assert.ok(scaleInVariants.exit);
});

test("collapseVariants：有 initial/animate/exit", () => {
  assert.ok(collapseVariants.initial);
  assert.ok(collapseVariants.animate);
  assert.ok(collapseVariants.exit);
});

test("tabPanelVariants：dir=1 向右滑入", () => {
  const v = tabPanelVariants(1);
  const initial = v.initial as { x: number };
  assert.ok(initial.x > 0, "dir=1 initial.x 应为正");
});

test("tabPanelVariants：dir=-1 向左滑入", () => {
  const v = tabPanelVariants(-1);
  const initial = v.initial as { x: number };
  assert.ok(initial.x < 0, "dir=-1 initial.x 应为负");
});
