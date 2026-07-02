import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveChapterId } from "./store.ts";

test("deriveChapterId：detail 分类从 itemId 推导 chXX", () => {
  assert.equal(deriveChapterId("detail", "1.1"), "ch01");
  assert.equal(deriveChapterId("detail", "12.3"), "ch12");
  assert.equal(deriveChapterId("detail", "7"), "ch07");
});

test("deriveChapterId：recording 分类直接用 itemId", () => {
  assert.equal(deriveChapterId("recording", "rec-01"), "rec-01");
  assert.equal(deriveChapterId("recording", "rec-12"), "rec-12");
});

test("deriveChapterId：english 分类直接用 itemId", () => {
  assert.equal(deriveChapterId("english", "unit-1"), "unit-1");
  assert.equal(deriveChapterId("english", "unit-4"), "unit-4");
});

test("deriveChapterId：textbook 分类映射为 tb-chXX", () => {
  assert.equal(deriveChapterId("textbook", "ch00"), "tb-ch00");
  assert.equal(deriveChapterId("textbook", "ch01"), "tb-ch01");
  assert.equal(deriveChapterId("textbook", "ch01-2"), "tb-ch01");
  assert.equal(deriveChapterId("textbook", "ch08-3"), "tb-ch08");
  assert.equal(deriveChapterId("textbook", "toc"), "");
});

test("deriveChapterId：非 detail/recording/english/textbook 返回空串", () => {
  assert.equal(deriveChapterId("summary", "sum-01"), "");
  assert.equal(deriveChapterId("quiz", "ch01"), "");
});

test("deriveChapterId：detail 但 itemId 无数字前缀返回空串", () => {
  assert.equal(deriveChapterId("detail", "abc"), "");
  assert.equal(deriveChapterId("detail", "unit-1"), "");
});

test("deriveChapterId：前导零补齐到 2 位", () => {
  assert.equal(deriveChapterId("detail", "1.1"), "ch01");
  assert.equal(deriveChapterId("detail", "01.1"), "ch01");
});
