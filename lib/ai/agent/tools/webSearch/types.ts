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

/** 单家供应商的实时状态（走马灯用）。 */
export interface WebSearchProviderStatus {
  id: WebSearchProvider;
  label: string;
  state: "pending" | "done" | "error";
  /** 这家已拿到的条数。 */
  count?: number;
}

/**
 * 搜索进行中的渐进状态：工具执行期间以 preliminary 输出携带（part.preliminary=true），
 * 前端据此渲染"哪家在搜 / 已拿到几条 / 是否在综述"；最终输出的 progress.stage 为 "done"。
 */
export interface WebSearchProgress {
  stage: "planning" | "searching" | "synthesizing" | "done";
  providers: WebSearchProviderStatus[];
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
  /** 因精选上限未入选的来源数（仅最终结果给出）。 */
  omittedSources?: number;
  /** 渐进状态（preliminary 与最终结果都带）。 */
  progress?: WebSearchProgress;
}
