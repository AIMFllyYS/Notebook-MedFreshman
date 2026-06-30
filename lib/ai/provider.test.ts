import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveProvider,
  resolveImageProvider,
  chatCompletionsUrl,
  thinkingBudget,
  buildThinkingRequestParams,
  extractReasoningDelta,
  detectImageApiStyle,
  ENV_MODEL_FLASH,
} from "./provider.ts";
import { buildCustomModelRegistryId } from "./models.ts";

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

test("resolveProvider：scoped custom id 精确选择同名模型所在 API 分组", () => {
  const groups = [
    {
      id: "openrouter",
      name: "OpenRouter",
      baseUrl: "https://openrouter.example/v1",
      apiKey: "sk-a",
      models: [{ id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" }],
    },
    {
      id: "local-proxy",
      name: "Local Proxy",
      baseUrl: "https://proxy.example/v1",
      apiKey: "sk-b",
      models: [{ id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" }],
    },
  ];

  const r = resolveProvider(buildCustomModelRegistryId("local-proxy", "claude-sonnet-4-6"), groups);

  assert.equal(r.isCustom, true);
  assert.equal(r.configured, true);
  assert.equal(r.baseUrl, "https://proxy.example/v1");
  assert.equal(r.apiKey, "sk-b");
  assert.equal(r.apiModelId, "claude-sonnet-4-6");
  assert.equal(r.registryId, "custom:local-proxy:claude-sonnet-4-6");
});

test("resolveProvider：custom 模型可配置 reasoning 字段和 thinking 请求风格", () => {
  const groups = [
    {
      id: "openai-compatible",
      name: "OpenAI Compatible",
      baseUrl: "https://openai-compatible.example/v1",
      apiKey: "sk-custom",
      models: [{
        id: "reasoning-model",
        label: "Reasoning Model",
        thinking: true,
        reasoningField: "reasoning_text",
        thinkingRequestStyle: "openai-reasoning-effort" as const,
      }],
    },
  ];

  const r = resolveProvider(buildCustomModelRegistryId("openai-compatible", "reasoning-model"), groups);

  assert.equal(r.reasoningField, "reasoning_text");
  assert.equal(r.thinkingRequestStyle, "openai-reasoning-effort");
});

test("extractReasoningDelta：兼容常见推理字段和 reasoning_details", () => {
  assert.equal(extractReasoningDelta({ reasoning_text: "A" }, "reasoning_text"), "A");
  assert.equal(extractReasoningDelta({ reasoning_content: "B" }, "reasoning_text"), "B");
  assert.equal(extractReasoningDelta({ reasoning: "C" }, "reasoning_text"), "C");
  assert.equal(
    extractReasoningDelta({
      reasoning_details: [
        { type: "summary_text", text: "D" },
        { type: "text", content: "E" },
      ],
    }, "reasoning_text"),
    "DE",
  );
});

test("buildThinkingRequestParams：按 provider 风格构造请求参数", () => {
  assert.deepEqual(buildThinkingRequestParams("none", "high"), {});
  assert.deepEqual(buildThinkingRequestParams("siliconflow", "low"), {
    enable_thinking: true,
    thinking_budget: 2000,
  });
  assert.deepEqual(buildThinkingRequestParams("openai-reasoning-effort", "max"), {
    reasoning_effort: "high",
  });
});

test("resolveImageProvider：custom 生图模型可声明 OpenAI images 格式", () => {
  const modelId = buildCustomModelRegistryId("openai-image", "my-image-model");
  const provider = resolveImageProvider(modelId, [
    {
      id: "openai-image",
      name: "OpenAI Image",
      baseUrl: "https://image.example/v1",
      apiKey: "sk-image",
      models: [{
        id: "my-image-model",
        type: "image",
        imageApiStyle: "openai",
      }],
    },
  ]);

  assert.equal(provider.imageApiStyle, "openai");
  assert.equal(detectImageApiStyle(provider.apiModelId, provider.imageApiStyle), "openai");
});

test("resolveImageProvider：用户显式选中的生图模型优先于默认生图模型", () => {
  const defaultModelId = buildCustomModelRegistryId("openai-image", "default-image-model");
  const provider = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo", [
    {
      id: "openai-image",
      name: "OpenAI Image",
      baseUrl: "https://image.example/v1",
      apiKey: "sk-image",
      models: [{
        id: "default-image-model",
        type: "image",
        imageApiStyle: "openai",
      }],
    },
  ], defaultModelId);

  assert.equal(provider.registryId, "Tongyi-MAI/Z-Image-Turbo");
  assert.equal(provider.imageApiStyle, "siliconflow");
});

test("resolveImageProvider：用户显式选中的 custom 生图模型优先于默认生图模型", () => {
  const selectedModelId = buildCustomModelRegistryId("openai-image", "selected-image-model");
  const defaultModelId = buildCustomModelRegistryId("openai-image", "default-image-model");
  const provider = resolveImageProvider(selectedModelId, [
    {
      id: "openai-image",
      name: "OpenAI Image",
      baseUrl: "https://image.example/v1",
      apiKey: "sk-image",
      models: [
        { id: "selected-image-model", type: "image", imageApiStyle: "openai" },
        { id: "default-image-model", type: "image", imageApiStyle: "siliconflow" },
      ],
    },
  ], defaultModelId);

  assert.equal(provider.registryId, selectedModelId);
  assert.equal(provider.apiModelId, "selected-image-model");
  assert.equal(provider.imageApiStyle, "openai");
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
