// 搜索子智能体：把「选供应商 → 并行检索 → 精选 → 综述」这段重活从主 Agent 手里摘出来。
//
// 为什么要有这一层（对齐 AI SDK 的 subagent 用法：主 Agent 用一个工具调它，它在自己的上下文里跑完、
// 只回一段紧凑结果）：
//  1. **并行**：三家 API 串行要 30–60s，并行只等最慢的一家。
//  2. **上下文卸载**：供应商原始结果动辄几十上百条，先经 selectSources 精选（去重 / 域名限流 /
//     相关度×权威排序 / 数量与 token 双预算）才回灌主 Agent——精辟、有界，截断数会如实告知。
//  3. **隔离**：供应商差异（Kimi 是代理式、Perplexity 有 search/sonar 两条路）只在这一层处理。
//  4. **有界耗时**：所有供应商共享一个总预算 signal（默认 90s），到点截断慢家、保留已收到的部分，
//     综述再给 12s 上限——单次搜索总时长显著低于前端看门狗的 300s 总闸。
//
// 它**不是**一个完整 ToolLoopAgent：这里不需要多轮工具探索，只需要一次并行取数 + 一次综述，
// 用一个便宜的文本模型直接生成更省时省钱（综述用七牛云 doubao，关思考）。

import { callFastModel } from "@/lib/ai/fastModel";
import { availableProviders, runProviderSearch } from "./providers";
import { AUTHORITY_RANK, PROVIDER_LABELS, planSearchProviders } from "./policy";
import { selectSources, SEARCH_MAX_SOURCES, type SelectSourcesResult } from "./selectSources";
import type { ProviderOutcome, SearchBundle, SearchItem, SearchMode, SearchProgressEvent, SearchProviderId } from "./types";

/**
 * 全部供应商共享的总预算（默认 90s）：到点未完成的上游被中止，已完成的照常回传。
 * 预算远低于前端看门狗 max-wait（默认 300s），给 LLM 思考 + 多步工具留足余量。
 */
export const SEARCH_PROVIDER_BUDGET_MS = 90_000;
/** 跨源综述的独立时限：它只是"锦上添花"，不能反过来拖累整体耗时。 */
export const SEARCH_SYNTHESIS_TIMEOUT_MS = 12_000;
/** 每家成文结论（briefing）回灌给模型的字符上限。 */
export const BRIEFING_MAX_CHARS = 2_400;

/** 综述用的模型：极便宜、关思考；未配置时退化为"规则拼接"，不阻塞搜索。 */
const SYNTHESIS_SYSTEM = [
  "你是检索结果综述器。只能使用给定的检索材料，禁止引入材料之外的知识。",
  "输出 3–6 条要点，每条末尾用 [编号] 标注来源；如果不同来源互相矛盾，单独用一条说明分歧。",
  "不要寒暄、不要复述问题、不要写标题。",
].join("\n");

/** 把结构化结果按 URL 去重（保留信息量更大的那条），并按供应商权威档排序。 */
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
  // 来源清单按权威性排（Perplexity > Kimi > 智谱）：这是"该信谁"的初排，
  // 最终回灌顺序由 selectSources 按「相关度 + 权威档」重排。
  // mode 参数保留在签名里是为了调用方可读性，排序本身不再依赖它。
  void mode;
  return [...byUrl.values()].sort((a, b) => AUTHORITY_RANK[b.provider] - AUTHORITY_RANK[a.provider]);
}

/** 组装给主 Agent 的正文：来源清单 + 各家要点/综述 + 截断统计。 */
export function buildBundleText(input: {
  query: string;
  mode: SearchMode;
  outcomes: readonly ProviderOutcome[];
  sources: readonly SearchItem[];
  skipped: readonly { provider: SearchProviderId; reason: string }[];
  selection?: SelectSourcesResult;
  synthesis?: string;
}): string {
  const lines: string[] = [];
  const used = input.outcomes.filter((o) => o.results.length > 0 || o.briefing).map((o) => o.provider);
  const label = used.map((id) => PROVIDER_LABELS[id]).join(" + ");
  lines.push("【联网搜索结果】查询：" + input.query);
  lines.push("本次调用了 " + used.length + " 个搜索源（" + (label || "无") + "）。");
  lines.push("");
  if (input.sources.length > 0) {
    const sel = input.selection;
    const head = sel
      ? "来源清单（共检索到 " + sel.afterDedupe + " 条去重后候选，按相关度/权威性精选前 "
        + sel.kept + " 条，引用时用这里的编号）："
      : "来源清单（按权威性排序，引用时用这里的编号）：";
    lines.push(head);
    input.sources.forEach((item, index) => {
      const date = item.date ? "（" + item.date + "）" : "";
      lines.push("[" + (index + 1) + "] " + item.title + date + "\n" + item.snippet + "\n来源：" + item.url);
    });
    if (sel && sel.omitted > 0) {
      lines.push("另有 " + sel.omitted + " 条候选来源因数量/篇幅上限未纳入；如需更多材料，"
        + "请换个关键词、拆子问题再搜一次（单次上限 " + SEARCH_MAX_SOURCES + " 条），不要重复同一查询。");
    }
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
    lines.push(outcome.briefing.slice(0, BRIEFING_MAX_CHARS));
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

/**
 * 有 ≥2 家出结果时，让便宜模型做一次跨源综述（这是"综合分析"的落点）。
 * 综述材料用**精选后**的来源清单（按供应商分组）+ 各家 briefing，
 * 避免把未经筛选的原始几十条全塞给综述模型。
 */
async function synthesize(
  query: string,
  outcomes: readonly ProviderOutcome[],
  selected: readonly SearchItem[],
): Promise<string | undefined> {
  const usable = outcomes.filter((o) => o.briefing || o.results.length > 0);
  if (usable.length < 2) return undefined;
  const material = usable.map((o) => {
    const head = "## " + PROVIDER_LABELS[o.provider];
    const kept = selected.filter((item) => item.provider === o.provider);
    const body = o.briefing
      ? o.briefing.slice(0, 2500)
      : kept.slice(0, 6).map((r) => "- " + r.title + "\n  " + r.snippet.slice(0, 300) + "\n  " + r.url).join("\n");
    return head + "\n" + body;
  }).join("\n\n");
  const result = await callFastModel({
    system: SYNTHESIS_SYSTEM,
    user: "问题：" + query + "\n\n检索材料：\n" + material,
    maxTokens: 700,
    temperature: 0.2,
    timeoutMs: SEARCH_SYNTHESIS_TIMEOUT_MS,
  });
  return result && result.text.trim() ? result.text.trim() : undefined;
}

export interface RunSearchInput {
  query: string;
  mode?: SearchMode;
  providers?: readonly SearchProviderId[];
  count?: number;
  /** 供应商并行总预算（毫秒），默认 SEARCH_PROVIDER_BUDGET_MS；测试可调小。 */
  budgetMs?: number;
}

export type SearchProgressFn = (event: SearchProgressEvent) => void;

/**
 * 跑一次（可能多源的）联网搜索。永远不抛：任何供应商失败都写进结果里的 error 字段。
 * onProgress 可选：供应商选定 / 每家返回 / 综述开始 / 结束各推一次，供工具层流式展示进度。
 */
export async function runSearchSubagent(input: RunSearchInput, onProgress?: SearchProgressFn): Promise<SearchBundle> {
  const started = Date.now();
  const query = input.query.trim();
  const mode: SearchMode = input.mode ?? "auto";
  const count = Math.min(Math.max(input.count ?? 5, 1), 30);
  const emit = (event: SearchProgressEvent) => {
    try { onProgress?.(event); } catch { /* 进度回调不能反过来打挂搜索 */ }
  };
  const empty = (text: string): SearchBundle => ({
    text, sources: [], mode, used: [], skipped: [], synthesized: false, cacheHit: false, ms: 0, omittedSources: 0,
  });
  if (!query) {
    return empty("搜索关键词为空。");
  }
  const available = availableProviders();
  if (available.length === 0) {
    return empty("联网搜索未配置（Kimi / 智谱 / Perplexity 三家都没有 key）。请在设置里填写搜索凭证，或由站点配置 KIMI_API_KEY / ZHIPU_API_KEY / PERPLEXITY_API_KEY。本次请基于已有知识回答，并说明未能联网。");
  }

  const planned = planSearchProviders({ query, mode, explicit: input.providers, available });
  const skipped = available
    .filter((id) => !planned.includes(id))
    .map((id) => ({ provider: id, reason: "本次模式未选用" }));
  emit({ stage: "planned", planned });

  // 并行扇出 + 总预算闸：到点中止未完成的上游，已完成的照常保留（部分结果 > 全灭）。
  const budget = AbortSignal.timeout(Math.max(1_000, input.budgetMs ?? SEARCH_PROVIDER_BUDGET_MS));
  const settled = await Promise.allSettled(planned.map((id) =>
    runProviderSearch(id, query, count, { signal: budget }).then((outcome) => {
      emit({
        stage: "provider",
        provider: id,
        providerState: outcome.error ? "error" : "ok",
        resultCount: outcome.results.length + (outcome.briefing ? 1 : 0),
        error: outcome.error,
      });
      return outcome;
    }),
  ));
  const outcomes: ProviderOutcome[] = settled.map((entry, index) => {
    if (entry.status === "fulfilled") return entry.value;
    const provider = planned[index]!;
    return { provider, results: [], citations: [], ms: 0, usedPlatformCredentials: true, error: String((entry.reason as Error)?.message ?? entry.reason) };
  });

  // 全部命中进程内缓存 = 没打上游、没花钱：这时候不要再跑综述（综述本身要花钱）。
  const cacheHit = outcomes.length > 0 && outcomes.every((o) => o.cached);
  const merged = dedupeItems(outcomes.flatMap((o) => o.results), mode);
  // 精选管线：域名限流 + 相关度×权威排序 + 数量/token 双预算。sources 即最终回灌清单。
  const selection = selectSources(merged, query);
  const selectedSources = selection.sources;

  const synthesis = cacheHit ? undefined : await (async () => {
    const usable = outcomes.filter((o) => o.briefing || o.results.length > 0);
    if (usable.length < 2) return undefined;
    emit({ stage: "synthesizing" });
    return synthesize(query, outcomes, selectedSources);
  })();

  const successful = outcomes.filter((o) => o.results.length > 0 || o.briefing);
  const text = buildBundleText({ query, mode, outcomes, sources: selectedSources, skipped, selection, synthesis });
  emit({ stage: "done", sourcesKept: selectedSources.length });
  return {
    text,
    sources: selectedSources,
    mode,
    used: successful.map((o) => o.provider),
    skipped,
    synthesized: !!synthesis,
    cacheHit,
    ms: Date.now() - started,
    omittedSources: selection.omitted,
  };
}
