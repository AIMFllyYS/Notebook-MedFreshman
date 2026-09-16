import { tool } from "ai";
import { z } from "zod";
import type { UpdateUserNoteOutput } from "@/lib/ai/agent/tools/updateUserNote/types";
import { toText, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";

export function createUpdateUserNoteTool(ctx: StudyToolContext) {
  return tool({
    description:
      "仅当学生正在编辑一篇已打开的个人笔记时调用。把改写后的完整 Markdown 写回这篇笔记（不要另开一篇）。不要用 writeDocument 或 commitNotes。不要在聊天正文里重复全文。",
    inputSchema: z.object({
      markdown: z.string().min(1).describe("写回编辑器的完整 Markdown，可用 $KaTeX$"),
      title: z.string().optional().describe("可选，同时改标题；省略则只改正文"),
    }),
    execute: async (input): Promise<UpdateUserNoteOutput> => {
      const current = ctx.editingUserNote;
      if (!current?.id) {
        return {
          text: "当前没有打开的个人笔记可改写。不要用 writeDocument 或 commitNotes 代替。",
          noteId: "",
          markdown: input.markdown,
          title: input.title,
          applied: false,
        };
      }
      const title = input.title?.trim() || undefined;
      return {
        text: `已把个人笔记「${title ?? (current.title || "无标题笔记")}」交给前端写回编辑器。请用一句话告诉学生可以继续改，不要复述全文。`,
        noteId: current.id,
        markdown: input.markdown,
        title,
        applied: true,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
