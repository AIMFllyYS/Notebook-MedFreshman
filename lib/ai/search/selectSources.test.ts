import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  domainOf,
  estimateTokens,
  selectSources,
  SEARCH_MAX_SOURCES,
} from "./selectSources.ts";
import { dedupeItems } from "./subagent.ts";
import type { SearchItem } from "./types.ts";

function item(partial: Partial<SearchItem> & { url: string }): SearchItem {
  return { title: "", snippet: "", provider: "zhipu", ...partial };
}

describe("estimateTokens：粗略但有界", () => {
  test("CJK 一字一 token，拉丁 ~4 字符一 token", () => {
    assert.equal(estimateTokens("细胞结构"), 4);
    assert.equal(estimateTokens("abcdefgh"), 2);
    assert.ok(estimateTokens("细胞 abcd") >= 4 && estimateTokens("细胞 abcd") <= 6);
    assert.equal(estimateTokens(""), 0);
  });
});

describe("domainOf：注册域口径", () => {
  test("子域名归并到注册域", () => {
    assert.equal(domainOf("https://www.zhihu.com/a"), "zhihu.com");
    assert.equal(domainOf("https://zhuanlan.zhihu.com/p/1"), "zhihu.com");
    assert.equal(domainOf("https://m.bbc.co.uk/news/1"), "bbc.co.uk");
    assert.equal(domainOf("not-a-url"), "");
  });
});

describe("selectSources：精选管线", () => {
  test("数量硬上限：超出截断并计入 omitted/budgetLimited", () => {
    const items: SearchItem[] = Array.from({ length: 50 }, (_, i) =>
      item({ url: `https://d${i}.test/${i}`, title: `条目${i}`, snippet: "细胞" }));
    const r = selectSources(items, "细胞", { maxSources: 10 });
    assert.equal(r.kept, 10);
    assert.equal(r.omitted, 40);
    assert.equal(r.budgetLimited, 40);
  });

  test("默认上限是 SEARCH_MAX_SOURCES", () => {
    const items: SearchItem[] = Array.from({ length: 60 }, (_, i) =>
      item({ url: `https://d${i}.test/x`, title: `t${i}` }));
    const r = selectSources(items, "q");
    assert.equal(r.kept, SEARCH_MAX_SOURCES);
  });

  test("域名限流：同一域最多 maxPerDomain 条", () => {
    const items: SearchItem[] = [
      item({ url: "https://a.test/1", title: "a1" }),
      item({ url: "https://a.test/2", title: "a2" }),
      item({ url: "https://sub.a.test/3", title: "a3" }),
      item({ url: "https://a.test/4", title: "a4 会被限流" }),
      item({ url: "https://b.test/1", title: "b1" }),
    ];
    const r = selectSources(items, "q", { maxPerDomain: 3 });
    // a.test 只留 3 条（子域归并同域），第 4 条被刷
    assert.equal(r.kept, 4);
    assert.equal(r.domainLimited, 1);
    assert.ok(!r.sources.some((s) => s.title === "a4 会被限流"));
  });

  test("标题冗余合并：同稿多源只留一条", () => {
    const items: SearchItem[] = [
      item({ url: "https://a.test/x", title: "同一篇 报道！", provider: "zhipu" }),
      item({ url: "https://b.test/y", title: "同一篇报道", provider: "perplexity" }),
    ];
    const r = selectSources(items, "q");
    assert.equal(r.afterDedupe, 1);
    assert.equal(r.kept, 1);
    // 权威档更高的 perplexity 胜出
    assert.equal(r.sources[0]?.provider, "perplexity");
  });

  test("相关度排序：命中 query 词的排前面，权威档兜底", () => {
    const items: SearchItem[] = [
      item({ url: "https://a.test/1", title: "无关内容", snippet: "无关", provider: "perplexity" }),
      item({ url: "https://b.test/2", title: "细胞结构详解", snippet: "细胞是基本单位", provider: "zhipu" }),
    ];
    const r = selectSources(items, "细胞结构");
    assert.equal(r.sources[0]?.title, "细胞结构详解");
  });

  test("snippet 超预算被截断并加省略号", () => {
    const items = [item({ url: "https://a.test/1", snippet: "x".repeat(1000) })];
    const r = selectSources(items, "q", { snippetMaxChars: 100 });
    assert.equal(r.sources[0]?.snippet.length, 101);
    assert.ok(r.sources[0]!.snippet.endsWith("…"));
  });

  test("总 token 预算：超了就不再加，但至少留一条", () => {
    // 每条 ~800 字摘要 ≈ 800+ token；预算 900 只放得下一条。
    const items: SearchItem[] = [
      item({ url: "https://a.test/1", snippet: "细".repeat(800) }),
      item({ url: "https://b.test/2", snippet: "胞".repeat(800) }),
      item({ url: "https://c.test/3", snippet: "核".repeat(800) }),
    ];
    const r = selectSources(items, "q", { snippetMaxChars: 800, tokenBudget: 900 });
    assert.equal(r.kept, 1);
    assert.equal(r.budgetLimited, 2);
    assert.ok(r.estimatedTokens <= 900);
  });

  test("空清单与全过滤都不会产出负统计", () => {
    const r = selectSources([], "q");
    assert.deepEqual(
      [r.kept, r.omitted, r.afterDedupe, r.estimatedTokens],
      [0, 0, 0, 0],
    );
  });

  test("接在 dedupeItems 后：URL 去重 → 标题去重 → 限流全链跑通", () => {
    const raw: SearchItem[] = [
      item({ url: "https://a.test/same", title: "同URL-智谱短", snippet: "短", provider: "zhipu" }),
      item({ url: "https://a.test/same", title: "同URL-pplx长", snippet: "更长一点的摘要", provider: "perplexity" }),
      item({ url: "https://b.test/other", title: "同URL-pplx长", provider: "kimi" }), // 标题撞车 → 合并
    ];
    const merged = dedupeItems(raw, "daily");
    assert.equal(merged.length, 2, "URL 去重后剩 2 条");
    const r = selectSources(merged, "q");
    assert.equal(r.kept, 1, "标题级再去重只剩 1 条");
    assert.equal(r.omitted, 0);
  });
});
