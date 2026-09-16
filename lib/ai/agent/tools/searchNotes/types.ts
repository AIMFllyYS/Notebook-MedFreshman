import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

/** 模型 text 与 UI hits 共用的条数上限。 */
export const SEARCH_NOTES_HIT_LIMIT = 8;

export type SearchNotesScope = "class" | "personal" | "all";
export type SearchHitKind = "class" | "personal";

export interface SearchHit {
  title: string;
  path: string;
  snippet: string;
  kind?: SearchHitKind;
  noteId?: string;
  subjectId?: string;
}

export interface SearchNotesInput {
  query?: string;
  /** 个人笔记 id：只取这一篇全文，不要在列表阶段传。 */
  id?: string;
  scope?: SearchNotesScope;
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
