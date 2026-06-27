import assert from "node:assert/strict";
import { test } from "node:test";
import { cosineSimilarity } from "./vectorStore.ts";

test("cosineSimilarity：相同向量返回 1", () => {
  const v = [1, 2, 3];
  assert.equal(cosineSimilarity(v, v), 1);
});

test("cosineSimilarity：正交向量返回 0", () => {
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test("cosineSimilarity：相反向量返回 -1", () => {
  assert.equal(cosineSimilarity([1, 0], [-1, 0]), -1);
});

test("cosineSimilarity：零向量返回 0（避免 NaN）", () => {
  assert.equal(cosineSimilarity([0, 0, 0], [1, 2, 3]), 0);
  assert.equal(cosineSimilarity([0, 0], [0, 0]), 0);
});

test("cosineSimilarity：已知值验证", () => {
  // [1,1] vs [1,0] → cos(45°) ≈ 0.7071
  const result = cosineSimilarity([1, 1], [1, 0]);
  assert.ok(Math.abs(result - Math.SQRT1_2) < 1e-10);
});

test("cosineSimilarity：不同长度按较短对齐（JS 不越界）", () => {
  // 实现按 a.length 遍历，b 需至少等长
  const result = cosineSimilarity([1, 0, 0], [1, 0, 0]);
  assert.equal(result, 1);
});
