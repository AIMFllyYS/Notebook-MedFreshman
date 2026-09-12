import assert from "node:assert/strict";
import { test } from "node:test";
import { CUSTOM_OPENAI_MODEL_ID } from "@/lib/ai/models";
import {
  resolveMainModelPool,
  resolveUsagePool,
  usedPlatformCredentialsForProvider,
  type UsagePool,
} from "./usagePool.ts";

test("resolveUsagePool：平台凭证 → platform", () => {
  const pool: UsagePool = resolveUsagePool(true);
  assert.equal(pool, "platform");
});

test("resolveUsagePool：用户自备 key → byok", () => {
  assert.equal(resolveUsagePool(false), "byok");
});

test("custom-openai 走平台凭证，不是 BYOK", () => {
  assert.equal(
    usedPlatformCredentialsForProvider({ isCustom: false, registryId: CUSTOM_OPENAI_MODEL_ID }),
    true,
  );
  assert.equal(resolveMainModelPool(true), "platform");
});

test("真自定义分组主模型不进任何池", () => {
  assert.equal(
    usedPlatformCredentialsForProvider({ isCustom: true, registryId: "custom:grp:gpt" }),
    false,
  );
  assert.equal(resolveMainModelPool(false), null);
});

test("内置模型 isCustom=false → 平台池", () => {
  assert.equal(
    usedPlatformCredentialsForProvider({ isCustom: false, registryId: "z-ai/glm-5.3-flash" }),
    true,
  );
});
