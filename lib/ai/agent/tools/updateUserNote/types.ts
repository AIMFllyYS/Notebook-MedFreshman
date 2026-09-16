import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export type UpdateUserNoteAction = "update" | "delete";

export interface UpdateUserNoteInput {
  markdown?: string;
  title?: string;
  noteId?: string;
  action?: UpdateUserNoteAction;
}

export interface UpdateUserNoteOutput extends TextToolOutput {
  noteId: string;
  markdown: string;
  title?: string;
  action: UpdateUserNoteAction;
  /** 服务端已确认有可写回的个人笔记 id。 */
  applied: boolean;
}
