import assert from "node:assert/strict";
import { test } from "node:test";
import type { RequestMessage } from "./buildRequestMessages.ts";
import {
  REQUEST_TOO_LARGE_MESSAGE,
  fitChatRequest,
  isPayloadTooLargeError,
  requestPayloadBytes,
} from "./requestBudget.ts";

function msg(id: string, role: RequestMessage["role"], text: string, extra: RequestMessage["parts"] = []): RequestMessage {
  return { id, role, parts: [{ type: "text", text }, ...extra] };
}

test("fitChatRequest：先去历史图再截较早轮次", () => {
  const huge = "x".repeat(50_000);
  const messages: RequestMessage[] = [
    msg("1", "user", "old", [{ type: "file", mediaType: "image/png", url: `data:image/png;base64,${huge}` }]),
    msg("2", "assistant", "a1"),
    msg("3", "user", "q", [{ type: "file", mediaType: "image/png", url: `data:image/png;base64,${"y".repeat(100)}` }]),
  ];
  const fitted = fitChatRequest(messages, { modelId: "m" }, 8_000);
  assert.equal(fitted.truncated, true);
  assert.equal(fitted.messages.some((m) => m.parts.some((p) => p.type === "file" && String((p as { url?: string }).url).includes(huge))), false);
  assert.ok(requestPayloadBytes(fitted.messages, fitted.body) <= 8_000);
});

test("fitChatRequest：仍超预算则抛可读错误", () => {
  const messages = [msg("1", "user", "z".repeat(2000))];
  assert.throws(() => fitChatRequest(messages, {}, 100), (err: unknown) => {
    assert.ok(err instanceof Error);
    assert.equal(err.message, REQUEST_TOO_LARGE_MESSAGE);
    return true;
  });
});

test("isPayloadTooLargeError 识别 413 与 nginx HTML", () => {
  assert.equal(isPayloadTooLargeError(new Error("API 请求失败: 413 Request Entity Too Large")), true);
  assert.equal(isPayloadTooLargeError(new Error("<html>413 Request Entity Too Large nginx/1.18.0</html>")), true);
  assert.equal(isPayloadTooLargeError(new Error("上游返回错误")), false);
});
