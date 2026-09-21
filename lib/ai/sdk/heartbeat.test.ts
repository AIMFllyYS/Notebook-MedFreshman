import assert from "node:assert/strict";
import { test } from "node:test";
import { withSseHeartbeat } from "./heartbeat.ts";

const enc = new TextEncoder();
const dec = new TextDecoder();

/** 带超时的 read：实现坏掉时不要挂死整个测试进程。 */
async function readWithTimeout(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  ms: number,
): Promise<{ done: boolean; value?: Uint8Array } | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([reader.read(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

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
  let text = "";
  const beatsIn = (value: string) => (value.match(/: heartbeat\n\n/g) ?? []).length;

  while (beatsIn(text) < 2) {
    const { value, done } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
  }
  release();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
  }

  const beats = beatsIn(text);
  assert.ok(beats >= 2, `expected >=2 heartbeats, got ${beats}`);
  assert.ok(text.endsWith("data: {\"type\":\"text-delta\"}\n\n"));
  // 首 chunk 之后不应再有心跳
  assert.equal(text.indexOf("data:") > text.lastIndexOf(": heartbeat"), true);
});

test("withSseHeartbeat：keepaliveWhileIdle 在首 chunk 之后的静默期继续保活", async () => {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start(c) { ctrl = c; } });
  const res = withSseHeartbeat(new Response(body, { headers: { "content-type": "text/event-stream" } }), {
    intervalMs: 10,
    keepaliveWhileIdle: true,
  });

  const reader = res.body!.getReader();
  let text = "";
  // 先来一个真实 chunk（role 帧），之后彻底静默——正是深度思考时的形态。
  ctrl.enqueue(enc.encode("data: first\n\n"));
  const deadline = Date.now() + 2_000;
  while (!/data: first\n\n: heartbeat/.test(text) && Date.now() < deadline) {
    const chunk = await readWithTimeout(reader, 400);
    if (!chunk || chunk.done) break;
    text += dec.decode(chunk.value, { stream: true });
  }
  assert.match(text, /data: first\n\n: heartbeat/, `静默期没有补心跳，实际收到：${JSON.stringify(text)}`);

  // 静默结束后真实数据照常透传，顺序不被心跳打乱。
  ctrl.enqueue(enc.encode("data: second\n\n"));
  ctrl.close();
  for (;;) {
    const chunk = await readWithTimeout(reader, 400);
    if (!chunk || chunk.done) break;
    text += dec.decode(chunk.value, { stream: true });
  }
  assert.match(text, /data: first\n\n: heartbeat[\s\S]*data: second\n\n/);
});

test("withSseHeartbeat：keepaliveWhileIdle 下持续输出不补心跳", async () => {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start(c) { ctrl = c; } });
  // 心跳间隔远大于本用例耗时：有数据在流就不该出现任何注释。
  const res = withSseHeartbeat(new Response(body, { headers: { "content-type": "text/event-stream" } }), {
    intervalMs: 5_000,
    keepaliveWhileIdle: true,
  });

  const reader = res.body!.getReader();
  ctrl.enqueue(enc.encode("data: a\n\n"));
  ctrl.enqueue(enc.encode("data: b\n\n"));
  ctrl.close();
  let text = "";
  for (;;) {
    const chunk = await readWithTimeout(reader, 400);
    if (!chunk || chunk.done) break;
    text += dec.decode(chunk.value, { stream: true });
  }
  assert.equal(text, "data: a\n\ndata: b\n\n");
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
