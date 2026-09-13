import assert from "node:assert/strict";
import { test } from "node:test";
import { buildChatRequestBody, type ChatRequestBodySettings } from "./buildChatRequestBody.ts";
import type { ResolvedRequestSettings } from "./resolveRequestSettings.ts";
import type { ChatContext } from "@/lib/types/chat";

const ctx: ChatContext = {
  subjectId: "math",
  categoryId: "textbook",
  itemId: "ch1",
  currentTopic: "极限",
};

const settings = (partial: Partial<ChatRequestBodySettings> = {}): ChatRequestBodySettings => ({
  customApiGroups: [],
  customBaseUrl: "",
  customApiKey: "",
  customModelId: "",
  defaultImageModelId: null,
  imageModeTextModel: "mimo-v2.5",
  imageModeTextModelFallback: "mimo-v2.5",
  disabledTools: [],
  globalContext: "",
  ...partial,
});

const resolved: ResolvedRequestSettings = {
  effectiveModelId: "z-ai/glm-5.3-flash",
  model: undefined,
  enableThinking: true,
  thinkingEffort: "high",
  enableSearch: false,
  contextMode: "full",
};

test("buildChatRequestBody：映射上下文与预算字段", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ globalContext: "补充", disabledTools: ["webSearch"] }),
    resolved,
    { limit: 8000, estimated: 1200, softLimitReached: false },
    [{ id: "s1", name: "技能", description: "d", content: "c", pinned: false, createdAt: 1 }],
    "2025-2026-1",
  );
  assert.equal(body.modelId, "z-ai/glm-5.3-flash");
  assert.equal(body.subjectId, "math");
  assert.equal(body.academicYear, "2025-2026-1");
  assert.equal(body.contextTruncated, false);
  assert.equal(body.sessionContextBudgetTokens, 8000);
  assert.equal(body.clientContextTokens, 1200);
  assert.equal(body.globalContext, "补充");
  assert.deepEqual(body.disabledTools, ["webSearch"]);
  assert.equal(body.customProvider, undefined);
  assert.equal(body.skills[0]?.id, "s1");
  assert.equal(body.capabilityEndpoints.webSearchApiKey, "");
});

const allCapabilityKeys = {
  imageBaseUrl: "https://img.example/v1",
  imageApiKey: "sk-image",
  imageModelId: "img-1",
  imageApiStyle: "openai" as const,
  embeddingBaseUrl: "https://emb.example/v1",
  embeddingApiKey: "sk-embed",
  embeddingModelId: "emb-1",
  rerankBaseUrl: "https://rr.example/v1",
  rerankApiKey: "sk-rerank",
  rerankModelId: "rr-1",
  webSearchApiKey: " user-zhipu ",
  unsplashAccessKey: "user-unsplash",
};

test("buildChatRequestBody：未开联网时不发搜索密钥，检索 sidecar 仍带", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ capabilityEndpoints: allCapabilityKeys }),
    resolved,
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.capabilityEndpoints.webSearchApiKey, "");
  assert.equal(body.capabilityEndpoints.unsplashAccessKey, "");
  assert.equal(body.capabilityEndpoints.imageApiKey, "");
  assert.equal(body.capabilityEndpoints.embeddingApiKey, "sk-embed");
  assert.equal(body.capabilityEndpoints.rerankApiKey, "sk-rerank");
  assert.equal(body.capabilityEndpoints.imageBaseUrl, "https://img.example/v1");
});

test("buildChatRequestBody：开联网时只发搜索相关密钥，生图密钥缺席", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ capabilityEndpoints: allCapabilityKeys }),
    { ...resolved, enableSearch: true },
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.capabilityEndpoints.webSearchApiKey, "user-zhipu");
  assert.equal(body.capabilityEndpoints.unsplashAccessKey, "user-unsplash");
  assert.equal(body.capabilityEndpoints.embeddingApiKey, "sk-embed");
  assert.equal(body.capabilityEndpoints.rerankApiKey, "sk-rerank");
  assert.equal(body.capabilityEndpoints.imageApiKey, "");
  assert.equal(JSON.stringify(body).includes("sk-image"), false);
});

test("buildChatRequestBody：禁用 webSearch 时不发智谱 key，imageSearch 仍带", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ capabilityEndpoints: allCapabilityKeys, disabledTools: ["webSearch"] }),
    { ...resolved, enableSearch: true },
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.capabilityEndpoints.webSearchApiKey, "");
  assert.equal(body.capabilityEndpoints.unsplashAccessKey, "user-unsplash");
  assert.equal(JSON.stringify(body).includes("user-zhipu"), false);
});

test("buildChatRequestBody：禁用 searchNotes 且非 semantic 时不发向量/重排 key", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ capabilityEndpoints: allCapabilityKeys, disabledTools: ["searchNotes"] }),
    resolved,
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.capabilityEndpoints.embeddingApiKey, "");
  assert.equal(body.capabilityEndpoints.rerankApiKey, "");
});

test("buildChatRequestBody：semantic 即使禁用 searchNotes 仍带向量/重排 key", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ capabilityEndpoints: allCapabilityKeys, disabledTools: ["searchNotes"] }),
    { ...resolved, contextMode: "semantic" },
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.capabilityEndpoints.embeddingApiKey, "sk-embed");
  assert.equal(body.capabilityEndpoints.rerankApiKey, "sk-rerank");
});

test("buildChatRequestBody：无分组且旧版 custom 模型时附带 customProvider", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({ customBaseUrl: "https://api.example", customApiKey: "k", customModelId: "m1" }),
    { ...resolved, effectiveModelId: "custom:m1" },
    { limit: 1, estimated: 1, softLimitReached: true },
    [],
    "y",
  );
  assert.deepEqual(body.customProvider, { baseUrl: "https://api.example", apiKey: "k", model: "m1" });
  assert.equal(body.contextTruncated, true);
  assert.deepEqual(body.customApiGroups, []);
});

test("buildChatRequestBody：内置模型不发任何分组密钥", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({
      customApiGroups: [
        { id: "g", name: "G", baseUrl: "https://x", apiKey: "secret-a", models: [{ id: "m1" }] },
        { id: "h", name: "H", baseUrl: "https://y", apiKey: "secret-b", models: [{ id: "m2" }] },
      ],
      customBaseUrl: "https://legacy",
      customApiKey: "legacy-k",
    }),
    resolved,
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.customProvider, undefined);
  assert.deepEqual(body.customApiGroups, []);
});

test("buildChatRequestBody：自定义模型只发本次用到的那一个分组", () => {
  const groups = [
    { id: "g", name: "G", baseUrl: "https://x", apiKey: "secret-a", models: [{ id: "m1" }] },
    { id: "h", name: "H", baseUrl: "https://y", apiKey: "secret-b", models: [{ id: "m2" }] },
  ];
  const body = buildChatRequestBody(
    ctx,
    settings({ customApiGroups: groups, customBaseUrl: "https://legacy", customApiKey: "legacy-k" }),
    { ...resolved, effectiveModelId: "custom:h:m2" },
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.equal(body.customProvider, undefined);
  assert.equal(body.customApiGroups.length, 1);
  assert.equal(body.customApiGroups[0]?.id, "h");
  assert.equal(body.customApiGroups[0]?.apiKey, "secret-b");
  assert.equal(JSON.stringify(body).includes("secret-a"), false);
});

test("buildChatRequestBody：custom-openai 不带网页其它分组的 key", () => {
  const body = buildChatRequestBody(
    ctx,
    settings({
      customApiGroups: [{ id: "g", name: "G", baseUrl: "https://x", apiKey: "secret-a", models: [{ id: "m1" }] }],
    }),
    { ...resolved, effectiveModelId: "custom-openai" },
    { limit: 1, estimated: 1, softLimitReached: false },
    [],
    "y",
  );
  assert.deepEqual(body.customApiGroups, []);
  assert.equal(body.customProvider, undefined);
});
