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

  // 判据是**真实数据**而不是时钟：固定 sleep 35ms 等在满载的测试进程里会假失败
  // （事件循环被占住时，一个 tick 只会跑一次 interval，等再久也只拿到 1 个心跳）。
  // 改成「读到第 2 个心跳再放行首 chunk」，语义没变、结果确定。
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = "";
  const beatsIn = (value: string) => (value.match(/: heartbeat\n\n/g) ?? []).length;

  while (beatsIn(text) < 2) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  release();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }

  const beats = beatsIn(text);
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
