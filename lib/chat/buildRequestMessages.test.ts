import assert from "node:assert/strict";
import { test } from "node:test";
import { buildRequestMessages, type RequestMessage } from "./buildRequestMessages.ts";
import type { ChatMessage } from "@/lib/types/chat";

function msg(id: string, role: ChatMessage["role"], content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id, role, parts: content ? [{ type: "text", text: content }] : [], timestamp: Number(id), ...extra };
}

function textOf(m: RequestMessage): string {
  return m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join("");
}

function hasFile(m: RequestMessage): boolean {
  return m.parts.some((p) => p.type === "file");
}

test("buildRequestMessages：短历史不截断", () => {
  const messages = [
    msg("1", "user", "a"),
    msg("2", "assistant", "b"),
  ];
  const { messages: out, truncated } = buildRequestMessages(messages, 40);
  assert.equal(truncated, false);
  assert.equal(out.length, 2);
});

test("buildRequestMessages：过滤流式中的空 assistant 占位", () => {
  const messages = [
    msg("1", "user", "latest question"),
    msg("2", "assistant", ""),
  ];

  const { messages: out, truncated } = buildRequestMessages(messages);

  assert.equal(truncated, false);
  assert.equal(out.length, 1);
  assert.equal(out[0].role, "user");
  assert.equal(textOf(out[0]), "latest question");
});

test("buildRequestMessages：剥离 reasoning / step-start，保留工具结果供服务端衰减", () => {
  const assistant: ChatMessage = {
    id: "2",
    role: "assistant",
    timestamp: 2,
    parts: [
      { type: "reasoning", text: "thinking…", state: "done" },
      { type: "tool-getCurrentPage", toolCallId: "c1", state: "output-available", input: {}, output: { text: "page", contextKey: "page:x" } },
      { type: "step-start" },
      { type: "text", text: "answer", state: "done" },
    ],
  };
  const { messages: out } = buildRequestMessages([msg("1", "user", "q"), assistant]);
  assert.equal(out.length, 2);
  assert.deepEqual(out[1].parts.map((p) => p.type), ["tool-getCurrentPage", "text"]);
  assert.equal(textOf(out[1]), "answer");
});

test("buildRequestMessages：只有工具调用没有正文的 assistant 仍带工具 parts", () => {
  const assistant: ChatMessage = {
    id: "2",
    role: "assistant",
    timestamp: 2,
    parts: [
      { type: "tool-getCurrentPage", toolCallId: "c1", state: "output-available", input: {}, output: { text: "page", contextKey: "page:x" } },
    ],
  };
  const { messages: out } = buildRequestMessages([msg("1", "user", "q"), assistant]);
  assert.equal(out.length, 2);
  assert.equal(out[1].parts.length, 1);
  assert.equal(out[1].parts[0]?.type, "tool-getCurrentPage");
});

test("buildRequestMessages：超长历史截断尾部", () => {
  const messages: ChatMessage[] = [];
  for (let i = 0; i < 100; i++) {
    messages.push(msg(String(i * 2), "user", `u${i}`));
    messages.push(msg(String(i * 2 + 1), "assistant", `a${i}`));
  }
  const { messages: out, truncated } = buildRequestMessages(messages, 10);
  assert.equal(truncated, true);
  assert.equal(out.length, 10);
  assert.equal(textOf(out[0]), "u95");
});

test("buildRequestMessages：含附件的早期 user 消息保留并转成 file part", () => {
  const messages: ChatMessage[] = [];
  for (let i = 0; i < 50; i++) {
    messages.push(msg(String(i), "user", `u${i}`));
  }
  messages[0] = msg("0", "user", "with image", {
    attachments: [{ type: "image", mimeType: "image/png", base64: "data:image/png;base64,abc" }],
  });
  const { messages: out, truncated } = buildRequestMessages(messages, 5);
  assert.equal(truncated, true);
  const img = out.find(hasFile);
  assert.ok(img);
  const file = img!.parts.find((p) => p.type === "file") as { mediaType: string; url: string };
  assert.equal(file.mediaType, "image/png");
  assert.equal(file.url, "data:image/png;base64,abc");
});

test("buildRequestMessages：TXT / MD / DOCX 正文作为明确标记的文本附件发送", () => {
  const input = msg("1", "user", "请总结附件", {
    attachments: [
      { type: "document", mimeType: "text/plain", name: "课堂笔记.txt", text: "第一段正文", size: 12, characterCount: 5 },
      { type: "document", mimeType: "text/markdown", name: "review.md", text: "# 复习提纲", size: 16, characterCount: 6 },
    ],
  });

  const { messages } = buildRequestMessages([input]);
  assert.equal(messages[0].parts.some((part) => part.type === "file"), false);
  const requestText = textOf(messages[0]);
  assert.match(requestText, /attached-document name="课堂笔记.txt"/);
  assert.match(requestText, /第一段正文/);
  assert.match(requestText, /attached-document name="review.md" type="text\/markdown"/);
  assert.match(requestText, /# 复习提纲/);
});

test("buildRequestMessages：HTML 附件只作为源码文本发送", () => {
  const htmlSource = '<article><script>alert("never render")</script>正文</article>';
  const input = msg("1", "user", "检查网页源码", {
    attachments: [
      { type: "document", mimeType: "text/html", name: "lesson.html", text: htmlSource, size: 64, characterCount: 58 },
    ],
  });

  const { messages } = buildRequestMessages([input]);
  assert.equal(messages[0].parts.some((part) => part.type === "file"), false);
  const requestText = textOf(messages[0]);
  assert.match(requestText, /attached-document name="lesson\.html" type="text\/html"/);
  assert.match(requestText, /<script>alert\("never render"\)<\/script>/);
});

test("buildRequestMessages：默认保留完整会话历史", () => {
  const messages: ChatMessage[] = [];
  for (let i = 0; i < 60; i++) {
    messages.push(msg(String(i), i % 2 === 0 ? "user" : "assistant", `m${i}`));
  }

  const { messages: out, truncated } = buildRequestMessages(messages);

  assert.equal(truncated, false);
  assert.equal(out.length, 60);
});

test("buildRequestMessages：maxTurns 截断可不保留早期附件", () => {
  const messages: ChatMessage[] = [];
  messages.push(msg("0", "user", "old image", {
    attachments: [{ type: "image", mimeType: "image/png", base64: "data:image/png;base64,abc" }],
  }));
  for (let i = 1; i < 40; i++) {
    messages.push(msg(String(i), i % 2 === 0 ? "user" : "assistant", `m${i}`));
  }

  const { messages: out, truncated, truncationReason } = buildRequestMessages(messages, {
    maxTurns: 8,
    reason: "soft-limit",
    preserveAttachmentHistory: false,
  });

  assert.equal(truncated, true);
  assert.equal(truncationReason, "soft-limit");
  assert.equal(out.length, 8);
  assert.equal(textOf(out[0]), "m32");
  assert.equal(out.some(hasFile), false);
});
