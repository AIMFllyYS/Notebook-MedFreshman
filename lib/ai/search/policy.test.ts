import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  AUTHORITY_RANK,
  COST_RANK,
  DEFAULT_PRIORITY,
  looksAcademic,
  looksDaily,
  orderForMode,
  planSearchProviders,
} from "./policy.ts";
import type { SearchProviderId } from "./types.ts";

const ALL: SearchProviderId[] = ["kimi", "zhipu", "perplexity"];

describe("搜索策略的三条排序口径", () => {
  test("默认优先级 Kimi > 智谱 > Perplexity", () => {
    assert.deepEqual([...DEFAULT_PRIORITY], ["kimi", "zhipu", "perplexity"]);
  });
  test("权威性 Perplexity > Kimi > 智谱", () => {
    assert.ok(AUTHORITY_RANK.perplexity > AUTHORITY_RANK.kimi);
    assert.ok(AUTHORITY_RANK.kimi > AUTHORITY_RANK.zhipu);
  });
  test("成本敏感 智谱 > Kimi > Perplexity（越靠前越便宜）", () => {
    assert.ok(COST_RANK.zhipu > COST_RANK.kimi);
    assert.ok(COST_RANK.kimi > COST_RANK.perplexity);
  });
});

describe("planSearchProviders", () => {
  test("显式点名优先，高于一切默认策略", () => {
    assert.deepEqual(
      planSearchProviders({ query: "随便", mode: "academic", explicit: ["zhipu"], available: ALL }),
      ["zhipu"],
    );
    // 点名了不可用的源 → 忽略它，回落到默认策略。
    assert.deepEqual(
      planSearchProviders({ query: "随便", mode: "daily", explicit: ["perplexity"], available: ["kimi", "zhipu"] }),
      ["kimi", "zhipu"],
    );
  });

  test("daily → Kimi + 智谱（便宜、日常够用）", () => {
    assert.deepEqual(planSearchProviders({ query: "上海天气", mode: "daily", available: ALL }), ["kimi", "zhipu"]);
  });

  test("academic → Perplexity 优先，再补 Kimi 交叉验证", () => {
    assert.deepEqual(planSearchProviders({ query: "有 meta 分析吗", mode: "academic", available: ALL }), ["perplexity", "kimi"]);
  });

  test("comprehensive → 三家全上", () => {
    const planned = planSearchProviders({ query: "系统梳理", mode: "comprehensive", available: ALL });
    assert.equal(planned.length, 3);
    assert.deepEqual([...planned].sort(), ["kimi", "perplexity", "zhipu"]);
  });

  test("auto：学术信号走 academic，否则走 daily", () => {
    assert.deepEqual(
      planSearchProviders({ query: "这个机制的临床试验数据怎么说", mode: "auto", available: ALL }),
      ["perplexity", "kimi"],
    );
    assert.deepEqual(
      planSearchProviders({ query: "今天有什么新闻", mode: "auto", available: ALL }),
      ["kimi", "zhipu"],
    );
  });

  test("只按可用源裁剪，不会返回没配 key 的源", () => {
    assert.deepEqual(planSearchProviders({ query: "x", mode: "comprehensive", available: ["zhipu"] }), ["zhipu"]);
    assert.deepEqual(planSearchProviders({ query: "x", mode: "academic", available: ["kimi"] }), ["kimi"]);
    assert.deepEqual(planSearchProviders({ query: "x", mode: "daily", available: [] }), []);
  });
});

describe("问题性质判定", () => {
  test("学术 / 客观真实信号", () => {
    for (const q of ["有没有相关论文", "这个结论的证据是什么", "给我统计数据", "事实核查一下", "clinical trial 结果"]) {
      assert.equal(looksAcademic(q), true, q);
    }
    assert.equal(looksAcademic("今天天气怎么样"), false);
  });

  test("日常事务信号", () => {
    for (const q of ["今天上海天气", "最新汇率", "明天航班", "股价多少"]) {
      assert.equal(looksDaily(q), true, q);
    }
    assert.equal(looksDaily("什么是熵"), false);
  });
});

describe("orderForMode", () => {
  test("学术场景按权威性排序，其余按默认优先级", () => {
    assert.deepEqual(orderForMode(["kimi", "zhipu", "perplexity"], "academic"), ["perplexity", "kimi", "zhipu"]);
    assert.deepEqual(orderForMode(["perplexity", "zhipu", "kimi"], "daily"), ["kimi", "zhipu", "perplexity"]);
  });
});
