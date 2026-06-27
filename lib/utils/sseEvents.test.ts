import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSseJsonEvents } from "./sseEvents.ts";

test("parses JSON data events and treats comment heartbeats as activity", () => {
  const parsed = parseSseJsonEvents(': heartbeat\n\ndata: {"type":"ping"}\n\npartial');

  assert.equal(parsed.hadActivity, true);
  assert.deepEqual(parsed.events, [{ type: "ping" }]);
  assert.equal(parsed.remaining, "partial");
});

test("keeps incomplete JSON data lines in the remaining buffer", () => {
  const parsed = parseSseJsonEvents('data: {"type":"artifact","status":"del');

  assert.equal(parsed.hadActivity, false);
  assert.deepEqual(parsed.events, []);
  assert.equal(parsed.remaining, 'data: {"type":"artifact","status":"del');
});

test("[DONE] 哨兵被跳过不计入 events", () => {
  const parsed = parseSseJsonEvents('data: [DONE]\n\ndata: {"type":"ping"}\n\n');
  assert.deepEqual(parsed.events, [{ type: "ping" }]);
});

test("多行 data 事件全部解析", () => {
  const parsed = parseSseJsonEvents(
    'data: {"type":"a"}\ndata: {"type":"b"}\ndata: {"type":"c"}\n',
  );
  assert.equal(parsed.events.length, 3);
  assert.equal(parsed.events[0].type, "a");
  assert.equal(parsed.events[2].type, "c");
});

test("空 buffer 返回空结果", () => {
  const parsed = parseSseJsonEvents("");
  assert.deepEqual(parsed.events, []);
  assert.equal(parsed.remaining, "");
  assert.equal(parsed.hadActivity, false);
});

test("非 data: 前缀行被忽略", () => {
  const parsed = parseSseJsonEvents('event: ping\ndata: {"type":"x"}\n: comment\n');
  assert.deepEqual(parsed.events, [{ type: "x" }]);
});

test("畸形 JSON 行被跳过不抛错", () => {
  const parsed = parseSseJsonEvents('data: {bad json}\ndata: {"type":"ok"}\n');
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.events[0].type, "ok");
});

test("仅含换行符的 buffer", () => {
  const parsed = parseSseJsonEvents("\n\n\n");
  assert.deepEqual(parsed.events, []);
  assert.equal(parsed.remaining, "");
  assert.equal(parsed.hadActivity, true);
});
