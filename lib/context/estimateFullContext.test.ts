import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateTokens } from "./estimateTokens.ts";
import {
  FIRST_TURN_OVERHEAD_TOKENS,
  RING_APPROACHING_RATIO,
  SOFT_LIMIT_RATIO,
  contextRingCaption,
  contextRingLevel,
  estimateFullContextTokens,
  formatContextCacheValue,
  isSoftLimitReached,
  resolveSessionContextBudget,
} from "./estimateFullContext.ts";

test("estimateFullContextTokens：system + 工具 + 参考 + 历史", () => {
  const systemText = "sys";
  const toolSchemaText = "tool";
  const referenceText = "ref";
  const historyText = "hello";
  assert.equal(
    estimateFullContextTokens({ systemText, toolSchemaText, referenceText, historyText }),
    estimateTokens(systemText) + estimateTokens(toolSchemaText) + estimateTokens(referenceText) + estimateTokens(historyText),
  );
});

test("estimateFullContextTokens：toolDefsTokens 优先于 toolSchemaText", () => {
  assert.equal(
    estimateFullContextTokens({ toolSchemaText: "ignored", toolDefsTokens: 42, historyText: "" }),
    42,
  );
});

test("isSoftLimitReached：与 SOFT_LIMIT_RATIO 对齐", () => {
  assert.equal(SOFT_LIMIT_RATIO, 0.8);
  assert.equal(isSoftLimitReached(8_000, 10_000), true);
  assert.equal(isSoftLimitReached(7_999, 10_000), false);
  assert.equal(isSoftLimitReached(1, 0), false);
});

test("长对话短参考材料也能到 80%（全量口径）", () => {
  const estimated = estimateFullContextTokens({
    systemText: "s",
    toolDefsTokens: 20,
    referenceText: "短页",
    historyText: "x".repeat(8_000),
  });
  assert.ok(estimated > estimateTokens("短页"));
  assert.equal(isSoftLimitReached(estimated, 1_000), true);
});

test("resolveSessionContextBudget：更大窗口上调分母，更小窗口不降", () => {
  assert.equal(resolveSessionContextBudget(0, 128_000), 128_000);
  assert.equal(resolveSessionContextBudget(128_000, 1_000_000), 1_000_000);
  assert.equal(resolveSessionContextBudget(1_000_000, 32_000), 1_000_000);
});

test("contextRingLevel：70–80% 中间态，>=80% 才是软上限红", () => {
  assert.equal(contextRingLevel(0.39), "ok");
  assert.equal(contextRingLevel(0.4), "notice");
  assert.equal(contextRingLevel(RING_APPROACHING_RATIO), "approaching");
  assert.equal(contextRingLevel(0.79), "approaching");
  assert.equal(contextRingLevel(SOFT_LIMIT_RATIO), "limit");
  assert.equal(contextRingCaption("approaching"), "接近 80% 软上限");
  assert.equal(contextRingCaption("limit"), "已达 80% 软上限");
  assert.equal(contextRingCaption("notice"), undefined);
});

test("formatContextCacheValue：绑 cachedTokens 而不是本地 hash 布尔", () => {
  assert.equal(formatContextCacheValue(0), "未命中");
  assert.equal(formatContextCacheValue(24), "命中 24");
});

test("FIRST_TURN_OVERHEAD_TOKENS 保持 3000", () => {
  assert.equal(FIRST_TURN_OVERHEAD_TOKENS, 3000);
});
