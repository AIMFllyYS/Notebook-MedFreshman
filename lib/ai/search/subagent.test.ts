import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { dedupeItems, runSearchSubagent } from "./subagent.ts";
import type { SearchItem } from "./types.ts";

const saved = new Map<string, string | undefined>();
const KEYS = ["ZHIPU_API_KEY", "KIMI_API_KEY", "PERPLEXITY_API_KEY", "AI_FAST_BASE_URL", "AI_FAST_API_KEY", "AI_FAST_MODEL", "QINIU_BASE_URL", "QINIU_API_KEY", "KIMI_SEARCH_MODEL"] as const;

function setEnv(patch: Partial<Record<(typeof KEYS)[number], string | undefined>>) {
  for (const key of KEYS) {
    if (!saved.has(key)) saved.set(key, process.env[key]);
    const value = (key in patch) ? patch[key] : undefined;
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

beforeEach(() => saved.clear());
afterEach(() => {
  for (const [key, value] of saved) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  saved.clear();
});

interface MockState { urls: string[]; bodies: Record<string, unknown>[]; maxInFlight: number; inFlight: number }

/** 装一个会统计并发数的 fetch mock：每个请求都真的"在飞"一会儿。 */
function installFetch(
  t: { mock: { method: (obj: unknown, name: string, fn: unknown) => unknown } },
  handler: (url: string, body: Record<string, unknown>, state: MockState) => Response,
): MockState {
  const state: MockState = { urls: [], bodies: [], maxInFlight: 0, inFlight: 0 };
  t.mock.method(globalThis, "fetch", async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    state.urls.push(url);
    state.inFlight += 1;
    state.maxInFlight = Math.max(state.maxInFlight, state.inFlight);
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(String(init?.body)); } catch { body = {}; }
    state.bodies.push(body);
    await new Promise((resolve) => setTimeout(resolve, 30));
    const response = handler(url, body, state);
    state.inFlight -= 1;
    return response;
  });
  return state;
}

const ZHIPU_OK = { search_result: [{ title: "细胞结构", link: "https://example.test/cell", content: "细胞是基本单位", media: "科普" }] };
const PPLX_OK = {
  id: "s1",
  results: [
    { title: "细胞结构", url: "https://example.test/cell", snippet: "更长一点的细胞说明", last_updated: "2026-09-01" },
    { title: "另一篇", url: "https://example.test/other", snippet: "另一篇内容" },
  ],
};
const FAST_OK = { choices: [{ message: { content: "要点一 [1]；要点二 [2]" } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } };

function kimiRoundOne(id = "t-web_search-1") {
  return {
    choices: [{
      finish_reason: "tool_calls",
      message: {
        role: "assistant",
        content: "",
        tool_calls: [{
          id,
          type: "builtin_function",
          function: { name: "$web_search", arguments: JSON.stringify({ search_result: { search_id: "abc" }, usage: { total_tokens: 9000 } }) },
        }],
      },
    }],
  };
}
const KIMI_ROUND_TWO = {
  choices: [{ finish_reason: "stop", message: { role: "assistant", content: "2025 年诺贝尔物理学奖由三位科学家获得。参考 https://nobelprize.org/x" } }],
};

describe("dedupeItems：来源清单恒定按权威性排", () => {
  test("Perplexity > Kimi > 智谱，且同 URL 只留一条", () => {
    const items: SearchItem[] = [
      { title: "z", url: "https://a.test/z", snippet: "智谱的", provider: "zhipu" },
      { title: "k", url: "https://a.test/k", snippet: "Kimi 的", provider: "kimi" },
      { title: "p", url: "https://a.test/p", snippet: "Perplexity 的", provider: "perplexity" },
      { title: "z2", url: "https://a.test/z", snippet: "智谱的重复项，更长的 snippet 说明", provider: "zhipu" },
    ];
    const merged = dedupeItems(items, "daily");
    assert.deepEqual(merged.map((item) => item.provider), ["perplexity", "kimi", "zhipu"]);
    assert.equal(merged.length, 3, "同 URL 只留一条");
    assert.match(merged[2]!.snippet, /更长的 snippet/, "同 URL 保留信息量更大的那条");
  });
});

describe("搜索子智能体", () => {
  test("comprehensive：三家并行扇出（并发数=3），并跨源去重", async (t) => {
    setEnv({
      ZHIPU_API_KEY: "z-key", KIMI_API_KEY: "k-key", PERPLEXITY_API_KEY: "p-key",
      AI_FAST_BASE_URL: "https://fast.test/v1", AI_FAST_API_KEY: "f-key", AI_FAST_MODEL: "mini",
    });
    let kimiCalls = 0;
    const state = installFetch(t, (url) => {
      if (url.includes("bigmodel.cn")) return Response.json(ZHIPU_OK);
      if (url.includes("perplexity.ai/search")) return Response.json(PPLX_OK);
      if (url.includes("moonshot.cn")) {
        kimiCalls += 1;
        return Response.json(kimiCalls === 1 ? kimiRoundOne() : KIMI_ROUND_TWO);
      }
      if (url.includes("fast.test")) return Response.json(FAST_OK);
      throw new Error("unexpected fetch " + url);
    });

    const bundle = await runSearchSubagent({ query: "细胞结构研究", mode: "comprehensive", count: 3 });

    assert.equal(state.maxInFlight, 3, "三家必须并行发出");
    assert.deepEqual([...bundle.used].sort(), ["kimi", "perplexity", "zhipu"]);
    // example.test/cell 在智谱与 Perplexity 都出现 → 只留一条；加上 other 共 2 条。
    assert.equal(bundle.sources.length, 2, JSON.stringify(bundle.sources.map((s) => s.url)));
    assert.equal(bundle.synthesized, true, "两家以上出结果要做跨源综述");
    assert.match(bundle.text, /要点一/);
    assert.match(bundle.text, /Kimi 的检索结论/);
    assert.match(bundle.text, /来源清单/);
  });

  test("Kimi 的回灌必须把 tool_call 的 type 改成 function（否则上游 400）", async (t) => {
    setEnv({ KIMI_API_KEY: "k-key" });
    let kimiCalls = 0;
    const state = installFetch(t, (url) => {
      if (!url.includes("moonshot.cn")) throw new Error("unexpected " + url);
      kimiCalls += 1;
      return Response.json(kimiCalls === 1 ? kimiRoundOne() : KIMI_ROUND_TWO);
    });

    const bundle = await runSearchSubagent({ query: "2025 诺奖", mode: "daily" });
    assert.equal(kimiCalls, 2, "一次搜索 + 一次作答");
    const second = state.bodies[1] as { messages?: { role?: string; tool_calls?: { type?: string }[] }[] };
    const assistant = (second.messages ?? []).find((m) => m.role === "assistant");
    assert.equal(assistant?.tool_calls?.[0]?.type, "function");
    assert.match(bundle.text, /2025 年诺贝尔物理学奖/, "Kimi 的结论要进正文");
    assert.equal(bundle.synthesized, false, "只有一家可用时不做综述");
  });

  test("Perplexity /search 失败时退到 sonar，仍能拿到成文与引用", async (t) => {
    setEnv({ PERPLEXITY_API_KEY: "p-key" });
    installFetch(t, (url) => {
      if (url.endsWith("/search")) return new Response("nope", { status: 500 });
      if (url.includes("/chat/completions")) {
        return Response.json({
          choices: [{ message: { content: "sonar 的结论 [1]" } }],
          citations: ["https://example.test/a"],
          search_results: [{ title: "A", url: "https://example.test/a", snippet: "snip" }],
        });
      }
      throw new Error("unexpected " + url);
    });

    const bundle = await runSearchSubagent({ query: "研究数据", mode: "academic" });
    assert.equal(bundle.used.includes("perplexity"), true);
    assert.match(bundle.text, /sonar 的结论/);
    assert.equal(bundle.sources[0]?.url, "https://example.test/a");
  });

  test("同一个 query 第二次命中缓存（不打上游）", async (t) => {
    setEnv({ ZHIPU_API_KEY: "z-key" });
    const state = installFetch(t, () => Response.json(ZHIPU_OK));
    const query = "缓存命中的问题 " + Date.now();

    const first = await runSearchSubagent({ query, mode: "daily" });
    assert.equal(first.cacheHit, false);
    const fetchesAfterFirst = state.urls.length;

    const second = await runSearchSubagent({ query, mode: "daily" });
    assert.equal(second.cacheHit, true, "同一个 query 第二次必须命中缓存");
    assert.equal(state.urls.length, fetchesAfterFirst, "缓存命中不该再打上游");
  });

  test("一家 key 都没有 → 明确说明未配置，不抛错", async () => {
    setEnv({});
    const bundle = await runSearchSubagent({ query: "任意问题", mode: "auto" });
    assert.match(bundle.text, /未配置/);
    assert.deepEqual(bundle.used, []);
    assert.equal(bundle.cacheHit, false);
  });

  test("显式点名只搜指定的源", async (t) => {
    setEnv({ ZHIPU_API_KEY: "z-key", KIMI_API_KEY: "k-key", PERPLEXITY_API_KEY: "p-key" });
    const state = installFetch(t, (url) => {
      if (url.includes("bigmodel.cn")) return Response.json(ZHIPU_OK);
      throw new Error("不该调用 " + url);
    });
    const bundle = await runSearchSubagent({ query: "只要智谱 " + Date.now(), mode: "auto", providers: ["zhipu"] });
    assert.equal(state.urls.length, 1);
    assert.deepEqual(bundle.used, ["zhipu"]);
  });
});
