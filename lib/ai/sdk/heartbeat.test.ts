import assert from "node:assert/strict";
import { test } from "node:test";
import { withSseHeartbeat } from "./heartbeat.ts";

const enc = new TextEncoder();

test("withSseHeartbeat：首 chunk 到达前注入心跳注释，之后停止", async () => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const body = new ReadableStream<Uint8Array>({
    async start(c) {
      await gate;
      c.enqueue(enc.encode("data: {\"type\":\"text-delta\"}\n\n"));
      c.close();
    },
  });
  const res = withSseHeartbeat(new Response(body, { headers: { "content-type": "text/event-stream" } }), 10);
  // 等两个心跳周期再放行首 chunk
  await new Promise((r) => setTimeout(r, 35));
  release();
  const text = await res.text();
  const beats = (text.match(/: heartbeat\n\n/g) ?? []).length;
  assert.ok(beats >= 2, `expected >=2 heartbeats, got ${beats}`);
  assert.ok(text.endsWith("data: {\"type\":\"text-delta\"}\n\n"));
  // 首 chunk 之后不应再有心跳
  assert.equal(text.indexOf("data:") > text.lastIndexOf(": heartbeat"), true);
});

test("withSseHeartbeat：无 body 的响应原样返回", () => {
  const res = new Response(null, { status: 204 });
  assert.equal(withSseHeartbeat(res), res);
});

test("withSseHeartbeat：保留状态码与响应头", async () => {
  const res = withSseHeartbeat(
    new Response(new ReadableStream({ start(c) { c.enqueue(enc.encode("x")); c.close(); } }), {
      status: 200,
      headers: { "content-type": "text/event-stream", "x-accel-buffering": "no" },
    }),
  );
  assert.equal(res.headers.get("x-accel-buffering"), "no");
  assert.equal(await res.text(), "x");
});
