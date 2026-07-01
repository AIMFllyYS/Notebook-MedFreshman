import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildAnthropicRequest,
  anthropicStreamToOpenAI,
} from "./anthropicAdapter.ts";

// ────────────────────────────────────────────────────────────────
// buildAnthropicRequest
// ────────────────────────────────────────────────────────────────

test("buildAnthropicRequest：baseUrl 不带 /v1 时自动补齐路径", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://api.anthropic.com",
    apiKey: "sk-a",
    openaiBody: { model: "claude", messages: [] },
  });
  assert.equal(req.url, "https://api.anthropic.com/v1/messages");
});

test("buildAnthropicRequest：baseUrl 已含 /v1 时只加 /messages", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://api.anthropic.com/v1",
    apiKey: "sk-a",
    openaiBody: { model: "claude", messages: [] },
  });
  assert.equal(req.url, "https://api.anthropic.com/v1/messages");
});

test("buildAnthropicRequest：设置 x-api-key 与 anthropic-version 头", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://api.anthropic.com",
    apiKey: "sk-secret",
    openaiBody: { model: "claude", messages: [] },
  });
  assert.equal(req.headers["x-api-key"], "sk-secret");
  assert.equal(req.headers["anthropic-version"], "2023-06-01");
  assert.equal(req.headers.Authorization, "Bearer sk-secret");
});

test("buildAnthropicRequest：thinking enabled 时加 anthropic-beta 头", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://api.anthropic.com",
    apiKey: "sk",
    openaiBody: {
      model: "claude",
      messages: [],
      thinking: { type: "enabled", budget_tokens: 10000 },
    },
  });
  assert.ok(req.headers["anthropic-beta"]);
  const body = JSON.parse(req.body);
  assert.deepEqual(body.thinking, {
    type: "enabled",
    budget_tokens: 10000,
  });
  assert.equal(body.temperature, 1);
  assert.ok(body.max_tokens >= 16000);
});

test("buildAnthropicRequest：抽取 system 到顶层", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://x/v1",
    apiKey: "sk",
    openaiBody: {
      model: "claude",
      messages: [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "hi" },
      ],
    },
  });
  const body = JSON.parse(req.body);
  assert.equal(body.system, "You are helpful.");
  assert.equal(body.messages.length, 1);
  assert.equal(body.messages[0].role, "user");
});

test("buildAnthropicRequest：图片 image_url 转 base64/url block", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://x/v1",
    apiKey: "sk",
    openaiBody: {
      model: "claude",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "描述一下" },
            {
              type: "image_url",
              image_url: {
                url: "data:image/png;base64,AAAA",
              },
            },
            {
              type: "image_url",
              image_url: { url: "https://cdn.example/pic.jpg" },
            },
          ],
        },
      ],
    },
  });
  const body = JSON.parse(req.body);
  const parts = body.messages[0].content;
  assert.equal(parts[0].type, "text");
  assert.equal(parts[1].type, "image");
  assert.deepEqual(parts[1].source, {
    type: "base64",
    media_type: "image/png",
    data: "AAAA",
  });
  assert.equal(parts[2].type, "image");
  assert.deepEqual(parts[2].source, {
    type: "url",
    url: "https://cdn.example/pic.jpg",
  });
});

test("buildAnthropicRequest：tool 定义 → input_schema", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://x/v1",
    apiKey: "sk",
    openaiBody: {
      model: "claude",
      messages: [{ role: "user", content: "hi" }],
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description: "搜索",
            parameters: {
              type: "object",
              properties: { q: { type: "string" } },
            },
          },
        },
      ],
      tool_choice: "auto",
    },
  });
  const body = JSON.parse(req.body);
  assert.equal(body.tools.length, 1);
  assert.equal(body.tools[0].name, "webSearch");
  assert.deepEqual(body.tools[0].input_schema, {
    type: "object",
    properties: { q: { type: "string" } },
  });
  assert.deepEqual(body.tool_choice, { type: "auto" });
});

test("buildAnthropicRequest：tool 消息 → user + tool_result", () => {
  const req = buildAnthropicRequest({
    baseUrl: "https://x/v1",
    apiKey: "sk",
    openaiBody: {
      model: "claude",
      messages: [
        { role: "user", content: "查一下天气" },
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "toolu_1",
              type: "function",
              function: {
                name: "webSearch",
                arguments: '{"q":"北京"}',
              },
            },
          ],
        },
        {
          role: "tool",
          tool_call_id: "toolu_1",
          content: "北京 25°C",
        },
      ],
    },
  });
  const body = JSON.parse(req.body);
  const [userMsg, assistantMsg, toolResultMsg] = body.messages;
  assert.equal(userMsg.role, "user");
  assert.equal(assistantMsg.role, "assistant");
  assert.equal(assistantMsg.content[0].type, "tool_use");
  assert.equal(assistantMsg.content[0].id, "toolu_1");
  assert.equal(assistantMsg.content[0].name, "webSearch");
  assert.deepEqual(assistantMsg.content[0].input, { q: "北京" });
  assert.equal(toolResultMsg.role, "user");
  assert.equal(toolResultMsg.content[0].type, "tool_result");
  assert.equal(toolResultMsg.content[0].tool_use_id, "toolu_1");
  assert.equal(toolResultMsg.content[0].content, "北京 25°C");
});

// ────────────────────────────────────────────────────────────────
// anthropicStreamToOpenAI
// ────────────────────────────────────────────────────────────────

function makeSseInput(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const e of events) controller.enqueue(encoder.encode(e));
      controller.close();
    },
  });
}

async function collectSse(stream: ReadableStream<Uint8Array>): Promise<
  Array<Record<string, unknown>>
> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let buf = "";
  const out: Array<Record<string, unknown>> = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
  }
  for (const line of buf.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("data:")) continue;
    const data = t.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      out.push(JSON.parse(data));
    } catch {
      /* ignore */
    }
  }
  return out;
}

test("anthropicStreamToOpenAI：text_delta → content", async () => {
  const events = [
    `data: ${JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 3, output_tokens: 0 } } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_start", index: 0, content_block: { type: "text" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Hello" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: " world" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`,
    `data: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 5 } })}\n\n`,
    `data: ${JSON.stringify({ type: "message_stop" })}\n\n`,
  ];
  const chunks = await collectSse(anthropicStreamToOpenAI(makeSseInput(events)));
  const contents = chunks.flatMap((c) => {
    const choices = c.choices as Array<{ delta?: { content?: string } }> | undefined;
    return choices?.[0]?.delta?.content ? [choices[0].delta!.content!] : [];
  });
  assert.deepEqual(contents, ["Hello", " world"]);
  const finish = chunks.find((c) => {
    const choices = c.choices as Array<{ finish_reason?: string }> | undefined;
    return choices?.[0]?.finish_reason;
  });
  assert.ok(finish);
  const usage = chunks.find((c) => c.usage) as { usage: Record<string, number> } | undefined;
  assert.ok(usage);
  assert.equal(usage!.usage.prompt_tokens, 3);
  assert.equal(usage!.usage.completion_tokens, 5);
});

test("anthropicStreamToOpenAI：thinking_delta → reasoning", async () => {
  const events = [
    `data: ${JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 1, output_tokens: 0 } } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_start", index: 0, content_block: { type: "thinking" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Let me think" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_start", index: 1, content_block: { type: "text" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Answer" } })}\n\n`,
    `data: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 2 } })}\n\n`,
    `data: ${JSON.stringify({ type: "message_stop" })}\n\n`,
  ];
  const chunks = await collectSse(anthropicStreamToOpenAI(makeSseInput(events)));
  const reasonings = chunks.flatMap((c) => {
    const choices = c.choices as Array<{ delta?: { reasoning?: string } }> | undefined;
    return choices?.[0]?.delta?.reasoning ? [choices[0].delta!.reasoning!] : [];
  });
  const contents = chunks.flatMap((c) => {
    const choices = c.choices as Array<{ delta?: { content?: string } }> | undefined;
    return choices?.[0]?.delta?.content ? [choices[0].delta!.content!] : [];
  });
  assert.deepEqual(reasonings, ["Let me think"]);
  assert.deepEqual(contents, ["Answer"]);
});

test("anthropicStreamToOpenAI：tool_use + input_json_delta → tool_calls", async () => {
  const events = [
    `data: ${JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 1, output_tokens: 0 } } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_start", index: 0, content_block: { type: "tool_use", id: "toolu_ABC", name: "webSearch" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: "{\"q\":" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: "\"hi\"}" } })}\n\n`,
    `data: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`,
    `data: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: "tool_use" }, usage: { output_tokens: 3 } })}\n\n`,
    `data: ${JSON.stringify({ type: "message_stop" })}\n\n`,
  ];
  const chunks = await collectSse(anthropicStreamToOpenAI(makeSseInput(events)));
  // 找出所有含 tool_calls 的 chunk
  const toolCallChunks = chunks.filter((c) => {
    const choices = c.choices as Array<{ delta?: { tool_calls?: unknown[] } }> | undefined;
    return choices?.[0]?.delta?.tool_calls;
  });
  assert.ok(toolCallChunks.length >= 3);

  // 第一个 chunk 有 id + name
  const first = (toolCallChunks[0].choices as Array<{ delta: { tool_calls: Array<Record<string, unknown>> } }>)[0]
    .delta.tool_calls[0];
  assert.equal(first.id, "toolu_ABC");
  const firstFn = first.function as { name?: string };
  assert.equal(firstFn.name, "webSearch");

  // 拼接所有 arguments
  const combinedArgs = toolCallChunks
    .map((c) => {
      const call = (c.choices as Array<{ delta: { tool_calls: Array<Record<string, unknown>> } }>)[0]
        .delta.tool_calls[0];
      const fn = call.function as { arguments?: string } | undefined;
      return fn?.arguments ?? "";
    })
    .join("");
  assert.equal(JSON.parse(combinedArgs).q, "hi");

  // finish_reason=tool_calls
  const finish = chunks.find((c) => {
    const choices = c.choices as Array<{ finish_reason?: string }> | undefined;
    return choices?.[0]?.finish_reason;
  });
  assert.equal(
    (finish!.choices as Array<{ finish_reason: string }>)[0].finish_reason,
    "tool_calls",
  );
});
