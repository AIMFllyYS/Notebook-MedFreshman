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
  const m = getModelInfo("mimo-v2.5");
  assert.ok(m);
  assert.equal(m!.id, "mimo-v2.5");
  assert.equal(primaryProvider(m!), "mimo");
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
  assert.equal(groups[0].group, "小米 MiMo");
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

test("MODELS：智谱独占模型 apiModelId 不含 SiliconFlow 前缀", () => {
  const z1AirX = getModelInfo("zai-org/GLM-Z1-AirX");
  assert.ok(z1AirX, "GLM-Z1-AirX 应存在");
  assert.equal(z1AirX?.icon, "zhipu");
  assert.equal(primaryProvider(z1AirX!), "zhipu");
  assert.equal(z1AirX?.endpoints[0].apiModelId, "glm-z1-airx");
  assert.ok(!z1AirX!.endpoints[0].apiModelId.includes("/"));

  const flashX = getModelInfo("zai-org/GLM-4.7-FlashX");
  assert.ok(flashX, "GLM-4.7-FlashX 应存在");
  assert.equal(primaryProvider(flashX!), "zhipu");
  assert.equal(flashX?.endpoints[0].apiModelId, "glm-4-flashx-250414");
});

test("MODELS：Qwen3.6 与 MiniMax M2.5", () => {
  const qwen36 = getModelInfo("Qwen/Qwen3.6-27B");
  assert.ok(qwen36, "Qwen3.6-27B 应存在");
  assert.equal(qwen36?.icon, "qwen");
  assert.equal(qwen36?.timeoutMs, 120_000);

  const minimax = getModelInfo("MiniMaxAI/MiniMax-M2.5");
  assert.ok(minimax, "MiniMax-M2.5 应存在");
  assert.equal(minimax?.icon, "minimax");
  assert.equal(minimax?.endpoints[0].apiModelId, "MiniMaxAI/MiniMax-M2.5");
});

test("getModelInfo：旧 MiniMax-M3 id 映射到 M2.5", () => {
  const m = getModelInfo("MiniMaxAI/MiniMax-M3");
  assert.equal(m?.id, "MiniMaxAI/MiniMax-M2.5");
});

test("MODELS：GLM-5.2 有两级端点链", () => {
  const glm = getModelInfo("zai-org/GLM-5.2");
  assert.ok(glm);
  assert.equal(glm!.endpoints.length, 2);
  assert.equal(glm!.endpoints[0].provider, "siliconflow");
  assert.equal(glm!.endpoints[1].provider, "zhipu");
});
