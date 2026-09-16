import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface CommitNotesInput {
  title: string;
  /** 短要点提纲，不是讲义/长文。 */
  markdown: string;
  subjectId?: string;
}

export interface CommitNotesOutput extends TextToolOutput {
  noteId: string;
  title: string;
  markdown: string;
  subjectId?: string;
}
