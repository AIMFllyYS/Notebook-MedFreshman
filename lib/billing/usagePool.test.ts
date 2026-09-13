import assert from "node:assert/strict";
import { test } from "node:test";
import { CUSTOM_OPENAI_MODEL_ID } from "@/lib/ai/models";
import {
  resolveMainModelPool,
  resolveSidecarBilling,
  usedPlatformCredentialsForProvider,
  type UsagePool,
} from "./usagePool.ts";

test("侧车用平台 key + 平台主模型 → platform", () => {
  const billing = resolveSidecarBilling({
    usedPlatformCredentials: true,
    mainUsedPlatformCredentials: true,
  });
  const pool: UsagePool | undefined = billing.pool;
  assert.equal(pool, "platform");
  assert.equal(billing.skipInsert, false);
});

test("侧车用平台 key + BYOK 主模型 → byok（我们垫付的平台侧开销）", () => {
  const billing = resolveSidecarBilling({
    usedPlatformCredentials: true,
    mainUsedPlatformCredentials: false,
  });
  assert.equal(billing.pool, "byok");
  assert.equal(billing.skipInsert, false);
});

test("侧车用用户自备 key → 不进任何池（钱是用户自己的）", () => {
  for (const mainUsedPlatformCredentials of [true, false]) {
    const billing = resolveSidecarBilling({
      usedPlatformCredentials: false,
      mainUsedPlatformCredentials,
    });
    assert.equal(billing.skipInsert, true);
    assert.equal(billing.pool, undefined);
  }
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
