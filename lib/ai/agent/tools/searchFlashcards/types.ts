import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface FlashcardHit {
  id: string;
  title: string;
  snippet: string;
  subjectId?: string;
  sourceLabel?: string;
}

export interface SearchFlashcardsInput {
  query?: string;
  /** 闪卡 id：只取这一张做引用分析。 */
  id?: string;
  subjectId?: string;
}

export interface SearchFlashcardsOutput extends TextToolOutput {
  contextKey?: string;
  hits: FlashcardHit[];
  deduped?: boolean;
}
