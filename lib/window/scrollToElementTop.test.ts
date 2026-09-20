import assert from "node:assert/strict";
import { test } from "node:test";
import { scrollToElementTop } from "./scrollToElementTop.ts";

type Rect = { top: number };

/** 只用到 getBoundingClientRect / scrollTop，不需要真 DOM。 */
function box(top: number, scrollTop = 0) {
  return {
    scrollTop,
    getBoundingClientRect: (): Rect => ({ top }),
  } as unknown as HTMLElement & { scrollTop: number };
}

test("scrollToElementTop：按 rect 差值滚动，不受 offsetParent 影响", () => {
  // 容器视口顶部在 100，目标元素在 500 → 需要往下滚 400，再留 8px 上边距。
  const container = box(100, 0);
  const element = box(500);
  scrollToElementTop(container, element);
  assert.equal(container.scrollTop, 392);
});

test("scrollToElementTop：元素贴住容器顶时回退到 8px 上边距", () => {
  const container = box(300, 250);
  // 元素比容器顶低 2px，要让它落在 8px 处，就得往回滚 6px。
  const element = box(302);
  scrollToElementTop(container, element);
  assert.equal(container.scrollTop, 244);
});

test("scrollToElementTop：滚到负值会被夹回 0", () => {
  const container = box(300, 20);
  const element = box(100);
  scrollToElementTop(container, element);
  assert.equal(container.scrollTop, 0);
});

test("scrollToElementTop：反向滚动（目标在视口上方）会回退", () => {
  const container = box(400, 1000);
  const element = box(250);
  scrollToElementTop(container, element);
  // 1000 + (250 - 400) - 8 = 842
  assert.equal(container.scrollTop, 842);
});
