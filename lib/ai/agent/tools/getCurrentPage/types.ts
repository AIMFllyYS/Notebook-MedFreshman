import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export type GetCurrentPageInput = Record<string, never>;

export interface GetCurrentPageOutput extends TextToolOutput {
  contextKey: string;
  /** 同一 contextKey 在本次对话工具链中已注入过，本次只返回提示。 */
  deduped?: boolean;
}
