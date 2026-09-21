// 搜索子智能体：把「选供应商 → 并行检索 → 综述」这段重活从主 Agent 手里摘出来。
//
// 为什么要有这一层（对齐 AI SDK 的 subagent 用法：主 Agent 用一个工具调它，它在自己的上下文里跑完、
// 只回一段紧凑结果）：
//  1. **并行**：三家 API 串行要 30–60s，并行只等最慢的一家（Kimi 约 20–26s）。
//  2. **上下文卸载**：三家原始结果动辄几千字，主 Agent 只需要「要点 + 来源」，不必把噪声吃进上下文。
//  3. **隔离**：供应商差异（Kimi 是代理式、Perplexity 有 search/sonar 两条路）只在这一层处理。
//
// 它**不是**一个完整 ToolLoopAgent：这里不需要多轮工具探索，只需要一次并行取数 + 一次综述，
// 用一个便宜的文本模型直接生成更省时省钱（综述用七牛云 doubao，关思考）。

import { callFastModel } from "@/lib/ai/fastModel";
import { availableProviders, runProviderSearch } from "./providers";
import { AUTHORITY_RANK, PROVIDER_LABELS, planSearchProviders } from "./policy";
import type { ProviderOutcome, SearchBundle, SearchItem, SearchMode, SearchProviderId } from "./types";

/** 综述用的模型：极便宜、关思考；未配置时退化为"规则拼接"，不阻塞搜索。 */
const SYNTHESIS_SYSTEM = [
  "你是检索结果综述器。只能使用给定的检索材料，禁止引入材料之外的知识。",
  "输出 3–6 条要点，每条末尾用 [编号] 标注来源；如果不同来源互相矛盾，单独用一条说明分歧。",
  "不要寒暄、不要复述问题、不要写标题。",
].join("\n");

/** 把结构化结果按 URL 去重（保留权威性最高的一家当出处）。 */
export function dedupeItems(items: readonly SearchItem[], mode: SearchMode): SearchItem[] {
  const byUrl = new Map<string, SearchItem>();
  for (const item of items) {
    const key = item.url.replace(/[#?].*$/, "").replace(/\/+$/, "").toLowerCase();
    if (!key) continue;
    const existing = byUrl.get(key);
    if (!existing) { byUrl.set(key, item); continue; }
    // 同一 URL 出现在多家：保留 snippet 更长的那条（信息量更大）。
    if (item.snippet.length > existing.snippet.length) byUrl.set(key, item);
  }
  // 来源清单**恒定按权威性**排（Perplexity > Kimi > 智谱）：这份清单是给模型和用户看的
  // "该信谁"的依据，与"这次该调谁"（默认优先级 / 成本）是两件事，别混。
  // mode 参数保留在签名里是为了调用方可读性，排序本身不再依赖它。
  void mode;
  return [...byUrl.values()].sort((a, b) => AUTHORITY_RANK[b.provider] - AUTHORITY_RANK[a.provider]);
}

/** 组装给主 Agent 的正文：来源清单 + 各家要点/综述。 */
export function buildBundleText(input: {
  query: string;
  mode: SearchMode;
  outcomes: readonly ProviderOutcome[];
  sources: readonly SearchItem[];
  skipped: readonly { provider: SearchProviderId; reason: string }[];
  synthesis?: string;
}): string {
  const lines: string[] = [];
  const used = input.outcomes.filter((o) => o.results.length > 0 || o.briefing).map((o) => o.provider);
  const label = used.map((id) => PROVIDER_LABELS[id]).join(" + ");
  lines.push("【联网搜索结果】查询：" + input.query);
  lines.push("本次调用了 " + used.length + " 个搜索源（" + (label || "无") + "）。");
  lines.push("");
  if (input.sources.length > 0) {
    lines.push("来源清单（按权威性排序，引用时用这里的编号）：");
    input.sources.forEach((item, index) => {
      const date = item.date ? "（" + item.date + "）" : "";
      lines.push("[" + (index + 1) + "] " + item.title + date + "\n" + item.snippet.slice(0, 400) + "\n来源：" + item.url);
    });
    lines.push("");
  }
  if (input.synthesis) {
    lines.push("多源综述（已交叉核对，可直接作为作答依据）：");
    lines.push(input.synthesis);
    lines.push("");
  }
  for (const outcome of input.outcomes) {
    if (!outcome.briefing) continue;
    lines.push(PROVIDER_LABELS[outcome.provider] + " 的检索结论：");
    lines.push(outcome.briefing.slice(0, 3000));
    if (outcome.citations.length > 0) lines.push("引用：" + outcome.citations.slice(0, 8).join(" | "));
    lines.push("");
  }
  const failed = input.outcomes.filter((o) => o.error);
  if (failed.length > 0) {
    lines.push("部分来源未取到：" + failed.map((o) => PROVIDER_LABELS[o.provider] + "（" + o.error + "）").join("；"));
  }
  if (input.skipped.length > 0) {
    lines.push("未启用的来源：" + input.skipped.map((s) => PROVIDER_LABELS[s.provider] + "（" + s.reason + "）").join("；"));
  }
  lines.push("");
  lines.push("请基于以上材料作答，并在正文里用 [编号] 标注引用；与教材内容区分开。");
  return lines.join("\n");
}

/** 有 ≥2 家出结果时，让便宜模型做一次跨源综述（这是"综合分析"的落点）。 */
async function synthesize(query: string, outcomes: readonly ProviderOutcome[]): Promise<string | undefined> {
  const usable = outcomes.filter((o) => o.briefing || o.results.length > 0);
  if (usable.length < 2) return undefined;
  const material = usable.map((o) => {
    const head = "## " + PROVIDER_LABELS[o.provider];
    const body = o.briefing
      ? o.briefing.slice(0, 2500)
      : o.results.slice(0, 6).map((r, i) => "[" + (i + 1) + "] " + r.title + "\n" + r.snippet.slice(0, 300) + "\n" + r.url).join("\n\n");
    return head + "\n" + body;
  }).join("\n\n");
  const result = await callFastModel({
    system: SYNTHESIS_SYSTEM,
    user: "问题：" + query + "\n\n检索材料：\n" + material,
    maxTokens: 700,
    temperature: 0.2,
  });
  return result && result.text.trim() ? result.text.trim() : undefined;
}

export interface RunSearchInput {
  query: string;
  mode?: SearchMode;
  providers?: readonly SearchProviderId[];
  count?: number;
}

/**
 * 跑一次（可能多源的）联网搜索。永远不抛：任何供应商失败都写进结果里的 error 字段。
 */
export async function runSearchSubagent(input: RunSearchInput): Promise<SearchBundle> {
  const started = Date.now();
  const query = input.query.trim();
  const mode: SearchMode = input.mode ?? "auto";
  const count = Math.min(Math.max(input.count ?? 5, 1), 20);
  const available = availableProviders();
  if (!input.query.trim()) {
    return { text: "搜索关键词为空。", sources: [], mode, used: [], skipped: [], synthesized: false, cacheHit: false, ms: 0 };
  }
  if (available.length === 0) {
    return {
      text: "联网搜索未配置（Kimi / 智谱 / Perplexity 三家都没有 key）。请在设置里填写搜索凭证，或由站点配置 KIMI_API_KEY / ZHIPU_API_KEY / PERPLEXITY_API_KEY。本次请基于已有知识回答，并说明未能联网。",
      sources: [], mode, used: [], skipped: [], synthesized: false, cacheHit: false, ms: 0,
    };
  }

  const planned = planSearchProviders({ query, mode, explicit: input.providers, available });
  const skipped = available
    .filter((id) => !planned.includes(id))
    .map((id) => ({ provider: id, reason: "本次模式未选用" }));

  // 并行扇出：串行要 30–60s，并行只等最慢的一家。
  const settled = await Promise.allSettled(planned.map((id) => runProviderSearch(id, query, count)));
  const outcomes: ProviderOutcome[] = settled.map((entry, index) => {
    if (entry.status === "fulfilled") return entry.value;
    const provider = planned[index]!;
    return { provider, results: [], citations: [], ms: 0, usedPlatformCredentials: true, error: String((entry.reason as Error)?.message ?? entry.reason) };
  });

  // 全部命中进程内缓存 = 没打上游、没花钱：这时候不要再跑综述（综述本身要花钱）。
  const cacheHit = outcomes.length > 0 && outcomes.every((o) => o.cached);
  const merged = dedupeItems(outcomes.flatMap((o) => o.results), mode);
  const synthesis = cacheHit ? undefined : await synthesize(query, outcomes);
  const successful = outcomes.filter((o) => o.results.length > 0 || o.briefing);
  const text = buildBundleText({ query, mode, outcomes, sources: merged, skipped, synthesis });
  return {
    text,
    sources: merged,
    mode,
    used: successful.map((o) => o.provider),
    skipped,
    synthesized: !!synthesis,
    cacheHit,
    ms: Date.now() - started,
  };
}