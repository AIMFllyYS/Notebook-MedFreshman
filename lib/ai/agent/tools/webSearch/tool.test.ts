import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime } from "@/lib/ai/agent/tools/_shared";
import { createWebSearchTool, webSearchIo } from "./tool.ts";
import type { WebSearchOutput } from "./types.ts";

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("webSearch：把详细结果与来源回灌，并按 query 去重", async (t) => {
  t.mock.method(webSearchIo, "runWebSearchDetailed", async (query: string, n: number) => ({
    content: `命中「${query}」×${n}`,
    sources: [{ title: "来源", url: "https://example.test", snippet: "摘要" }],
    cacheHit: false,
  }));
  const runtime = createToolRuntime();
  const tool = createWebSearchTool(runtime);
  const first = (await tool.execute!({ query: "核糖体", numResults: 3 }, execOpts)) as WebSearchOutput;
  const second = (await tool.execute!({ query: "核糖体" }, execOpts)) as WebSearchOutput;
  assert.match(first.text, /核糖体/);
  assert.equal(first.sources[0]?.url, "https://example.test");
  assert.equal(second.deduped, true);
});

test("webSearch：未配置时原样回传提示", async (t) => {
  t.mock.method(webSearchIo, "runWebSearchDetailed", async () => ({
    content: "联网搜索未配置（请在设置中填写智谱搜索凭证，或由站点配置 ZHIPU_API_KEY）。",
    sources: [],
    cacheHit: false,
  }));
  const result = (await createWebSearchTool(createToolRuntime()).execute!({ query: "x" }, execOpts)) as WebSearchOutput;
  assert.match(result.text, /未配置/);
  assert.equal(result.sources.length, 0);
});
