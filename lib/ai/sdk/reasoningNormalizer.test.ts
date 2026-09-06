import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractReasoningText,
  needsReasoningNormalization,
  normalizeSseLine,
  createReasoningNormalizingFetch,
} from "./reasoningNormalizer.ts";

test("extractReasoningText：字符串 / 对象 / 数组 / 嵌套 content", () => {
  assert.equal(extractReasoningText("abc"), "abc");
  assert.equal(extractReasoningText({ type: "thinking", thinking: "t1" }), "t1");
  assert.equal(extractReasoningText([{ text: "a" }, { thinking: "b" }]), "ab");
  assert.equal(extractReasoningText({ content: [{ text: "x" }] }), "x");
  assert.equal(extractReasoningText(42), "");
});

test("needsReasoningNormalization：标准字段不需要", () => {
  assert.equal(needsReasoningNormalization("reasoning_content"), false);
  assert.equal(needsReasoningNormalization("reasoning"), false);
  assert.equal(needsReasoningNormalization("thinking"), true);
  assert.equal(needsReasoningNormalization(undefined), false);
});

test("normalizeSseLine：thinking 字符串 → reasoning_content", () => {
  const line = `data: ${JSON.stringify({ choices: [{ delta: { thinking: "hmm" } }] })}`;
  const out = JSON.parse(normalizeSseLine(line, "thinking").slice(6));
  assert.equal(out.choices[0].delta.reasoning_content, "hmm");
});

test("normalizeSseLine：reasoning_details 结构化数组 → 拼接文本", () => {
  const line = `data: ${JSON.stringify({ choices: [{ delta: { reasoning_details: [{ type: "reasoning.text", text: "a" }, { text: "b" }] } }] })}`;
  const out = JSON.parse(normalizeSseLine(line, "custom_field").slice(6));
  assert.equal(out.choices[0].delta.reasoning_content, "ab");
});

test("normalizeSseLine：已有 reasoning_content 时不覆盖；非 data 行与 [DONE] 原样透传", () => {
  const line = `data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: "keep", thinking: "x" } }] })}`;
  assert.equal(normalizeSseLine(line, "thinking"), line);
  assert.equal(normalizeSseLine(": heartbeat", "thinking"), ": heartbeat");
  assert.equal(normalizeSseLine("data: [DONE]", "thinking"), "data: [DONE]");
  assert.equal(normalizeSseLine("data: not-json", "thinking"), "data: not-json");
});

test("createReasoningNormalizingFetch：跨 chunk 边界的 SSE 流被逐行改写", async () => {
  const sse =
    `data: ${JSON.stringify({ choices: [{ delta: { thinking: "th" } }] })}\n\n` +
    `data: ${JSON.stringify({ choices: [{ delta: { content: "hi" } }] })}\n\n` +
    `data: [DONE]\n\n`;
  const bytes = new TextEncoder().encode(sse);
  const mid = Math.floor(bytes.length / 2);
  const baseFetch = (async () =>
    new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(bytes.slice(0, mid));
          c.enqueue(bytes.slice(mid));
          c.close();
        },
      }),
      { headers: { "content-type": "text/event-stream", "content-length": "999" } },
    )) as unknown as typeof fetch;

  const wrapped = createReasoningNormalizingFetch("thinking", baseFetch);
  const res = await wrapped("https://x");
  const text = await res.text();
  assert.equal(res.headers.get("content-length"), null);
  const lines = text.split("\n").filter((l) => l.startsWith("data:") && !l.includes("[DONE]"));
  assert.equal(JSON.parse(lines[0].slice(6)).choices[0].delta.reasoning_content, "th");
  assert.equal(JSON.parse(lines[1].slice(6)).choices[0].delta.content, "hi");
  assert.ok(text.endsWith("data: [DONE]\n\n"));
});

test("createReasoningNormalizingFetch：非流式 JSON 改写 message；非 JSON/SSE 响应原样返回", async () => {
  const jsonFetch = (async () =>
    new Response(JSON.stringify({ choices: [{ message: { thinking: "deep", content: "ans" } }] }), {
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch;
  const r1 = await createReasoningNormalizingFetch("thinking", jsonFetch)("https://x");
  const j = await r1.json();
  assert.equal(j.choices[0].message.reasoning_content, "deep");

  const plain = new Response("plain", { headers: { "content-type": "text/plain" } });
  const plainFetch = (async () => plain) as unknown as typeof fetch;
  const r2 = await createReasoningNormalizingFetch("thinking", plainFetch)("https://x");
  assert.equal(r2, plain);
});
