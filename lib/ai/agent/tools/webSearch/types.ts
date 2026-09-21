import type { WebSearchSource } from "@/lib/types/chat";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

/** 搜索广度：模型自己判断这次要搜几个来源。 */
export type WebSearchMode = "auto" | "daily" | "academic" | "comprehensive";

export type WebSearchProvider = "kimi" | "zhipu" | "perplexity";

export interface WebSearchInput {
  query: string;
  /** 不传 = auto（按问题性质自动选源）。 */
  mode?: WebSearchMode;
  /** 显式点名搜索源；不传则按 mode 的默认策略。 */
  providers?: WebSearchProvider[];
  numResults?: number;
}

export interface WebSearchOutput extends TextToolOutput {
  contextKey?: string;
  sources: WebSearchSource[];
  cacheHit?: boolean;
  deduped?: boolean;
  /** 实际出结果的供应商（缺省 = 旧数据层未回执；展示层据此把「计划」升级为「已搜」）。 */
  providers?: WebSearchProvider[];
  /** 计划内但没出结果的供应商及原因（失败灰态）。 */
  skipped?: { provider: WebSearchProvider; reason: string }[];
}
