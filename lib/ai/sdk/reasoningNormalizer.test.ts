import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractReasoningText,
  normalizeReasoningObject,
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

test("normalizeReasoningObject：两个标准字段分别归一化，不能遗留无效的原字段", () => {
  const target: Record<string, unknown> = {
    reasoning_content: [{ type: "text", text: "主" }, { content: [{ thinking: "思考" }] }],
    reasoning: { type: "thinking", thinking: "别名" },
    content: "答案",
  };
  assert.equal(normalizeReasoningObject(target, "reasoning"), true);
  assert.deepEqual(target, { reasoning_content: "主思考", reasoning: "别名", content: "答案" });
  assert.equal(normalizeReasoningObject(target, "reasoning"), false);
});

test("normalizeReasoningObject：已有效的标准文本不重复注入字段或覆盖；空主字段可回退", () => {
  const alternate = { reasoning: "keep", thinking: "do not overwrite" };
  assert.equal(normalizeReasoningObject(alternate, "thinking"), false);
  assert.deepEqual(alternate, { reasoning: "keep", thinking: "do not overwrite" });
  const primary = { reasoning_content: "keep", reasoning: { text: "normalize too" } };
  assert.equal(normalizeReasoningObject(primary, "thinking"), true);
  assert.deepEqual(primary, { reasoning_content: "keep", reasoning: "normalize too" });
  const empty = { reasoning_content: "", reasoning: "fallback" };
  assert.equal(normalizeReasoningObject(empty, "reasoning"), true);
  assert.deepEqual(empty, { reasoning_content: "fallback", reasoning: "fallback" });
});

test("normalizeReasoningObject：未知标准字段或混合畸形数组不被别名覆盖", () => {
  for (const malformed of [42, false, { unknown: "data" }, [{ text: "known" }, { unknown: "data" }]]) {
    for (const key of ["reasoning_content", "reasoning"]) {
      const target = { [key]: malformed, thinking: "must not hide malformed field" };
      const original = structuredClone(target);
      assert.equal(normalizeReasoningObject(target, "thinking"), false);
      assert.deepEqual(target, original);
    }
  }
});

test("normalizeReasoningObject：已知空结构允许归一为空文本", () => {
  const target = { reasoning_content: [], reasoning: { thinking: "" } };
  assert.equal(normalizeReasoningObject(target, "reasoning_content"), true);
  assert.deepEqual(target, { reasoning_content: "", reasoning: "" });
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

test("normalizeSseLine：默认标准配置仍兼容所有历史别名，且重复运行幂等", () => {
  for (const preferred of ["reasoning", "reasoning_content"]) {
    for (const alias of ["thinking", "reasoning_details", "reasoning_text"]) {
      const line = `data: ${JSON.stringify({ choices: [{ delta: { [alias]: { content: [{ text: "思考" }] } } }] })}`;
      const normalized = normalizeSseLine(line, preferred);
      const delta = JSON.parse(normalized.slice(6)).choices[0].delta;
      assert.equal(delta.reasoning_content, "思考");
      assert.ok(alias in delta);
      assert.equal(normalizeSseLine(normalized, preferred), normalized);
    }
  }
});

test("normalizeSseLine：已有 reasoning_content 时不覆盖；非 data 行与 [DONE] 原样透传", () => {
  const line = `data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: "keep", thinking: "x" } }] })}`;
  assert.equal(normalizeSseLine(line, "thinking"), line);
  assert.equal(normalizeSseLine(": heartbeat", "thinking"), ": heartbeat");
  assert.equal(normalizeSseLine("data: [DONE]", "thinking"), "data: [DONE]");
  assert.equal(normalizeSseLine("data: not-json", "thinking"), "data: not-json");
});

test("normalizeSseLine：合法工具/错误帧与未知畸形结构原样交给 SDK", () => {
  const values: unknown[] = [
    null, 1, "not a chunk", [], { choices: {} }, { choices: [null, 1, { delta: "bad" }] },
    { error: { message: "upstream failed" }, choices: [{ delta: { thinking: "keep error frame" } }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_a", function: { name: "getOutline", arguments: "{}" } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_a" }] } }] },
    { choices: [{ delta: { reasoning: { unknown: "invalid" } } }] },
  ];
  for (const value of values) {
    const line = `data:  ${JSON.stringify(value)}  `;
    assert.equal(normalizeSseLine(line, "reasoning"), line);
  }
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

function bytewiseFetch(bytes: Uint8Array): typeof fetch {
  return async () => new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    },
  }), { headers: { "content-type": "text/event-stream" } });
}

test("createReasoningNormalizingFetch：未改动 SSE 的 BOM/CRLF/注释/Unicode/末尾字节完全保留", async () => {
  const sse = '\uFEFF: heartbeat\r\nevent: message\r\nid: 12\r\ndata:  { "choices": [{ "delta": { "reasoning": "思考🧪" } }] } \r\n\r\ndata: [DONE]\r';
  const bytes = new TextEncoder().encode(sse);
  const res = await createReasoningNormalizingFetch("reasoning", bytewiseFetch(bytes))("https://fixture.invalid");
  assert.deepEqual(new Uint8Array(await res.arrayBuffer()), bytes);
});

test("createReasoningNormalizingFetch：任意 UTF-8/CRLF 分块后仍归一化，并保留行终止符", async () => {
  const sse = `data: ${JSON.stringify({ choices: [{ delta: { reasoning: { thinking: "思考🧪" } } }] })}\r\n\r\ndata: [DONE]\r\n\r\n`;
  const expected = `data: ${JSON.stringify({ choices: [{ delta: { reasoning: "思考🧪" } }] })}\r\n\r\ndata: [DONE]\r\n\r\n`;
  const res = await createReasoningNormalizingFetch("reasoning", bytewiseFetch(new TextEncoder().encode(sse)))("https://fixture.invalid");
  assert.equal(await res.text(), expected);
});

test("createReasoningNormalizingFetch：兼容单独 CR 与无行末终止符，不补造完成事件", async () => {
  const source = `data: ${JSON.stringify({ choices: [{ delta: { thinking: "a" } }] })}\r\rdata: ${JSON.stringify({ choices: [{ delta: { thinking: "b" } }] })}`;
  const expected = source.split("\r").map((line) => normalizeSseLine(line, "reasoning_content")).join("\r");
  const res = await createReasoningNormalizingFetch("reasoning_content", bytewiseFetch(new TextEncoder().encode(source)))("https://fixture.invalid");
  assert.equal(await res.text(), expected);
});

test("createReasoningNormalizingFetch：非法 UTF-8 数据字节不被解码替换或吞掉", async () => {
  const prefix = new TextEncoder().encode('data: {"choices":');
  const bytes = Uint8Array.from([...prefix, 0xff, 10, 10]);
  const res = await createReasoningNormalizingFetch("reasoning", bytewiseFetch(bytes))("https://fixture.invalid");
  assert.deepEqual(new Uint8Array(await res.arrayBuffer()), bytes);
});

test("createReasoningNormalizingFetch：默认配置归一非流式标准结构，不改正文和工具", async () => {
  const body = {
    choices: [{ message: {
      reasoning_content: [{ text: "主思考" }], reasoning: { thinking: "别名思考" }, content: "答案",
      tool_calls: [{ id: "call_a", type: "function", function: { name: "getOutline", arguments: "{}" } }],
    } }],
  };
  const baseFetch: typeof fetch = async () => new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "content-length": "999", "content-encoding": "gzip" },
  });
  const res = await createReasoningNormalizingFetch(undefined, baseFetch)("https://fixture.invalid");
  const json = await res.json();
  assert.equal(json.choices[0].message.reasoning_content, "主思考");
  assert.equal(json.choices[0].message.reasoning, "别名思考");
  assert.equal(json.choices[0].message.content, "答案");
  assert.deepEqual(json.choices[0].message.tool_calls, body.choices[0].message.tool_calls);
  assert.equal(res.headers.get("content-length"), null);
  assert.equal(res.headers.get("content-encoding"), null);
});

test("createReasoningNormalizingFetch：正常非流式 JSON 保留空白与键顺序；HTTP 错误不变", async () => {
  const body = ' { "choices" : [ { "message" : { "reasoning" : "keep", "content" : "answer" } } ] }\n';
  const baseFetch: typeof fetch = async () => new Response(body, { headers: { "content-type": "application/json" } });
  const res = await createReasoningNormalizingFetch("reasoning", baseFetch)("https://fixture.invalid");
  assert.equal(await res.text(), body);
  const error = new Response('{"error":{"message":"not authorized"}}', { status: 401, headers: { "content-type": "application/json" } });
  const errorFetch: typeof fetch = async () => error;
  assert.equal(await createReasoningNormalizingFetch("reasoning", errorFetch)("https://fixture.invalid"), error);
});
