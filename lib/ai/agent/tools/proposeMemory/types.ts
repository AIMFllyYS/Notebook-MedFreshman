import type { RecordMode } from "@/lib/review/types";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export type MemoryKind = "note" | "flashcard";

export interface ProposeMemoryInput {
  kind: MemoryKind;
  /** 一句话：为什么这次对话值得沉淀。 */
  reason: string;
  titleHint?: string;
  suggestedMode?: RecordMode;
}

export interface ProposeMemoryOutput extends TextToolOutput {
  proposalId: string;
  kind: MemoryKind;
  reason: string;
  titleHint?: string;
  suggestedMode?: RecordMode;
}
