import type { RecordMode } from "@/lib/review/types";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface CommitFlashcardItem {
  originalText: string;
  sourceLabel?: string;
}

export interface CommitFlashcardsInput {
  mode: RecordMode;
  userInstruction?: string;
  items: CommitFlashcardItem[];
  subjectId?: string;
}

export interface CommitFlashcardsOutput extends TextToolOutput {
  cardIds: string[];
  mode: RecordMode;
  userInstruction?: string;
  items: CommitFlashcardItem[];
  subjectId?: string;
}
