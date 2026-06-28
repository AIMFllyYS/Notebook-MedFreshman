import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveProvider, resolveZhipuProvider, chatCompletionsUrl, thinkingBudget, ENV_MODEL_FLASH } from "./provider.ts";

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
  assert.equal(r.model, "my-model");
});

test("resolveProvider：custom 缺少 apiKey 时不走自定义", () => {
  const r = resolveProvider("custom", {
    baseUrl: "https://my.api.com/v1",
    model: "my-model",
  });
  assert.equal(r.isCustom, false);
});

test("resolveProvider：custom 缺少 baseUrl 时不走自定义", () => {
  const r = resolveProvider("custom", {
    apiKey: "sk-test",
    model: "my-model",
  });
  assert.equal(r.isCustom, false);
});

test("resolveProvider：mimo 模型走 MIMO 端点", () => {
  const r = resolveProvider("mimo-v2.5");
  assert.equal(r.isCustom, false);
  assert.equal(r.model, "mimo-v2.5");
  // baseUrl 应是 MIMO_BASE_URL（env 或默认）
  assert.ok(r.baseUrl.includes("xiaomimimo") || r.baseUrl === "");
});

test("resolveProvider：智谱 provider 模型走智谱端点", () => {
  const r = resolveProvider("zai-org/GLM-Z1-AirX");
  assert.equal(r.isCustom, false);
  assert.equal(r.model, "zai-org/GLM-Z1-AirX");
  assert.ok(r.baseUrl.includes("bigmodel.cn") || r.baseUrl === "");
});

test("resolveZhipuProvider：返回智谱官方端点", () => {
  const r = resolveZhipuProvider("glm-5.2");
  assert.equal(r.model, "glm-5.2");
  assert.ok(r.baseUrl.includes("bigmodel.cn") || r.baseUrl === "");
});

test("resolveProvider：undefined modelId 回退到 ENV_MODEL_FLASH", () => {
  const r = resolveProvider(undefined);
  assert.equal(r.model, ENV_MODEL_FLASH);
});

test("resolveProvider：'custom' 但无自定义配置时回退到 flash", () => {
  const r = resolveProvider("custom");
  assert.equal(r.isCustom, false);
  assert.equal(r.model, ENV_MODEL_FLASH);
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
