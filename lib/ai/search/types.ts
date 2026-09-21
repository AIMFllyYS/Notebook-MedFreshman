// 多供应商联网搜索：统一类型与调度策略的单一真相源。
//
// 三家 API 的形状**完全不同**（这正是必须有一层归一化的原因）：
//  - 智谱：POST /web_search → { search_result: [{ title, link, content, media, icon }] }（结构化列表）
//  - Perplexity：POST /search → { results: [{ title, url, snippet, date, last_updated }] }（结构化列表）
//                POST /chat/completions(sonar) → 成文答案 + citations + search_results
//  - Kimi：POST /chat/completions，声明 tools:[{type:"builtin_function",function:{name:"$web_search"}}]，
//          由**平台侧**执行搜索：模型先回一个 tool_call，客户端把它的 arguments 原样回灌
//          （注意回灌时 assistant.tool_calls[].type 必须写成 "function"，写 builtin_function 会
//          400 tokenization failed），模型再产出带引用的成文答案。它是"代理式搜索"，不返回结果列表。

export type SearchProviderId = "kimi" | "zhipu" | "perplexity";

export const SEARCH_PROVIDER_IDS: readonly SearchProviderId[] = ["kimi", "zhipu", "perplexity"];

/** 搜索广度：决定默认并发几个供应商。 */
export type SearchMode = "auto" | "daily" | "academic" | "comprehensive";

export interface SearchItem {
  title: string;
  url: string;
  snippet: string;
  /** 供应商给的发布时间（有的没有）。 */
  date?: string;
  media?: string;
  provider: SearchProviderId;
}

export interface ProviderOutcome {
  provider: SearchProviderId;
  /** 结构化结果（Kimi 不返回列表，通常为空）。 */
  results: SearchItem[];
  /** 成文摘要（Kimi 必给；Perplexity 取 sonar 时会给）。 */
  briefing?: string;
  citations: string[];
  ms: number;
  usedPlatformCredentials: boolean;
  /** 命中进程内缓存（没有打上游、没有计费）。 */
  cached?: boolean;
  /** 该供应商这次为什么没出结果（未配置 / 超时 / 上游报错）。 */
  error?: string;
}

export interface SearchBundle {
  /** 给模型的最终正文（含来源编号与供应商归属）。 */
  text: string;
  /** 合并去重后的来源（按权威性排序），供来源条与引用使用。 */
  sources: SearchItem[];
  mode: SearchMode;
  used: SearchProviderId[];
  skipped: { provider: SearchProviderId; reason: string }[];
  /** 是否为多供应商综合分析（决定要不要跑综述子智能体）。 */
  synthesized: boolean;
  /** 本次所有已选供应商都是缓存命中（调用方据此判断"没花钱"）。 */
  cacheHit: boolean;
  ms: number;
}
