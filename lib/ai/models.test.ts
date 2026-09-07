import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MODELS,
  CUSTOM_MODEL_ID,
  DEFAULT_MODEL_ID,
  getModelInfo,
  getModelGroups,
  getAllModels,
  getAllModelsFlat,
  buildCustomModelRegistryId,
  findCustomModelGroup,
  normalizeCustomModelRegistryId,
  primaryProvider,
  modelSupportsThinkingEffort,
  clampThinkingEffort,
  wireThinkingEffort,
} from "./models.ts";

test("MODELS 非空且每个模型有必需字段", () => {
  assert.ok(MODELS.length > 0);
  for (const m of MODELS) {
    assert.ok(m.id, "model id 非空");
    assert.ok(m.label, `model label 非空: ${m.id}`);
    assert.ok(m.group, `model group 非空: ${m.id}`);
    assert.ok(typeof m.thinking === "boolean", `thinking 是布尔: ${m.id}`);
    assert.ok(typeof m.tools === "boolean", `tools 是布尔: ${m.id}`);
    assert.ok(m.hint, `hint 非空: ${m.id}`);
    assert.ok(m.endpoints.length > 0, `endpoints 非空: ${m.id}`);
    for (const ep of m.endpoints) {
      assert.ok(ep.apiModelId, `apiModelId 非空: ${m.id}`);
    }
  }
});

test("CUSTOM_MODEL_ID 是 'custom'", () => {
  assert.equal(CUSTOM_MODEL_ID, "custom");
});

test("DEFAULT_MODEL_ID 存在于 MODELS", () => {
  const found = getModelInfo(DEFAULT_MODEL_ID);
  assert.ok(found, `DEFAULT_MODEL_ID ${DEFAULT_MODEL_ID} 应在 MODELS 中`);
});

test("getModelInfo：存在的 id 返回 ModelInfo", () => {
  const m = getModelInfo("z-ai/glm-5.3-flash");
  assert.ok(m);
  assert.equal(m!.id, "z-ai/glm-5.3-flash");
  assert.equal(primaryProvider(m!), "relay");
});

test("getModelInfo：不存在的 id 返回 undefined", () => {
  assert.equal(getModelInfo("nonexistent-model"), undefined);
});

test("getModelGroups：按 group 聚合且保持声明顺序", () => {
  const groups = getModelGroups();
  assert.ok(groups.length > 0);
  for (const g of groups) {
    assert.ok(g.models.length > 0, `group ${g.group} 至少一个模型`);
  }
  assert.equal(groups[0].group, "主力模型");
});

test("getModelGroups：所有模型都被分组覆盖", () => {
  const groups = getModelGroups();
  const totalModels = groups.reduce((sum, g) => sum + g.models.length, 0);
  assert.equal(totalModels, MODELS.length);
});

test("MODELS：model id 唯一", () => {
  const ids = new Set<string>();
  for (const m of MODELS) {
    assert.ok(!ids.has(m.id), `model id 重复: ${m.id}`);
    ids.add(m.id);
  }
});

test("getAllModels：不同自定义 API 分组允许同名模型但 registry id 唯一", () => {
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

  const custom = getAllModels(groups).filter((m) => m.id.includes("claude-sonnet-4-6"));

  assert.deepEqual(
    custom.map((m) => m.id),
    [
      "custom:openrouter:claude-sonnet-4-6",
      "custom:local-proxy:claude-sonnet-4-6",
    ],
  );
  assert.equal(new Set(custom.map((m) => m.id)).size, custom.length);
});

test("findCustomModelGroup：scoped id 精确命中对应分组，旧 id 保持首个匹配兼容", () => {
  const groups = [
    {
      id: "openrouter",
      name: "OpenRouter",
      baseUrl: "https://openrouter.example/v1",
      apiKey: "sk-a",
      models: [{ id: "vendor/model:alpha", label: "Alpha" }],
    },
    {
      id: "local-proxy",
      name: "Local Proxy",
      baseUrl: "https://proxy.example/v1",
      apiKey: "sk-b",
      models: [{ id: "vendor/model:alpha", label: "Alpha" }],
    },
  ];

  const scoped = buildCustomModelRegistryId("local-proxy", "vendor/model:alpha");
  assert.equal(scoped, "custom:local-proxy:vendor%2Fmodel%3Aalpha");
  assert.equal(findCustomModelGroup(groups, scoped)?.group.id, "local-proxy");
  assert.equal(findCustomModelGroup(groups, "custom:vendor/model:alpha")?.group.id, "openrouter");
});

test("getAllModelsFlat：旧版扁平自定义模型接口保持 custom:modelId 格式", () => {
  const custom = getAllModelsFlat([{ id: "legacy-model", label: "Legacy Model" }]).find(
    (m) => m.label === "Legacy Model",
  );

  assert.equal(custom?.id, "custom:legacy-model");
});

test("normalizeCustomModelRegistryId：旧 custom id 仅在唯一匹配时自动升级为 scoped id", () => {
  assert.equal(
    normalizeCustomModelRegistryId("custom:solo-model", [
      {
        id: "solo",
        name: "Solo",
        baseUrl: "https://solo.example/v1",
        apiKey: "sk-solo",
        models: [{ id: "solo-model" }],
      },
    ]),
    "custom:solo:solo-model",
  );

  const duplicateGroups = [
    {
      id: "a",
      name: "A",
      baseUrl: "https://a.example/v1",
      apiKey: "sk-a",
      models: [{ id: "same-model" }],
    },
    {
      id: "b",
      name: "B",
      baseUrl: "https://b.example/v1",
      apiKey: "sk-b",
      models: [{ id: "same-model" }],
    },
  ];
  assert.equal(normalizeCustomModelRegistryId("custom:same-model", duplicateGroups), "custom:same-model");
  assert.equal(normalizeCustomModelRegistryId("mimo-v2.5", duplicateGroups), "mimo-v2.5");
});

test("MODELS：主力四模型走 relay，硅基流动仅保留生图", () => {
  const glm = getModelInfo("z-ai/glm-5.3-flash");
  assert.ok(glm);
  assert.equal(primaryProvider(glm!), "relay");
  assert.equal(glm!.thinkingRequired, true);
  assert.deepEqual(glm!.thinkingLevels, ["low", "high", "max"]);
  assert.equal(glm!.endpoints[0].apiModelId, "z-ai/glm-5.3-flash");
  assert.equal(glm!.endpoints[1]?.provider, "mimo");

  const qwen = getModelInfo("Qwen/Qwen3.8-27B");
  assert.ok(qwen);
  assert.equal(qwen?.icon, "qwen");
  assert.equal(qwen?.timeoutMs, 120_000);
  assert.equal(qwen?.vision, true);

  const gemini = getModelInfo("google/gemini-3.7-flash");
  assert.ok(gemini);
  assert.equal(gemini?.icon, "gemini");
  assert.equal(gemini?.thinkingRequired, true);
  assert.deepEqual(gemini!.thinkingLevels, ["low", "medium", "high"]);

  const ds = getModelInfo("deepseek/deepseek-v4-flash");
  assert.ok(ds);
  assert.equal(primaryProvider(ds!), "relay");

  const image = getModelInfo("Tongyi-MAI/Z-Image-Turbo");
  assert.ok(image);
  assert.equal(image?.type, "image");
  assert.equal(primaryProvider(image!), "siliconflow");

  assert.equal(MODELS.filter((m) => m.type !== "image" && primaryProvider(m) === "siliconflow").length, 0);
  assert.equal(MODELS.filter((m) => primaryProvider(m) === "zhipu").length, 0);
});

test("getModelInfo：旧硅基流动/智谱 id 映射到中转站等价模型", () => {
  assert.equal(getModelInfo("deepseek-ai/DeepSeek-V4-Flash")?.id, "deepseek/deepseek-v4-flash");
  assert.equal(getModelInfo("Qwen/Qwen3.6-27B")?.id, "Qwen/Qwen3.8-27B");
  assert.equal(getModelInfo("zai-org/GLM-5.2")?.id, "z-ai/glm-5.3-flash");
  assert.equal(getModelInfo("MiniMaxAI/MiniMax-M3")?.id, "Qwen/Qwen3.8-27B");
  assert.equal(getModelInfo("mimo-v2-flash")?.id, "mimo-v2.5");
});

test("MODELS：MiMo 走 Token Plan provider", () => {
  const mimo = getModelInfo("mimo-v2.5");
  assert.ok(mimo);
  assert.equal(primaryProvider(mimo!), "mimo");
  assert.deepEqual(mimo!.thinkingLevels, ["low", "medium", "high", "max"]);
});

test("思考强度：生图模型不支持档位，GLM 把 medium 钳到 high 并原样下发 max", () => {
  const image = getModelInfo("Tongyi-MAI/Z-Image-Turbo");
  assert.equal(modelSupportsThinkingEffort(image), false);

  const glm = getModelInfo("z-ai/glm-5.3-flash");
  assert.equal(modelSupportsThinkingEffort(glm), true);
  assert.equal(clampThinkingEffort(glm, "medium"), "high");
  assert.equal(wireThinkingEffort(glm, "max"), "max");
  assert.equal(wireThinkingEffort(glm, "medium"), "high");

  const qwen = getModelInfo("Qwen/Qwen3.8-27B");
  assert.equal(wireThinkingEffort(qwen, "high"), "xhigh");
  assert.equal(clampThinkingEffort(qwen, "max"), "high");
});
