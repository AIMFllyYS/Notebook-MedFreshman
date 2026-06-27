import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateTokens } from "./estimateTokens.ts";

test("空字符串返回 0", () => {
  assert.equal(estimateTokens(""), 0);
});

test("纯英文：约 4 字符/token", () => {
  // "hello" = 5 字母 × 0.325 = 1.625 → ceil = 2
  assert.equal(estimateTokens("hello"), 2);
});

test("纯中文：每字 2 token", () => {
  // "你好" = 2 字 × 2 = 4
  assert.equal(estimateTokens("你好"), 4);
});

test("混合中英文", () => {
  // "hello你好" = 5×0.325 + 2×2 = 1.625 + 4 = 5.625 → ceil = 6
  assert.equal(estimateTokens("hello你好"), 6);
});

test("空格计 0.2 token", () => {
  // "a b" = 0.325 + 0.2 + 0.325 = 0.85 → ceil = 1
  assert.equal(estimateTokens("a b"), 1);
});

test("标点计 1 token", () => {
  // "!" = 1
  assert.equal(estimateTokens("!"), 1);
});

test("长文本不抛错", () => {
  const long = "a".repeat(10000);
  const tokens = estimateTokens(long);
  assert.ok(tokens > 0);
  // 10000 × 0.325 = 3250
  assert.equal(tokens, 3250);
});

test("结果始终是整数（ceil）", () => {
  for (const text of ["a", "ab", "abc", "你好世界", "hello world!"]) {
    const result = estimateTokens(text);
    assert.equal(Number.isInteger(result), true);
  }
});
