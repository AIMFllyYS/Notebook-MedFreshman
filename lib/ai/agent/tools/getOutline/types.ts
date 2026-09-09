import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface GetOutlineInput {
  crossYear?: boolean;
}

export interface GetOutlineOutput extends TextToolOutput {
  contextKey: string;
  deduped?: boolean;
}
