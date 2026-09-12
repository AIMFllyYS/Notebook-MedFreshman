import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

/** 模型 text 与 UI hits 共用的条数上限。 */
export const SEARCH_NOTES_HIT_LIMIT = 8;

export interface SearchHit {
  title: string;
  path: string;
  snippet: string;
}

export interface SearchNotesInput {
  query: string;
  crossYear?: boolean;
  /** 限定科目 id，如 histology。不传则搜当前学年全部科目。 */
  subjectId?: string;
}

export interface SearchNotesDiagnostics {
  bm25Hits: number;
  vecHits: number;
  mode: string;
  indexBuiltAt?: string;
  ms: number;
  embedError?: string;
}

export interface SearchNotesOutput extends TextToolOutput {
  contextKey?: string;
  hits: SearchHit[];
  deduped?: boolean;
  diagnostics?: SearchNotesDiagnostics;
}
