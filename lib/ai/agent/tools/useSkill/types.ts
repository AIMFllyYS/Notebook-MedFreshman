import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface UseSkillInput {
  name: string;
}

export interface UseSkillOutput extends TextToolOutput {
  skill: string;
  found: boolean;
  contextKey?: string;
  deduped?: boolean;
}
