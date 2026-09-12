import assert from "node:assert/strict";
import { after, before, test, type TestContext } from "node:test";
import type { NextRequest } from "next/server";

const envNames = [
  "AI_BASE_URL",
  "AI_API_KEY",
  "RELAY_BASE_URL",
  "RELAY_API_KEY",
  "SILICONFLOW_BASE_URL",
  "SILICONFLOW_API_KEY",
] as const;
const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
let route: typeof import("../../app/api/image-gen/route.ts");

before(async () => {
  process.env.RELAY_BASE_URL = "https://relay.other.invalid/v1";
  process.env.RELAY_API_KEY = "relay-test-key";
  process.env.AI_BASE_URL = "https://ai.other.invalid/v1";
  process.env.AI_API_KEY = "ai-test-key";
  process.env.SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
  process.env.SILICONFLOW_API_KEY = "sf-image-key";
  route = await import("../../app/api/image-gen/route.ts");
});

after(() => {
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
});

function request(body: unknown) {
  return new Request("https://local.invalid/api/image-gen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

interface CapturedRequest {
  url: string;
  init: RequestInit;
  body: Record<string, unknown>;
}

function upstream(t: TestContext, responder: (call: CapturedRequest) => Response | Promise<Response>) {
  const calls: CapturedRequest[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init: RequestInit = {}) => {
    const call = {
      url: String(input),
      init,
      body: JSON.parse(String(init.body)) as Record<string, unknown>,
    };
    calls.push(call);
    return responder(call);
  });
  return calls;
}

function useSiliconflowEnv() {
  process.env.SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
  process.env.SILICONFLOW_API_KEY = "sf-image-key";
  process.env.AI_BASE_URL = "https://ai.other.invalid/v1";
  process.env.RELAY_BASE_URL = "https://relay.other.invalid/v1";
}

test("image-gen: mock 200 SiliconFlow 解析出非空图片，且不走 relay", async (t) => {
  useSiliconflowEnv();
  const calls = upstream(t, () =>
    Response.json({
      images: [{ url: "https://cdn.example/red-circle.png" }],
      seed: 42,
    }),
  );
  const res = await route.POST(request({
    modelId: "Tongyi-MAI/Z-Image-Turbo",
    prompt: "red circle",
  }));
  assert.equal(res.status, 200);
  const data = await res.json() as {
    images: { url?: string }[];
    seed?: number;
    model?: string;
    apiStyle?: string;
  };
  assert.equal(data.images.length, 1);
  assert.equal(data.images[0].url, "https://cdn.example/red-circle.png");
  assert.equal(data.seed, 42);
  assert.equal(data.model, "Tongyi-MAI/Z-Image-Turbo");
  assert.equal(data.apiStyle, "siliconflow");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.siliconflow.cn/v1/images/generations");
  assert.ok(!calls[0].url.includes("relay.other.invalid"));
  assert.ok(!calls[0].url.includes("ai.other.invalid"));
  assert.equal(new Headers(calls[0].init.headers).get("Authorization"), "Bearer sf-image-key");
  assert.equal(calls[0].body.image_size, "1024x1024");
  assert.equal(calls[0].body.model, "Tongyi-MAI/Z-Image-Turbo");
});

test("image-gen: mock 200 OpenAI b64_json 解析出图片", async (t) => {
  useSiliconflowEnv();
  upstream(t, () =>
    Response.json({
      data: [{ b64_json: "abc123", revised_prompt: "red circle" }],
    }),
  );
  const res = await route.POST(request({
    modelId: "Tongyi-MAI/Z-Image-Turbo",
    prompt: "red circle",
  }));
  assert.equal(res.status, 200);
  const data = await res.json() as { images: { b64_json?: string; revised_prompt?: string }[] };
  assert.equal(data.images[0].b64_json, "abc123");
  assert.equal(data.images[0].revised_prompt, "red circle");
});

test("image-gen: 上游 404 为 bad_endpoint，401 为 upstream_auth", async (t) => {
  useSiliconflowEnv();
  const calls = upstream(t, (call) => {
    if (call.body.prompt === "missing") {
      return new Response("not found", { status: 404 });
    }
    return Response.json({ error: { message: "invalid api key" } }, { status: 401 });
  });
  const notFound = await route.POST(request({ modelId: "Tongyi-MAI/Z-Image-Turbo", prompt: "missing" }));
  assert.equal(notFound.status, 502);
  const notFoundBody = await notFound.json() as { code?: string; error?: string };
  assert.equal(notFoundBody.code, "bad_endpoint");
  assert.match(notFoundBody.error ?? "", /端点不对/);

  const denied = await route.POST(request({ modelId: "Tongyi-MAI/Z-Image-Turbo", prompt: "denied" }));
  assert.equal(denied.status, 502);
  const deniedBody = await denied.json() as { code?: string; error?: string };
  assert.equal(deniedBody.code, "upstream_auth");
  assert.match(deniedBody.error ?? "", /上游拒绝/);
  assert.equal(calls.length, 2);
});
