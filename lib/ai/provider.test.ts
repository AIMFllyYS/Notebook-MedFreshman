import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveProvider,
  resolveNextProvider,
  resolveImageProvider,
  chatCompletionsUrl,
  thinkingBudget,
  extractReasoningDelta,
  detectImageApiStyle,
  autoConfigFromProtocol,
  normalizeOpenAIBaseUrl,
  ENV_MODEL_FLASH,
} from "./provider.ts";
import { buildCustomModelRegistryId } from "./models.ts";
import { UnsafeCustomBaseUrlError } from "./customBaseUrl.ts";
import { EMPTY_CAPABILITY_ENDPOINTS } from "./capabilityEndpoints.ts";

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

test("resolveProvider：回环或私网自定义 baseUrl 被拒绝", () => {
  assert.throws(
    () => resolveProvider("custom", { baseUrl: "http://127.0.0.1/v1", apiKey: "sk-test", model: "my-model" }),
    (err: unknown) => err instanceof UnsafeCustomBaseUrlError && err.reason === "private",
  );
  assert.throws(
    () => resolveProvider("custom", {
      baseUrl: "http://192.168.0.5/v1",
      apiKey: "sk-test",
      model: "my-model",
    }),
    (err: unknown) => err instanceof UnsafeCustomBaseUrlError && err.reason === "private",
  );
});

test("resolveProvider：非 http(s) 自定义 baseUrl 被拒绝", () => {
  assert.throws(
    () => resolveProvider("custom", { baseUrl: "file:///tmp/openai", apiKey: "sk-test", model: "my-model" }),
    (err: unknown) => err instanceof UnsafeCustomBaseUrlError && err.reason === "protocol",
  );
});

test("resolveImageProvider：私网自定义 baseUrl 被拒绝", () => {
  const modelId = buildCustomModelRegistryId("lan-image", "local-image");
  assert.throws(
    () => resolveImageProvider(modelId, [{
      id: "lan-image",
      name: "LAN Image",
      baseUrl: "http://10.0.0.2/v1",
      apiKey: "sk-image",
      models: [{ id: "local-image", type: "image" }],
    }]),
    (err: unknown) => err instanceof UnsafeCustomBaseUrlError && err.reason === "private",
  );
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

test("extractReasoningDelta：兼容部分中转网关把 reasoning 发成结构化对象/数组（非纯字符串）", () => {
  // Anthropic thinking block 透传：{ type: "thinking", thinking: "..." }
  assert.equal(
    extractReasoningDelta({ reasoning: { type: "thinking", thinking: "F" } }, "reasoning_content"),
    "F",
  );
  // 部分网关把 reasoning 包成 { content: "..." } 或 { content: [...] } 而不是纯字符串
  assert.equal(
    extractReasoningDelta({ reasoning: { content: "G" } }, "reasoning_content"),
    "G",
  );
  assert.equal(
    extractReasoningDelta({ reasoning: [{ text: "H" }, { thinking: "I" }] }, "reasoning_content"),
    "HI",
  );
  // 未在预设字段名单里的 thinking 字段兜底
  assert.equal(extractReasoningDelta({ thinking: "J" }, "reasoning_content"), "J");
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

test("resolveImageProvider：空能力端点与未传时行为一致", () => {
  const a = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo");
  const b = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo", [], null, EMPTY_CAPABILITY_ENDPOINTS);
  assert.equal(a.baseUrl, b.baseUrl);
  assert.equal(a.apiKey, b.apiKey);
  assert.equal(a.isCustom, b.isCustom);
  assert.equal(a.apiModelId, b.apiModelId);
  assert.equal(a.imageApiStyle, b.imageApiStyle);
});

test("resolveImageProvider：用户生图 baseUrl/key 覆盖平台凭证", () => {
  const provider = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo", [], null, {
    ...EMPTY_CAPABILITY_ENDPOINTS,
    imageBaseUrl: "https://mine.example/v1",
    imageApiKey: "user-image-key",
    imageModelId: "my-image",
    imageApiStyle: "openai",
  });
  assert.equal(provider.isCustom, true);
  assert.equal(provider.apiKey, "user-image-key");
  assert.equal(provider.baseUrl, "https://mine.example/v1");
  assert.equal(provider.apiModelId, "my-image");
  assert.equal(provider.imageApiStyle, "openai");
});

test("resolveImageProvider：只填 baseUrl 不填 key 时忽略用户 URL", () => {
  const platform = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo");
  const withUrlOnly = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo", [], null, {
    ...EMPTY_CAPABILITY_ENDPOINTS,
    imageBaseUrl: "http://127.0.0.1/v1",
  });
  assert.equal(withUrlOnly.baseUrl, platform.baseUrl);
  assert.equal(withUrlOnly.isCustom, false);
});

test("resolveImageProvider：用户生图私网 baseUrl 被拒绝", () => {
  assert.throws(
    () => resolveImageProvider("Tongyi-MAI/Z-Image-Turbo", [], null, {
      ...EMPTY_CAPABILITY_ENDPOINTS,
      imageBaseUrl: "http://127.0.0.1/v1",
      imageApiKey: "user-image-key",
    }),
    (err: unknown) => err instanceof UnsafeCustomBaseUrlError && err.reason === "private",
  );
});

test("resolveImageProvider：RELAY 与 AI_BASE 不同时仍走硅基流动", () => {
  const prevSfBase = process.env.SILICONFLOW_BASE_URL;
  const prevSfKey = process.env.SILICONFLOW_API_KEY;
  process.env.SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
  process.env.SILICONFLOW_API_KEY = "sf-image-key";
  try {
    const image = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo");
    const chat = resolveProvider("deepseek/deepseek-v4.1-flash");
    assert.ok(image.baseUrl.includes("api.siliconflow.cn"), image.baseUrl);
    assert.equal(image.apiKey, "sf-image-key");
    assert.equal(image.apiModelId, "Tongyi-MAI/Z-Image-Turbo");
    assert.equal(image.imageApiStyle, "siliconflow");
    assert.ok(!image.baseUrl.includes("relay.protocom.org"));
    assert.notEqual(image.baseUrl, chat.baseUrl);
  } finally {
    if (prevSfBase === undefined) delete process.env.SILICONFLOW_BASE_URL;
    else process.env.SILICONFLOW_BASE_URL = prevSfBase;
    if (prevSfKey === undefined) delete process.env.SILICONFLOW_API_KEY;
    else process.env.SILICONFLOW_API_KEY = prevSfKey;
  }
});

test("resolveImageProvider：只配 AI_BASE_URL（指向中转站）时不拿它当生图端点", () => {
  const prevSfBase = process.env.SILICONFLOW_BASE_URL;
  const prevSfKey = process.env.SILICONFLOW_API_KEY;
  delete process.env.SILICONFLOW_BASE_URL;
  delete process.env.SILICONFLOW_API_KEY;
  try {
    const image = resolveImageProvider("Tongyi-MAI/Z-Image-Turbo");
    // AI_BASE_URL 在测试环境里指向中转站；生图必须回到硅基流动自己的域名。
    assert.ok(image.baseUrl.includes("api.siliconflow.cn"), image.baseUrl);
    assert.ok(!image.baseUrl.includes("relay"), image.baseUrl);
  } finally {
    if (prevSfBase === undefined) delete process.env.SILICONFLOW_BASE_URL;
    else process.env.SILICONFLOW_BASE_URL = prevSfBase;
    if (prevSfKey === undefined) delete process.env.SILICONFLOW_API_KEY;
    else process.env.SILICONFLOW_API_KEY = prevSfKey;
  }
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

test("resolveProvider：主力 GLM 走 relay，备用端点为 mimo", () => {
  const r = resolveProvider("z-ai/glm-5.3-flash", undefined, 0);
  assert.equal(r.registryId, "z-ai/glm-5.3-flash");
  assert.equal(r.apiModelId, "z-ai/glm-5.3-flash");
  assert.equal(r.thinkingRequestStyle, "openai-reasoning-effort");
  assert.ok(r.baseUrl.includes("relay.protocom.org") || r.baseUrl === "" || r.baseUrl.includes("invalid"));

  const backup = resolveProvider("z-ai/glm-5.3-flash", undefined, 1);
  assert.equal(backup.apiModelId, "mimo-v2.5");
  assert.equal(backup.endpointIndex, 1);
});

test("resolveProvider：旧 GLM-5.2 id 归一到 glm-5.3-flash", () => {
  const r = resolveProvider("zai-org/GLM-5.2", undefined, 0);
  assert.equal(r.registryId, "z-ai/glm-5.3-flash");
  assert.equal(r.apiModelId, "z-ai/glm-5.3-flash");
});

test("resolveProvider：Qwen3.8-Flash 超时加长", () => {
  const r = resolveProvider("Qwen/Qwen3.8-Flash");
  assert.equal(r.registryId, "Qwen/Qwen3.8-Flash");
  assert.equal(r.timeoutMs, 120_000);
  assert.equal(r.thinkingRequestStyle, "siliconflow");
  assert.equal(resolveProvider("Qwen/Qwen3.8-27B").registryId, "Qwen/Qwen3.8-Flash");
});

test("resolveProvider：自由中转未配置模型 ID 时 configured=false", () => {
  const r = resolveProvider("custom-openai");
  assert.equal(r.registryId, "custom-openai");
  if (!process.env.RELAY_MODEL_ID) {
    assert.equal(r.configured, false);
    assert.equal(r.apiModelId, "custom-openai");
  }
});

test("normalizeOpenAIBaseUrl：补 /v1", () => {
  assert.equal(normalizeOpenAIBaseUrl("https://relay.protocom.org/"), "https://relay.protocom.org/v1");
  assert.equal(normalizeOpenAIBaseUrl("https://relay.protocom.org/v1"), "https://relay.protocom.org/v1");
});

test("resolveProvider：自定义分组 baseUrl 不带 /v1 时与连通性测试同样补全", () => {
  const modelId = buildCustomModelRegistryId("g", "m");
  const r = resolveProvider(modelId, [{
    id: "g",
    name: "G",
    baseUrl: "https://api.example.com",
    apiKey: "sk-test",
    models: [{ id: "m" }],
    timeoutMs: 90_000,
  }]);
  assert.equal(r.isCustom, true);
  assert.equal(r.baseUrl, "https://api.example.com/v1");
  assert.equal(r.timeoutMs, 90_000);
  assert.equal(r.endpointIndex, 0);
});

test("resolveProvider：模型级 timeoutMs 优先于分组", () => {
  const modelId = buildCustomModelRegistryId("g", "slow");
  const r = resolveProvider(modelId, [{
    id: "g",
    name: "G",
    baseUrl: "https://api.example.com/v1",
    apiKey: "sk-test",
    timeoutMs: 60_000,
    models: [{ id: "slow", timeoutMs: 120_000 }],
  }]);
  assert.equal(r.timeoutMs, 120_000);
});

test("resolveProvider：自定义分组 endpointIndex 恒为 0 且无 failover", () => {
  const modelId = buildCustomModelRegistryId("g", "m");
  const groups = [{
    id: "g", name: "G", baseUrl: "https://api.example.com/v1", apiKey: "sk",
    models: [{ id: "m" }],
  }];
  const r = resolveProvider(modelId, groups);
  assert.equal(r.endpointIndex, 0);
  assert.equal(resolveNextProvider(r.registryId, r.endpointIndex, groups), null);
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

// ── apiProtocol 三选一自动装配 ─────────────────────────────────────
test("autoConfigFromProtocol：openai → openai-reasoning-effort + reasoning", () => {
  assert.deepEqual(autoConfigFromProtocol("openai"), {
    thinkingRequestStyle: "openai-reasoning-effort",
    reasoningField: "reasoning",
  });
});

test("autoConfigFromProtocol：anthropic → anthropic-thinking + thinking", () => {
  assert.deepEqual(autoConfigFromProtocol("anthropic"), {
    thinkingRequestStyle: "anthropic-thinking",
    reasoningField: "thinking",
  });
});

test("autoConfigFromProtocol：siliconflow → siliconflow + reasoning_content", () => {
  assert.deepEqual(autoConfigFromProtocol("siliconflow"), {
    thinkingRequestStyle: "siliconflow",
    reasoningField: "reasoning_content",
  });
});

test("autoConfigFromProtocol：undefined → 视为 openai", () => {
  assert.deepEqual(autoConfigFromProtocol(undefined), {
    thinkingRequestStyle: "openai-reasoning-effort",
    reasoningField: "reasoning",
  });
});

test("resolveProvider：apiProtocol=anthropic 时自动装配 thinking 字段", () => {
  const groups = [
    {
      id: "claude-proxy",
      name: "Claude Proxy",
      baseUrl: "https://claude.example/v1",
      apiKey: "sk-cl",
      models: [
        {
          id: "claude-sonnet-4-6",
          apiProtocol: "anthropic" as const,
          thinking: true,
        },
      ],
    },
  ];
  const r = resolveProvider(
    buildCustomModelRegistryId("claude-proxy", "claude-sonnet-4-6"),
    groups,
  );
  assert.equal(r.apiProtocol, "anthropic");
  assert.equal(r.thinkingRequestStyle, "anthropic-thinking");
  assert.equal(r.reasoningField, "thinking");
});

test("resolveProvider：apiProtocol=openai 时自动装配 openai-reasoning-effort", () => {
  const groups = [
    {
      id: "one-api",
      name: "One-API",
      baseUrl: "https://oneapi.example/v1",
      apiKey: "sk-x",
      models: [
        {
          id: "deepseek-r1",
          apiProtocol: "openai" as const,
          thinking: true,
        },
      ],
    },
  ];
  const r = resolveProvider(
    buildCustomModelRegistryId("one-api", "deepseek-r1"),
    groups,
  );
  assert.equal(r.apiProtocol, "openai");
  assert.equal(r.thinkingRequestStyle, "openai-reasoning-effort");
  assert.equal(r.reasoningField, "reasoning");
});

test("resolveProvider：老配置只有 thinkingRequestStyle=anthropic-thinking 时推断 apiProtocol=anthropic", () => {
  const groups = [
    {
      id: "legacy",
      name: "Legacy",
      baseUrl: "https://legacy.example/v1",
      apiKey: "sk-l",
      models: [
        {
          id: "claude-old",
          thinking: true,
          thinkingRequestStyle: "anthropic-thinking" as const,
        },
      ],
    },
  ];
  const r = resolveProvider(
    buildCustomModelRegistryId("legacy", "claude-old"),
    groups,
  );
  assert.equal(r.apiProtocol, "anthropic");
});

test("resolveProvider：老配置 thinkingRequestStyle=siliconflow 时推断 apiProtocol=siliconflow", () => {
  const groups = [
    {
      id: "legacy-sf",
      name: "Legacy SF",
      baseUrl: "https://sf.example/v1",
      apiKey: "sk-s",
      models: [
        {
          id: "qwen-old",
          thinking: true,
          thinkingRequestStyle: "siliconflow" as const,
        },
      ],
    },
  ];
  const r = resolveProvider(
    buildCustomModelRegistryId("legacy-sf", "qwen-old"),
    groups,
  );
  assert.equal(r.apiProtocol, "siliconflow");
});

test("resolveProvider：内置模型 apiProtocol 恒为 openai", () => {
  const r = resolveProvider("mimo-v2.5");
  assert.equal(r.apiProtocol, "openai");
});

test("resolveProvider：用户显式 reasoningField override 优先于协议默认", () => {
  const groups = [
    {
      id: "override-test",
      name: "Override",
      baseUrl: "https://o.example/v1",
      apiKey: "sk-o",
      models: [
        {
          id: "custom-model",
          apiProtocol: "openai" as const,
          thinking: true,
          reasoningField: "reasoning_text",
        },
      ],
    },
  ];
  const r = resolveProvider(
    buildCustomModelRegistryId("override-test", "custom-model"),
    groups,
  );
  assert.equal(r.reasoningField, "reasoning_text");
});
