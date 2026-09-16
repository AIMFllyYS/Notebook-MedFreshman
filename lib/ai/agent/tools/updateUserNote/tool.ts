import { tool } from "ai";
import { z } from "zod";
import type { UpdateUserNoteAction, UpdateUserNoteOutput } from "@/lib/ai/agent/tools/updateUserNote/types";
import { findUserNote } from "@/lib/ai/agent/tools/memoryCatalog";
import { toText, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";

export function createUpdateUserNoteTool(ctx: StudyToolContext) {
  return tool({
    description:
      "改或删学生的个人笔记。省略 noteId 时改当前打开的那篇；否则用 searchNotes 列表里的 id。action=update 写回完整 Markdown；action=delete 删除该篇。不要用 writeDocument 或 commitNotes 代替改稿。新建短笔记仍走 proposeMemory + commitNotes。不要在聊天正文里重复全文。",
    inputSchema: z.object({
      action: z.enum(["update", "delete"]).optional().describe("默认 update。delete 按 id 删除个人笔记。"),
      noteId: z.string().optional().describe("要改/删的个人笔记 id。省略则改当前打开的那篇。"),
      markdown: z.string().optional().describe("update 时写回的完整 Markdown，可用 $KaTeX$"),
      title: z.string().optional().describe("可选，同时改标题；省略则只改正文"),
    }),
    execute: async (input): Promise<UpdateUserNoteOutput> => {
      const action: UpdateUserNoteAction = input.action ?? "update";
      const noteId = input.noteId?.trim() || ctx.editingUserNote?.id || "";
      const catalogNote = noteId ? findUserNote(ctx.userNotes ?? [], noteId) : undefined;
      const known = Boolean(catalogNote || (ctx.editingUserNote && ctx.editingUserNote.id === noteId));
      if (!noteId || !known) {
        return {
          text: "没有可写回的个人笔记。请先 searchNotes(scope=\"personal\") 取得 id，或在打开的笔记里改当前篇。不要用 writeDocument 或 commitNotes 代替。",
          noteId,
          markdown: input.markdown ?? "",
          title: input.title,
          action,
          applied: false,
        };
      }
      if (action === "delete") {
        return {
          text: `已把个人笔记「${catalogNote?.title || ctx.editingUserNote?.title || "无标题笔记"}」交给前端删除。请用一句话告诉学生，不要复述正文。`,
          noteId,
          markdown: "",
          action,
          applied: true,
        };
      }
      const markdown = input.markdown?.trim() ?? "";
      if (!markdown) {
        return {
          text: "改写笔记需要提供完整 markdown。",
          noteId,
          markdown: "",
          title: input.title,
          action,
          applied: false,
        };
      }
      const title = input.title?.trim() || undefined;
      const label = title ?? catalogNote?.title ?? ctx.editingUserNote?.title ?? "无标题笔记";
      return {
        text: `已把个人笔记「${label}」交给前端写回。请用一句话告诉学生可以继续改，不要复述全文。`,
        noteId,
        markdown,
        title,
        action,
        applied: true,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
