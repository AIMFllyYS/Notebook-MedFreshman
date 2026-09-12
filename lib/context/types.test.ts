import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCustomModelRegistryId, DEFAULT_MODEL_ID, getModelInfo, type CustomApiGroup } from "@/lib/ai/models";
import { FullContextManager } from "./fullContext.ts";
import { getMaxTokens, MODEL_TOKEN_LIMITS } from "./types.ts";

const groups: CustomApiGroup[] = [{
  id: "g",
  name: "G",
  baseUrl: "https://custom.invalid/v1",
  apiKey: "k",
  models: [{ id: "tiny", contextK: 32 }, { id: "wide", contextK: 1000 }],
}];

test("getMaxTokens：自定义模型按其 contextK，内置模型行为不变", () => {
  const tiny = buildCustomModelRegistryId("g", "tiny");
  const wide = buildCustomModelRegistryId("g", "wide");
  assert.equal(getMaxTokens(tiny, groups), 32_000);
  assert.equal(getMaxTokens(wide, groups), 1_000_000);

  const builtin = getModelInfo(DEFAULT_MODEL_ID);
  assert.ok(builtin?.contextK);
  assert.equal(getMaxTokens(DEFAULT_MODEL_ID), builtin.contextK * 1000);
  assert.equal(getMaxTokens(DEFAULT_MODEL_ID, groups), builtin.contextK * 1000);
});

test("getMaxTokens：看不见分组时 custom id 回落 128k，未知 id 回落 default", () => {
  const tiny = buildCustomModelRegistryId("g", "tiny");
  assert.equal(getMaxTokens(tiny), MODEL_TOKEN_LIMITS.default);
  assert.equal(getMaxTokens("nope"), 128_000);
});

test("FullContextManager：自定义 contextK 进入 maxTokens / overflow 口径", async () => {
  const id = buildCustomModelRegistryId("g", "tiny");
  const manager = new FullContextManager(id, groups);
  const result = await manager.buildContext(
    { subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "古典概型" },
    "q",
  );
  assert.equal(result.maxTokens, 32_000);
  assert.equal(result.overflow, result.tokenCount > 32_000);
  assert.equal(result.cacheHit, false);
});

test("FullContextManager：内置模型 maxTokens 仍按注册表 contextK", async () => {
  const builtin = getModelInfo(DEFAULT_MODEL_ID);
  const manager = new FullContextManager(DEFAULT_MODEL_ID);
  const result = await manager.buildContext(
    { subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "古典概型" },
    "q",
  );
  assert.equal(result.maxTokens, (builtin?.contextK ?? 128) * 1000);
});
