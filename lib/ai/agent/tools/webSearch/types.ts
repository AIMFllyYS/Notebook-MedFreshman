import type { WebSearchSource } from "@/lib/types/chat";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface WebSearchInput {
  query: string;
  numResults?: number;
}

export interface WebSearchOutput extends TextToolOutput {
  contextKey?: string;
  sources: WebSearchSource[];
  cacheHit?: boolean;
  deduped?: boolean;
}
