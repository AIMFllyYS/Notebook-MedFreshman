import type { WebSearchSource } from "@/lib/types/chat";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface ImageSearchInput {
  query: string;
  numResults?: number;
}

export interface ImageSearchOutput extends TextToolOutput {
  contextKey?: string;
  sources: WebSearchSource[];
  provider: "unsplash";
  limitReached?: boolean;
  deduped?: boolean;
}
