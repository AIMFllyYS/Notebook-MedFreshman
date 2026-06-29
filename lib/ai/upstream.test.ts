import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isRecoverableUpstreamFailure,
  parseUpstreamErrorBody,
  isFetchAbortError,
} from "./upstream.ts";

test("parseUpstreamErrorBody：智谱 1211", () => {
  const p = parseUpstreamErrorBody(
    JSON.stringify({ error: { code: "1211", message: "模型不存在" } }),
  );
  assert.equal(p.errorCode, "1211");
  assert.equal(p.message, "模型不存在");
});

test("parseUpstreamErrorBody：SiliconFlow 20012", () => {
  const p = parseUpstreamErrorBody(
    JSON.stringify({ code: 20012, message: "Model does not exist." }),
  );
  assert.equal(p.errorCode, "20012");
});

test("isRecoverableUpstreamFailure：模型不存在可降级", () => {
  assert.equal(isRecoverableUpstreamFailure(400, "1211"), true);
  assert.equal(isRecoverableUpstreamFailure(400, "20012"), true);
  assert.equal(isRecoverableUpstreamFailure(503), true);
});

test("isRecoverableUpstreamFailure：401/429 不可降级", () => {
  assert.equal(isRecoverableUpstreamFailure(401, "1000"), false);
  assert.equal(isRecoverableUpstreamFailure(429), false);
});

test("isFetchAbortError", () => {
  assert.equal(isFetchAbortError(new DOMException("aborted", "AbortError")), true);
  assert.equal(isFetchAbortError(new Error("other")), false);
});
