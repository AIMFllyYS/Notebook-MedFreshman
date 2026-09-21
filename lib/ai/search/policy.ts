// 搜索供应商的排序口径与默认调度策略（用户给定的产品规则）。
//
// 三条排序**互不相同**，别合并：
//  - 默认优先级：Kimi > 智谱 > Perplexity（日常默认走这条）
//  - 权威性：    Perplexity > Kimi > 智谱（学术 / 强调客观真实时用它排序与选源）
//  - 成本敏感：  智谱 > Kimi > Perplexity（越靠前越便宜）

import type { SearchMode, SearchProviderId } from "./types";

export const DEFAULT_PRIORITY: readonly SearchProviderId[] = ["kimi", "zhipu", "perplexity"];

export const AUTHORITY_RANK: Record<SearchProviderId, number> = {
  perplexity: 3,
  kimi: 2,
  zhipu: 1,
};

export const COST_RANK: Record<SearchProviderId, number> = {
  zhipu: 3,
  kimi: 2,
  perplexity: 1,
};

export const PROVIDER_LABELS: Record<SearchProviderId, string> = {
  kimi: "Kimi",
  zhipu: "智谱",
  perplexity: "Perplexity",
};

/**
 * 学术 / 客观真实性的信号词：命中就走 Perplexity 优先。
 * 保守一点：只有明确指向"要证据/要研究/要数据"的词才算，避免把日常问题也送进贵通道。
 */
const ACADEMIC_RE = /论文|文献|研究|综述|meta[- ]?分析|临床试验|数据|统计|实验|机制|原理|证据|引用|出处|学术|学位|期刊|DOI|引用数|权威|客观|事实核查|核实|查证|reference|study|paper|journal|citation|clinical\s*trial|systematic\s*review/i;

/** 日常事务信号：命中就优先走便宜通道（智谱 / Kimi）。 */
const DAILY_RE = /今天|昨天|明天|现在|最新|实时|新闻|天气|汇率|股价|比分|赛程|航班|快递|营业时间|放假|政策|通知|发布|价格|多少钱/i;

export function looksAcademic(query: string): boolean {
  return ACADEMIC_RE.test(query);
}

export function looksDaily(query: string): boolean {
  return DAILY_RE.test(query);
}

/**
 * 决定这次搜几个供应商、搜哪些。
 * 规则（对应用户给的调度策略）：
 *  - 显式点名 providers → 就按点名的来（模型自己判断的结果，优先级最高）
 *  - academic：Perplexity 优先，再补一个 Kimi 交叉验证
 *  - daily：Kimi + 智谱（便宜、日常够用）
 *  - comprehensive：三家全上（并行），拿回来做系统性分析
 *  - auto：命中学术信号 → academic；否则 daily
 */
export function planSearchProviders(input: {
  query: string;
  mode: SearchMode;
  explicit?: readonly SearchProviderId[];
  available: readonly SearchProviderId[];
}): SearchProviderId[] {
  const available = new Set(input.available);
  const explicit = (input.explicit ?? []).filter((id) => available.has(id));
  if (explicit.length > 0) return explicit;

  const mode: SearchMode = input.mode === "auto"
    ? (looksAcademic(input.query) ? "academic" : "daily")
    : input.mode;

  let planned: SearchProviderId[];
  if (mode === "comprehensive") planned = ["kimi", "zhipu", "perplexity"];
  else if (mode === "academic") planned = ["perplexity", "kimi"];
  else planned = ["kimi", "zhipu"];

  return planned.filter((id) => available.has(id));
}

/** 学术场景按权威性、其余按默认优先级；用于结果排序（不改变实际请求顺序）。 */
export function orderForMode(ids: readonly SearchProviderId[], mode: SearchMode): SearchProviderId[] {
  const rank = mode === "academic" ? AUTHORITY_RANK : null;
  return [...ids].sort((a, b) => {
    if (rank) return rank[b] - rank[a];
    return DEFAULT_PRIORITY.indexOf(a) - DEFAULT_PRIORITY.indexOf(b);
  });
}
