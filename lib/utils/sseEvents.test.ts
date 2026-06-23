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
