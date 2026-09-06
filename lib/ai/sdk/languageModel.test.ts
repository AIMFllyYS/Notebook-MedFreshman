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
import type { LanguageModelV4StreamPart } from "@ai-sdk/provider";

function fixtureModel(reasoningField?: string) {
  const groups: CustomApiGroup[] = [{
    id: "fixture", name: "Local fixture", baseUrl: "https://fixture.invalid/v1", apiKey: "fixture-only",
    models: [{ id: "fixture-model", apiProtocol: "openai", thinking: true, reasoningField }],
  }];
  return resolveLanguageModel(buildCustomModelRegistryId("fixture", "fixture-model"), groups);
}

const fixturePrompt = [{ role: "user" as const, content: [{ type: "text" as const, text: "你好" }] }];

async function readParts(stream: ReadableStream<LanguageModelV4StreamPart>) {
  const reader = stream.getReader();
  const parts: LanguageModelV4StreamPart[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return parts;
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}

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

test("resolveLanguageModel：真实 SDK 对默认/标准配置的结构化思考与别名流均可消费", async (t) => {
  for (const field of [undefined, "reasoning", "reasoning_content"]) {
    const resolved = fixtureModel(field);
    const reasoningChunks = [
      { reasoning: { type: "thinking", thinking: "甲" } },
      { reasoning_content: [{ type: "text", text: "乙" }] },
      { reasoning_content: { content: [{ text: "丙" }] }, reasoning: { text: "备用，不重复输出" } },
      { thinking: "丁" },
      { reasoning_details: [{ type: "reasoning.text", text: "戊" }] },
      { reasoning_text: "己" },
    ];
    const events = [
      ...reasoningChunks.map((delta) => ({ choices: [{ delta }] })),
      { choices: [{ delta: { content: "答案" } }] },
      { choices: [{ delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } },
    ];
    const fetchMock = t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
      assert.equal(String(input), "https://fixture.invalid/v1/chat/completions");
      assert.equal(JSON.parse(String(init?.body)).model, "fixture-model");
      return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") + "data: [DONE]\n\n", {
        headers: { "content-type": "text/event-stream" },
      });
    });
    try {
      const result = await resolved.model.doStream({ prompt: fixturePrompt });
      const parts = await readParts(result.stream);
      assert.deepEqual(parts.filter((part) => part.type === "error"), []);
      assert.equal(parts.filter((part) => part.type === "reasoning-delta").map((part) => part.delta).join(""), "甲乙丙丁戊己");
      assert.equal(parts.filter((part) => part.type === "text-delta").map((part) => part.delta).join(""), "答案");
      const finish = parts.find((part) => part.type === "finish");
      assert.equal(finish?.finishReason.unified, "stop");
      assert.equal(finish?.usage.inputTokens.total, 10);
      assert.equal(finish?.usage.outputTokens.total, 5);
    } finally {
      fetchMock.mock.restore();
    }
  }
});

test("resolveLanguageModel：真实 SDK 非流式标准结构化字段同时规范化且保留文本", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    choices: [{ message: { role: "assistant", content: "答案", reasoning_content: [{ text: "主思考" }], reasoning: { thinking: "别名" } }, finish_reason: "stop" }],
    usage: { prompt_tokens: 4, completion_tokens: 8 },
  }), { headers: { "content-type": "application/json" } }));
  const result = await fixtureModel("reasoning_content").model.doGenerate({ prompt: fixturePrompt });
  assert.equal(result.content.filter((part) => part.type === "reasoning").map((part) => part.text).join(""), "主思考");
  assert.equal(result.content.filter((part) => part.type === "text").map((part) => part.text).join(""), "答案");
  assert.equal(result.finishReason.unified, "stop");
});

test("resolveLanguageModel：真实 SDK 仍拒绝未知思考结构及畸形工具帧", async (t) => {
  for (const delta of [
    { reasoning: { unexpected: "invalid" }, thinking: "must not mask" },
    { reasoning_content: [{ text: "known" }, { unexpected: "invalid" }], thinking: "must not mask" },
    { tool_calls: [{ index: 0, id: "call_a" }] },
  ]) {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(
      `data: ${JSON.stringify({ choices: [{ delta }] })}\n\ndata: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`,
      { headers: { "content-type": "text/event-stream" } },
    ));
    try {
      const result = await fixtureModel().model.doStream({ prompt: fixturePrompt });
      const parts = await readParts(result.stream);
      const error = parts.find((part) => part.type === "error");
      assert.ok(error?.error instanceof Error);
      assert.equal(error.error.name, "AI_TypeValidationError");
    } finally {
      fetchMock.mock.restore();
    }
  }
});

test("resolveLanguageModel：真实 SDK 保留上游显式错误与缺失完成信号的失败", async (t) => {
  for (const events of [
    [{ error: { message: "fixture upstream error", type: "server_error", code: "fixture_error" } }],
    [{ choices: [{ delta: { thinking: "尚未完成" } }] }],
  ]) {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(
      events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") + "data: [DONE]\n\n",
      { headers: { "content-type": "text/event-stream" } },
    ));
    try {
      const result = await fixtureModel().model.doStream({ prompt: fixturePrompt });
      const parts = await readParts(result.stream);
      assert.ok(parts.some((part) => part.type === "error"));
      assert.equal(parts.find((part) => part.type === "finish")?.finishReason.unified, "error");
    } finally {
      fetchMock.mock.restore();
    }
  }
});
