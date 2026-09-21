// 来源精选管线：把供应商拿回来的几十上百条原始结果，压成给模型的"精辟有界"清单。
//
// 管线顺序（每步都可统计，统计会回写进给模型的正文）：
//   1. URL 去重（沿用 dedupeItems：同 URL 留信息量更大的那条，再按供应商权威档排序）
//   2. 归一化标题去重（同稿多源转载只留一条，扛"换个域名同一篇"的冗余）
//   3. 域名限流（同一域最多 SEARCH_MAX_PER_DOMAIN 条，防一个站刷屏、保住多样性）
//   4. 打分排序：query 相关度为主，供应商权威档（AUTHORITY_RANK）兜底拉平
//   5. 双预算截断：来源数量硬上限 + 总 token 估算上限，先命中哪个都停
//
// 模型本身支持长上下文（1M），但搜索材料必须保持精辟：回灌的是"筛选过的来源"，
// 被截掉的数量会告诉模型，它可以换关键词再搜——这是"分批搜索"设计的落点。

import { AUTHORITY_RANK } from "./policy";
import type { SearchItem } from "./types";

/** 单次工具调用回灌给模型的来源数量硬上限。 */
export const SEARCH_MAX_SOURCES = 36;
/** 同一域名最多保留几条（ diversity 护栏）。 */
export const SEARCH_MAX_PER_DOMAIN = 3;
/** 每条来源摘要的字符预算（超出截断）。 */
export const SEARCH_SNIPPET_MAX_CHARS = 420;
/** 来源清单的总 token 预算（粗略估算口径，见 estimateTokens）。 */
export const SEARCH_CONTEXT_TOKEN_BUDGET = 45_000;

/**
 * 粗略 token 估算：CJK 一字 ≈1 token，其余字符 ≈4 字符/token。
 * 只用于预算截断，不用于计费。
 */
export function estimateTokens(text: string): number {
  let cjk = 0;
  let other = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x3400 && cp <= 0x9fff) || (cp >= 0x3000 && cp <= 0x303f) || (cp >= 0xff00 && cp <= 0xffef)) cjk += 1;
    else other += 1;
  }
  return cjk + Math.ceil(other / 4);
}

/**
 * 取"注册域"做限流口径：zhuanlan.zhihu.com 与 www.zhihu.com 算同一个域，
 * .com.cn / .co.uk 这类二级后缀往前多取一段。解析失败返回空串。
 */
export function domainOf(url: string): string {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
  const labels = hostname.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const secondLevel = new Set(["com", "org", "net", "gov", "edu", "ac", "co"]);
  if (labels[labels.length - 1]!.length === 2 && secondLevel.has(labels[labels.length - 2]!)) {
    return labels.slice(-3).join(".");
  }
  return labels.slice(-2).join(".");
}

/** query 切词：拉丁/数字整词 + CJK 单字与二元组。命中权重：标题 4 / 摘要 2（单字减半）。 */
function queryTokens(query: string): string[] {
  const tokens = new Set<string>();
  const norm = query.toLowerCase();
  for (const m of norm.matchAll(/[a-z0-9][a-z0-9_.-]*/g)) tokens.add(m[0]);
  const runs = norm.match(/[㐀-鿿]+/g) ?? [];
  for (const run of runs) {
    for (const ch of run) tokens.add(ch);
    for (let i = 0; i < run.length - 1; i += 1) tokens.add(run.slice(i, i + 2));
  }
  return [...tokens];
}

function relevanceScore(tokens: readonly string[], item: SearchItem): number {
  const title = item.title.toLowerCase();
  const snippet = item.snippet.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    // CJK 单字噪声大（"的""是"类），权重减半；整词与二元组才算硬命中。
    const singleChar = token.length === 1;
    if (title.includes(token)) score += singleChar ? 2 : 4;
    else if (snippet.includes(token)) score += singleChar ? 1 : 2;
  }
  return score;
}

/** 标题归一化：大小写折叠 + 去空白与标点。同标题视为同一篇稿件的转载。 */
function titleKey(title: string): string {
  return title.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}

export interface SelectSourcesOptions {
  maxSources?: number;
  maxPerDomain?: number;
  snippetMaxChars?: number;
  tokenBudget?: number;
}

export interface SelectSourcesResult {
  /** 入选来源（snippet 已按预算截断），按"相关度 + 权威档"排序。 */
  sources: SearchItem[];
  /** 原始条数。 */
  total: number;
  /** URL + 标题两级去重后的条数。 */
  afterDedupe: number;
  /** 入选条数。 */
  kept: number;
  /** 去重后未入选的条数（= afterDedupe - kept）。 */
  omitted: number;
  /** 因域名限流被刷掉的条数。 */
  domainLimited: number;
  /** 因数量 / token 预算被截掉的条数。 */
  budgetLimited: number;
  /** 入选清单的估算 token 数。 */
  estimatedTokens: number;
}

/**
 * 精选来源。deduped 为已做过 URL 去重的清单（内部还会再做一次标题级去重），
 * 返回值为稳定排序：同分按 deduped 原有顺序（dedupeItems 已按权威档排过）。
 */
export function selectSources(
  deduped: readonly SearchItem[],
  query: string,
  opts: SelectSourcesOptions = {},
): SelectSourcesResult {
  const maxSources = Math.max(1, opts.maxSources ?? SEARCH_MAX_SOURCES);
  const maxPerDomain = Math.max(1, opts.maxPerDomain ?? SEARCH_MAX_PER_DOMAIN);
  const snippetMaxChars = Math.max(0, opts.snippetMaxChars ?? SEARCH_SNIPPET_MAX_CHARS);
  const tokenBudget = Math.max(0, opts.tokenBudget ?? SEARCH_CONTEXT_TOKEN_BUDGET);

  const tokens = queryTokens(query);
  const scored = deduped.map((item, index) => ({
    item,
    index,
    score: relevanceScore(tokens, item) + AUTHORITY_RANK[item.provider] * 4,
  }));
  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const seenTitles = new Set<string>();
  const perDomain = new Map<string, number>();
  const sources: SearchItem[] = [];
  let titleDupes = 0;
  let domainLimited = 0;
  let budgetLimited = 0;
  let estimatedTokens = 0;

  for (const { item } of scored) {
    const tKey = titleKey(item.title);
    if (tKey && seenTitles.has(tKey)) {
      titleDupes += 1;
      continue;
    }
    const domain = domainOf(item.url);
    if (domain && (perDomain.get(domain) ?? 0) >= maxPerDomain) {
      domainLimited += 1;
      continue;
    }
    const snippet = item.snippet.length > snippetMaxChars
      ? item.snippet.slice(0, snippetMaxChars) + "…"
      : item.snippet;
    const itemTokens = estimateTokens(item.title + snippet + item.url);
    // 空清单时至少放行一条：预算再小也不能把唯一结果卡成零。
    if (sources.length > 0 && (sources.length >= maxSources || estimatedTokens + itemTokens > tokenBudget)) {
      budgetLimited += 1;
      continue;
    }
    if (tKey) seenTitles.add(tKey);
    if (domain) perDomain.set(domain, (perDomain.get(domain) ?? 0) + 1);
    sources.push({ ...item, snippet });
    estimatedTokens += itemTokens;
  }

  const afterDedupe = deduped.length - titleDupes;
  return {
    sources,
    total: deduped.length,
    afterDedupe,
    kept: sources.length,
    omitted: afterDedupe - sources.length,
    domainLimited,
    budgetLimited,
    estimatedTokens,
  };
}
