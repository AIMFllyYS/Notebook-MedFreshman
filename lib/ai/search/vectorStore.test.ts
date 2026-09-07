import assert from "node:assert/strict";
import { test } from "node:test";
import { cosineSimilarity, cosineSimilarityRow } from "./vectorStore.ts";

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
  const result = cosineSimilarity([1, 0, 0], [1, 0, 0]);
  assert.equal(result, 1);
});

test("cosineSimilarityRow：从矩阵中取一行与 cosineSimilarity 一致", () => {
  const row0 = [1, 0];
  const row1 = [0, 1];
  const matrix = Float32Array.from([...row0, ...row1]);
  assert.equal(cosineSimilarityRow([1, 0], matrix, 0, 2), 1);
  assert.equal(cosineSimilarityRow([1, 0], matrix, 2, 2), 0);
  assert.ok(Math.abs(cosineSimilarityRow([1, 1], matrix, 0, 2) - Math.SQRT1_2) < 1e-6);
});
