import assert from "node:assert/strict";
import { test } from "node:test";
import { IMAGE_SEARCH_MAX_TOTAL, createToolRuntime } from "@/lib/ai/agent/tools/_shared";
import { createImageSearchTool, imageSearchIo } from "./tool.ts";
import type { ImageSearchOutput } from "./types.ts";

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

function photos(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    url: `https://images.unsplash.com/p${i}`,
    thumbnail: `https://images.unsplash.com/t${i}`,
    author: `A${i}`,
    source: `https://unsplash.com/@a${i}`,
    alt: `alt${i}`,
    downloadLocation: "",
  }));
}

test("imageSearch 文案是单次请求/本次回答，不是本次对话", () => {
  const tool = createImageSearchTool(createToolRuntime());
  assert.match(String(tool.description), /单次请求（本次回答）/);
  assert.doesNotMatch(String(tool.description), /本次对话/);
});

test("imageSearch：顺序调用累加到上限后不再抓取", async (t) => {
  let fetches = 0;
  t.mock.method(imageSearchIo, "searchImages", async (_q: string, n: number) => {
    fetches += 1;
    return { configured: true, results: photos(n), usedPlatformCredentials: false };
  });
  const runtime = createToolRuntime();
  const tool = createImageSearchTool(runtime);
  for (let i = 0; i < 5; i++) {
    const result = (await tool.execute!({ query: `q${i}`, numResults: 4 }, execOpts)) as ImageSearchOutput;
    assert.equal(result.limitReached, undefined);
  }
  assert.equal(runtime.imageSearchFetchedCount, 20);
  assert.equal(fetches, 5);
  const blocked = (await tool.execute!({ query: "overflow", numResults: 4 }, execOpts)) as ImageSearchOutput;
  assert.equal(blocked.limitReached, true);
  assert.match(blocked.text, /本次回答上限/);
  assert.doesNotMatch(blocked.text, /本次对话/);
  assert.equal(fetches, 5);
});

test("imageSearch：同一步并行多次可超过 20（计数在 execute 之后才涨）", async (t) => {
  t.mock.method(imageSearchIo, "searchImages", async (_q: string, n: number) => ({
    configured: true,
    results: photos(n),
    usedPlatformCredentials: false,
  }));
  const runtime = createToolRuntime();
  const tool = createImageSearchTool(runtime);
  const results = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      tool.execute!({ query: `p${i}`, numResults: 4 }, { ...execOpts, toolCallId: `t${i}` }) as Promise<ImageSearchOutput>,
    ),
  );
  assert.equal(results.filter((r) => r.limitReached).length, 0);
  assert.ok(
    runtime.imageSearchFetchedCount > IMAGE_SEARCH_MAX_TOTAL,
    `并行后计数 ${runtime.imageSearchFetchedCount} 应超过 ${IMAGE_SEARCH_MAX_TOTAL}`,
  );
});

test("imageSearch：未配置时把配额记满且不伪装成没搜到", async (t) => {
  t.mock.method(imageSearchIo, "searchImages", async () => ({
    configured: false,
    results: [],
    usedPlatformCredentials: false,
  }));
  const runtime = createToolRuntime();
  const tool = createImageSearchTool(runtime);
  const result = (await tool.execute!({ query: "线粒体" }, execOpts)) as ImageSearchOutput;
  assert.equal(result.unconfigured, true);
  assert.match(result.text, /未配置/);
  assert.equal(runtime.imageSearchFetchedCount, IMAGE_SEARCH_MAX_TOTAL);
});

test("imageSearch：空结果不涨配额；相同 query 二次调用按 contextKey 去重", async (t) => {
  t.mock.method(imageSearchIo, "searchImages", async (query: string) => {
    if (query === "empty") return { configured: true, results: [], usedPlatformCredentials: false };
    return { configured: true, results: photos(2), usedPlatformCredentials: false };
  });
  const runtime = createToolRuntime();
  const tool = createImageSearchTool(runtime);
  const miss = (await tool.execute!({ query: "empty" }, execOpts)) as ImageSearchOutput;
  assert.match(miss.text, /未找到/);
  assert.equal(runtime.imageSearchFetchedCount, 0);

  const first = (await tool.execute!({ query: "肝小叶" }, execOpts)) as ImageSearchOutput;
  const second = (await tool.execute!({ query: "肝小叶" }, execOpts)) as ImageSearchOutput;
  assert.equal(first.deduped, undefined);
  assert.equal(second.deduped, true);
  assert.match(second.text, /上下文已加载/);
  assert.match(first.text, /本次回答已累计抓取 2\/20/);
});
