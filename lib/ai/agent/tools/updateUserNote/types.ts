import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface UpdateUserNoteInput {
  markdown: string;
  title?: string;
}

export interface UpdateUserNoteOutput extends TextToolOutput {
  noteId: string;
  markdown: string;
  title?: string;
  /** 服务端已确认请求里带着正在编辑的个人笔记。 */
  applied: boolean;
}
