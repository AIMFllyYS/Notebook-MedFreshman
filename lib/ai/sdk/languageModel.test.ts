import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeAnthropicBaseUrl,
  buildThinkingSettings,
  resolveLanguageModel,
  UPSTREAM_PROVIDER_NAME,
} from "./languageModel.ts";
import type { ResolvedProvider } from "./../provider.ts";
import { buildCustomModelRegistryId, type CustomApiGroup } from "./../models.ts";

function fakeProvider(over: Partial<ResolvedProvider>): ResolvedProvider {
  return {
    registryId: "x",
    apiModelId: "x",
    baseUrl: "https://api.example.com/v1",
    apiKey: "k",
    reasoningField: "reasoning_content",
    thinkingRequestStyle: "siliconflow",
    apiProtocol: "openai",
    isCustom: false,
    configured: true,
    endpointIndex: 0,
    timeoutMs: 45_000,
    ...over,
  };
}

test("normalizeAnthropicBaseUrl：有无 /v1 都归一到以 /v1 结尾", () => {
  assert.equal(normalizeAnthropicBaseUrl("https://api.anthropic.com"), "https://api.anthropic.com/v1");
  assert.equal(normalizeAnthropicBaseUrl("https://api.anthropic.com/v1/"), "https://api.anthropic.com/v1");
  assert.equal(normalizeAnthropicBaseUrl("https://proxy.io/anthropic"), "https://proxy.io/anthropic/v1");
});

test("buildThinkingSettings：siliconflow → enable_thinking + thinking_budget", () => {
  const s = buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "siliconflow" }), "high");
  assert.deepEqual(s.providerOptions, { [UPSTREAM_PROVIDER_NAME]: { enable_thinking: true, thinking_budget: 16000 } });
  assert.equal(s.maxOutputTokens, undefined);
});

test("buildThinkingSettings：openai-reasoning-effort → reasoningEffort（max 归到 high）", () => {
  const s = buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "openai-reasoning-effort" }), "max");
  assert.deepEqual(s.providerOptions, { [UPSTREAM_PROVIDER_NAME]: { reasoningEffort: "high" } });
  const low = buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "openai-reasoning-effort" }), "low");
  assert.deepEqual(low.providerOptions, { [UPSTREAM_PROVIDER_NAME]: { reasoningEffort: "low" } });
});

test("buildThinkingSettings：openrouter-reasoning → reasoning.effort", () => {
  const s = buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "openrouter-reasoning" }), "medium");
  assert.deepEqual(s.providerOptions, { [UPSTREAM_PROVIDER_NAME]: { reasoning: { effort: "medium" } } });
});

test("buildThinkingSettings：anthropic 原生协议 → providerOptions.anthropic.thinking + 抬高 maxOutputTokens", () => {
  const s = buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "anthropic-thinking", apiProtocol: "anthropic" }), "max");
  assert.deepEqual(s.providerOptions, { anthropic: { thinking: { type: "enabled", budgetTokens: 32000 } } });
  assert.equal(s.maxOutputTokens, 36096);
});

test("buildThinkingSettings：anthropic 风格但走 OpenAI 兼容中转 → 原生字段透传", () => {
  const s = buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "anthropic-thinking", apiProtocol: "openai" }), "low");
  assert.deepEqual(s.providerOptions, { [UPSTREAM_PROVIDER_NAME]: { thinking: { type: "enabled", budget_tokens: 2000 } } });
  assert.equal(s.maxOutputTokens, 16000);
});

test("buildThinkingSettings：none → 空对象", () => {
  assert.deepEqual(buildThinkingSettings(fakeProvider({ thinkingRequestStyle: "none" }), "high"), {});
});

test("resolveLanguageModel：内置模型返回 openai-compatible 模型并暴露能力", () => {
  const r = resolveLanguageModel("mimo-v2.5");
  assert.equal(r.provider.registryId, "mimo-v2.5");
  assert.equal(r.supportsThinking, true);
  assert.equal(r.supportsTools, true);
  assert.equal(r.model.modelId, "mimo-v2.5");
  assert.ok(r.thinkingSettings("medium").providerOptions?.[UPSTREAM_PROVIDER_NAME]);
});

test("resolveLanguageModel：自定义 anthropic 分组 → anthropic provider", () => {
  const groups: CustomApiGroup[] = [
    {
      id: "proxy",
      name: "Proxy",
      baseUrl: "https://proxy.io/anthropic",
      apiKey: "sk",
      models: [{ id: "claude-sonnet-4-6", apiProtocol: "anthropic", thinking: true }],
    },
  ];
  const r = resolveLanguageModel(buildCustomModelRegistryId("proxy", "claude-sonnet-4-6"), groups);
  assert.equal(r.provider.apiProtocol, "anthropic");
  assert.match(r.model.provider, /anthropic/);
  assert.equal(r.model.modelId, "claude-sonnet-4-6");
  assert.ok(r.thinkingSettings("medium").providerOptions?.anthropic);
});

test("resolveLanguageModel：不支持思考的模型 thinkingSettings 返回空", () => {
  const r = resolveLanguageModel("Pro/moonshotai/Kimi-K2.6");
  assert.equal(r.supportsThinking, false);
  assert.deepEqual(r.thinkingSettings("high"), {});
});
