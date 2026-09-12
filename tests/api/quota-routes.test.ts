import assert from "node:assert/strict";
import { after, afterEach, before, test, type TestContext } from "node:test";
import type { NextRequest } from "next/server";
import { buildCustomModelRegistryId, CUSTOM_OPENAI_MODEL_ID, type CustomApiGroup } from "@/lib/ai/models";
import { createUserMessage } from "@/lib/chat/messageParts";
import {
  PLATFORM_QUOTA_EXHAUSTED_MESSAGE,
  setQuotaGateTestDeps,
  type QuotaStore,
  type QuotaUserRow,
} from "@/lib/billing/quotaGate";

const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const envNames = [
  "AI_BASE_URL",
  "AI_API_KEY",
  "RELAY_BASE_URL",
  "RELAY_API_KEY",
  "RELAY_MODEL_ID",
  "MIMO_BASE_URL",
  "MIMO_API_KEY",
  "ZHIPU_BASE_URL",
  "ZHIPU_API_KEY",
  "SILICONFLOW_BASE_URL",
  "SILICONFLOW_API_KEY",
] as const;
const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));

let chatPost: typeof import("@/app/api/chat/route")["POST"];
let imagePost: typeof import("@/app/api/image-gen/route")["POST"];
let recordPost: typeof import("@/app/api/record/route")["POST"];

before(async () => {
  process.env.AI_BASE_URL = "https://primary.invalid/v1";
  process.env.AI_API_KEY = "test-only";
  process.env.RELAY_BASE_URL = "https://relay.invalid/v1";
  process.env.RELAY_API_KEY = "relay-test";
  process.env.RELAY_MODEL_ID = "relay-model";
  process.env.MIMO_BASE_URL = "https://backup.invalid/v1";
  process.env.MIMO_API_KEY = "test-only";
  process.env.ZHIPU_BASE_URL = "https://backup.invalid/v1";
  process.env.ZHIPU_API_KEY = "test-only";
  process.env.SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
  process.env.SILICONFLOW_API_KEY = "sf-image-key";
  ({ POST: chatPost } = await import("@/app/api/chat/route"));
  ({ POST: imagePost } = await import("@/app/api/image-gen/route"));
  ({ POST: recordPost } = await import("@/app/api/record/route"));
});

after(() => {
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
});

afterEach(() => {
  setQuotaGateTestDeps(null);
});

const groups: CustomApiGroup[] = [
  {
    id: "quota",
    name: "Quota",
    baseUrl: "https://custom.invalid/v1",
    apiKey: "user-key",
    models: [{ id: "study-model", thinking: false, tools: true, apiProtocol: "openai" }],
  },
];

function exhaustedStore(): QuotaStore {
  const user: QuotaUserRow = {
    id: USER,
    tier: "free",
    period_start: "2026-09-01T00:00:00.000Z",
    period_end: "2026-10-01T00:00:00.000Z",
  };
  return {
    async getUser() {
      return user;
    },
    async savePeriod() {},
    async listGrants() {
      return [
        {
          pool: "platform",
          tier: "free",
          amount_cny: 7,
          period_start: user.period_start,
          period_end: user.period_end,
        },
      ];
    },
    async listLedger() {
      return [{ pool: "platform", kind: "llm", cost_cny: 7, meta: { source: "chat-main" } }];
    },
  };
}

function useExhaustedUser() {
  setQuotaGateTestDeps({
    now: () => new Date("2026-09-10T00:00:00.000Z"),
    resolveUserId: async () => USER,
    store: exhaustedStore(),
  });
}

function event(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function openAiStream(text: string): Response {
  const parts = [
    { choices: [{ delta: { content: text } }] },
    { choices: [{ delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 8, completion_tokens: 4, total_tokens: 12 } },
  ];
  return new Response(parts.map(event).join("") + "data: [DONE]\n\n", {
    headers: { "Content-Type": "text/event-stream" },
  });
}

function chatRequest(body: Record<string, unknown>) {
  return new Request("https://app.invalid/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: "Bearer test-token" },
    body: JSON.stringify({
      messages: [createUserMessage("u1", "解释这一节")],
      ...body,
    }),
  }) as NextRequest;
}

test("platform 池耗尽：内置模型与 custom-openai 被拒，提示可改用 BYOK", async () => {
  useExhaustedUser();
  const builtin = await chatPost(chatRequest({ modelId: "z-ai/glm-5.3-flash" }));
  assert.equal(builtin.status, 402);
  const builtinBody = (await builtin.json()) as { error: string; code: string };
  assert.equal(builtinBody.code, "quota_exhausted");
  assert.equal(builtinBody.error, PLATFORM_QUOTA_EXHAUSTED_MESSAGE);
  assert.match(builtinBody.error, /可改用 BYOK/);

  const relay = await chatPost(chatRequest({ modelId: CUSTOM_OPENAI_MODEL_ID }));
  assert.equal(relay.status, 402);
  const relayBody = (await relay.json()) as { error: string };
  assert.match(relayBody.error, /可改用 BYOK/);
});

test("platform 池耗尽：真 BYOK 主模型仍可调用（不打付费上游）", async (t: TestContext) => {
  useExhaustedUser();
  t.mock.method(globalThis, "fetch", async () =>
    openAiStream("BYOK 仍可用。<FollowUp>如何应用|如何验证</FollowUp>"),
  );
  const res = await chatPost(
    chatRequest({
      modelId: buildCustomModelRegistryId("quota", "study-model"),
      customApiGroups: groups,
    }),
  );
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /BYOK 仍可用/);
  assert.doesNotMatch(text, /平台额度已用完/);
});

test("image-gen 平台模型在额度耗尽时返回可读 402，不是裸 500", async () => {
  useExhaustedUser();
  const res = await imagePost(
    new Request("https://local.invalid/api/image-gen", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer test-token" },
      body: JSON.stringify({ modelId: "Tongyi-MAI/Z-Image-Turbo", prompt: "red circle" }),
    }) as NextRequest,
  );
  assert.equal(res.status, 402);
  const body = (await res.json()) as { error: string; code: string };
  assert.equal(body.code, "quota_exhausted");
  assert.match(body.error, /可改用 BYOK/);
});

test("record 平台模型耗尽时 SSE error 含 BYOK 提示", async () => {
  useExhaustedUser();
  const res = await recordPost(
    new Request("https://local.invalid/api/record", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer test-token" },
      body: JSON.stringify({
        mode: "excerpt",
        text: "原文",
        modelId: "z-ai/glm-5.3-flash",
      }),
    }) as NextRequest,
  );
  assert.equal(res.status, 402);
  const text = await res.text();
  assert.match(text, /可改用 BYOK/);
});
