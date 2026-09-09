import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface GetSectionInput {
  path?: string;
  sectionId?: string;
}

export interface GetSectionOutput extends TextToolOutput {
  contextKey?: string;
  title?: string;
  found: boolean;
  deduped?: boolean;
}
