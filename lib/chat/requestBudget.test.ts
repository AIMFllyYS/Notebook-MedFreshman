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

test("fitChatRequest：先砍项目正文，再动本轮的图", () => {
  const sliceText = "项".repeat(2_000);
  const body = {
    modelId: "m",
    projectFiles: [{ fileId: "f1", name: "大项目.md", kind: "imported", status: "indexed", slices: [] }],
    projectSlices: Array.from({ length: 10 }, (_, index) => ({
      fileId: "f1",
      sliceId: `s${index}`,
      title: `第 ${index} 片`,
      text: sliceText,
    })),
  };
  const messages: RequestMessage[] = [
    msg("1", "assistant", "历史"),
    msg("2", "user", "这轮提问", [{ type: "file", mediaType: "image/png", url: `data:image/png;base64,${"y".repeat(80)}` }]),
  ];
  const fitted = fitChatRequest(messages, body, 12_000);

  const kept = fitted.body.projectSlices as unknown[];
  assert.ok(Array.isArray(kept));
  assert.ok(kept.length < 10, "项目正文该被裁掉一部分");
  assert.match(fitted.info ?? "", /项目文件正文已按体积裁剪/);
  // 目录还在：模型仍然知道有哪些片、能请用户补带。
  assert.equal(Array.isArray(fitted.body.projectFiles), true);
  // 本轮的图优先保住，不该先被砍。
  const latest = fitted.messages.find((m) => m.id === "2");
  assert.ok(latest?.parts.some((part) => part.type === "file"));
  assert.ok(requestPayloadBytes(fitted.messages, fitted.body) <= 12_000);
});

test("fitChatRequest：项目正文砍到 0 还不够时才继续丢图", () => {
  const body = {
    projectSlices: Array.from({ length: 8 }, (_, index) => ({
      fileId: "f1",
      sliceId: `s${index}`,
      title: "片",
      text: "项".repeat(1_000),
    })),
  };
  const messages: RequestMessage[] = [
    msg("1", "user", "历史提问"),
    msg("2", "assistant", "a1"),
    msg("3", "user", "最新提问", [{ type: "file", mediaType: "image/png", url: `data:image/png;base64,${"y".repeat(4_000)}` }]),
  ];
  const fitted = fitChatRequest(messages, body, 3_000);
  assert.equal((fitted.body.projectSlices as unknown[]).length, 0, "先砍干净项目正文");
  // 只剩图片这一个杠杆时才动它。
  const latest = fitted.messages.find((m) => m.id === "3");
  assert.equal(latest?.parts.some((part) => part.type === "file"), false);
  assert.ok(requestPayloadBytes(fitted.messages, fitted.body) <= 3_000);
});

test("isPayloadTooLargeError 识别 413 与 nginx HTML", () => {
  assert.equal(isPayloadTooLargeError(new Error("API 请求失败: 413 Request Entity Too Large")), true);
  assert.equal(isPayloadTooLargeError(new Error("<html>413 Request Entity Too Large nginx/1.18.0</html>")), true);
  assert.equal(isPayloadTooLargeError(new Error("上游返回错误")), false);
});
