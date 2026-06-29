import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveProvider, chatCompletionsUrl, thinkingBudget, ENV_MODEL_FLASH } from "./provider.ts";

test("resolveProvider：custom 端点三要素齐全时用自定义", () => {
  const r = resolveProvider("custom", {
    baseUrl: "https://my.api.com/v1",
    apiKey: "sk-test",
    model: "my-model",
  });
  assert.equal(r.isCustom, true);
  assert.equal(r.configured, true);
  assert.equal(r.baseUrl, "https://my.api.com/v1");
  assert.equal(r.apiKey, "sk-test");
  assert.equal(r.apiModelId, "my-model");
  assert.equal(r.registryId, "custom:my-model");
});

test("resolveProvider：custom 缺少 apiKey 时不走自定义", () => {
  const r = resolveProvider("custom", {
    baseUrl: "https://my.api.com/v1",
    model: "my-model",
  });
  assert.equal(r.isCustom, false);
});

test("resolveProvider：mimo 模型走 MIMO 端点且 apiModelId 一致", () => {
  const r = resolveProvider("mimo-v2.5");
  assert.equal(r.isCustom, false);
  assert.equal(r.registryId, "mimo-v2.5");
  assert.equal(r.apiModelId, "mimo-v2.5");
  assert.ok(r.baseUrl.includes("xiaomimimo") || r.baseUrl === "");
});

test("resolveProvider：智谱独占模型 apiModelId 与注册 id 分离", () => {
  const r = resolveProvider("zai-org/GLM-Z1-AirX");
  assert.equal(r.registryId, "zai-org/GLM-Z1-AirX");
  assert.equal(r.apiModelId, "glm-z1-airx");
  assert.notEqual(r.apiModelId, r.registryId);
  assert.ok(r.baseUrl.includes("bigmodel.cn") || r.baseUrl === "");
});

test("resolveProvider：GLM-4.7-FlashX 使用智谱 api id", () => {
  const r = resolveProvider("zai-org/GLM-4.7-FlashX");
  assert.equal(r.apiModelId, "glm-4-flashx-250414");
});

test("resolveProvider：GLM-5.2 端点链 index 0 为 SiliconFlow", () => {
  const r = resolveProvider("zai-org/GLM-5.2", undefined, 0);
  assert.equal(r.apiModelId, "zai-org/GLM-5.2");
  assert.equal(r.endpointIndex, 0);
});

test("resolveProvider：GLM-5.2 端点链 index 1 为智谱 glm-5.2", () => {
  const r = resolveProvider("zai-org/GLM-5.2", undefined, 1);
  assert.equal(r.apiModelId, "glm-5.2");
  assert.equal(r.endpointIndex, 1);
});

test("resolveProvider：Qwen3.6-35B 超时加长", () => {
  const r = resolveProvider("Qwen/Qwen3.6-35B-A3B");
  assert.equal(r.timeoutMs, 120_000);
});

test("resolveProvider：undefined modelId 回退到 ENV_MODEL_FLASH", () => {
  const r = resolveProvider(undefined);
  assert.equal(r.registryId, ENV_MODEL_FLASH);
});

test("resolveProvider：'custom' 但无自定义配置时回退到 flash", () => {
  const r = resolveProvider("custom");
  assert.equal(r.isCustom, false);
  assert.equal(r.registryId, ENV_MODEL_FLASH);
});

test("chatCompletionsUrl：去尾斜杠后拼接", () => {
  assert.equal(chatCompletionsUrl("https://api.com/v1/"), "https://api.com/v1/chat/completions");
  assert.equal(chatCompletionsUrl("https://api.com/v1"), "https://api.com/v1/chat/completions");
  assert.equal(chatCompletionsUrl("https://api.com/v1///"), "https://api.com/v1/chat/completions");
});

test("thinkingBudget：各力度映射", () => {
  assert.equal(thinkingBudget("low"), 2000);
  assert.equal(thinkingBudget("medium"), 8000);
  assert.equal(thinkingBudget("high"), 16000);
  assert.equal(thinkingBudget("max"), 32000);
});

test("thinkingBudget：未知力度回退 medium", () => {
  assert.equal(thinkingBudget("unknown"), 8000);
  assert.equal(thinkingBudget(undefined), 8000);
});
