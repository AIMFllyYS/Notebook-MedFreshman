import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime } from "@/lib/ai/agent/tools/_shared";
import { createWebSearchTool, webSearchIo } from "./tool.ts";
import type { WebSearchOutput } from "./types.ts";
import type { WebSearchDetailed } from "@/lib/ai/webSearch.ts";
import type { SearchProgressEvent } from "@/lib/ai/search/types.ts";

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

interface DrainResult {
  preliminary: WebSearchOutput[];
  final: WebSearchOutput;
}

/** execute 是 async generator：逐个 yield 是 preliminary，最后一个会被 SDK 再发一次作为 final。 */
async function drain(execute: unknown, input: Record<string, unknown>): Promise<DrainResult> {
  const iterable = (execute as (i: unknown, o: unknown) => AsyncGenerator<WebSearchOutput>)(input, execOpts);
  const preliminary: WebSearchOutput[] = [];
  let final: WebSearchOutput | undefined;
  for await (const output of iterable) {
    preliminary.push(output);
    final = output;
  }
  assert.ok(final, "生成器至少要产出最终输出");
  return { preliminary: preliminary.slice(0, -1), final };
}

test("webSearch：把详细结果与来源回灌，并按 query 去重", async (t) => {
  t.mock.method(webSearchIo, "runWebSearchDetailed", async (query: string, n: number) => ({
    content: `命中「${query}」×${n}`,
    sources: [{ title: "来源", url: "https://example.test", snippet: "摘要" }],
    cacheHit: false,
  }));
  const runtime = createToolRuntime();
  const tool = createWebSearchTool(runtime);
  const first = await drain(tool.execute, { query: "核糖体", numResults: 3 });
  const second = await drain(tool.execute, { query: "核糖体" });
  assert.match(first.final.text, /核糖体/);
  assert.match(first.final.text, /【引用编号】/);
  assert.equal(first.final.sources[0]?.url, "https://example.test");
  assert.equal(first.final.sources[0]?.citeIndex, 1);
  assert.equal(second.final.deduped, true);
  assert.equal(second.final.sources[0]?.citeIndex, undefined);
});

test("webSearch：未配置时原样回传提示", async (t) => {
  t.mock.method(webSearchIo, "runWebSearchDetailed", async () => ({
    content: "联网搜索未配置（请在设置中填写智谱搜索凭证，或由站点配置 ZHIPU_API_KEY）。",
    sources: [],
    cacheHit: false,
  }));
  const result = await drain(createWebSearchTool(createToolRuntime()).execute, { query: "x" });
  assert.match(result.final.text, /未配置/);
  assert.equal(result.final.sources.length, 0);
});

test("webSearch：进度事件流转成 preliminary 输出（stage + 各源状态）", async (t) => {
  t.mock.method(
    webSearchIo,
    "runWebSearchDetailed",
    async (_query: string, _n: number, opts?: { onProgress?: (e: SearchProgressEvent) => void }): Promise<WebSearchDetailed> => {
      const emit = opts?.onProgress ?? (() => {});
      emit({ stage: "planned", planned: ["kimi", "zhipu"] });
      emit({ stage: "provider", provider: "zhipu", providerState: "ok", resultCount: 5 });
      emit({ stage: "provider", provider: "kimi", providerState: "error", error: "搜索超时" });
      emit({ stage: "synthesizing" });
      emit({ stage: "done", sourcesKept: 5 });
      return {
        content: "正文",
        sources: [{ title: "A", url: "https://a.test", snippet: "s" }],
        cacheHit: false,
        omittedSources: 12,
      };
    },
  );
  const { preliminary, final } = await drain(createWebSearchTool(createToolRuntime()).execute, { query: "进度" });

  // planning（入口必发）+ planned + 2×provider + synthesizing = 5 条 preliminary；done 不单独发。
  assert.equal(preliminary.length, 5);
  assert.equal(preliminary[0]?.progress?.stage, "planning");
  const searching = preliminary[1]?.progress;
  assert.equal(searching?.stage, "searching");
  assert.deepEqual(
    searching?.providers.map((p) => [p.id, p.state]),
    [["kimi", "pending"], ["zhipu", "pending"]],
  );
  const afterBoth = preliminary[3]?.progress;
  assert.deepEqual(
    afterBoth?.providers.map((p) => [p.id, p.state, p.count]),
    [["kimi", "error", 0], ["zhipu", "done", 5]],
  );
  assert.equal(preliminary[4]?.progress?.stage, "synthesizing");

  assert.equal(final.progress?.stage, "done");
  assert.equal(final.omittedSources, 12);
  assert.equal(final.sources[0]?.citeIndex, 1);
});

test("webSearch：上游异常也不悬挂，落成失败文本", async (t) => {
  t.mock.method(webSearchIo, "runWebSearchDetailed", async () => {
    throw new Error("boom");
  });
  const { final } = await drain(createWebSearchTool(createToolRuntime()).execute, { query: "x" });
  assert.match(final.text, /联网搜索执行失败：boom/);
});
