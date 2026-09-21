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
  /** 复合路径，如 histology/textbook/ch03-2。 */
  path?: string;
  /** 本轮回答里的 [n] 编号。 */
  citeIndex?: number;
}
