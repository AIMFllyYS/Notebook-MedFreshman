import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveUsagePool, type UsagePool } from "./usagePool.ts";

test("resolveUsagePool：平台凭证 → platform", () => {
  const pool: UsagePool = resolveUsagePool(true);
  assert.equal(pool, "platform");
});

test("resolveUsagePool：用户自备 key → byok", () => {
  assert.equal(resolveUsagePool(false), "byok");
});
