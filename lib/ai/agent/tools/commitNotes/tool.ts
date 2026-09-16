import { tool } from "ai";
import { z } from "zod";
import type { CommitNotesOutput } from "@/lib/ai/agent/tools/commitNotes/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

export function createCommitNotesTool() {
  return tool({
    description:
      "仅在学生已确认「整理成笔记」之后调用。写入一篇短记忆提纲（不是讲义或长文）：核心知识点用 1. 2. 3. 4. 有序列表或对照表；内容多时才用多级标题。不要写非常详细的 Markdown。前端会创建个人笔记并打开编辑器。不要用 writeDocument。不要在聊天正文里重复笔记全文。",
    inputSchema: z.object({
      title: z.string().min(1).describe("笔记标题"),
      markdown: z.string().min(1).describe("短记忆提纲。核心点用有序列表或表格；少用多级标题与长文排版。可用 $KaTeX$"),
      subjectId: z.string().optional().describe("绑定科目 id；省略则用当前科目"),
    }),
    execute: async (input, { toolCallId }): Promise<CommitNotesOutput> => {
      const noteId = `note_${toolCallId}`;
      return {
        text: `短笔记「${input.title}」已交给前端落库并打开编辑器。请用一句话告诉学生可以去改，不要复述全文。`,
        noteId,
        title: input.title,
        markdown: input.markdown,
        subjectId: input.subjectId,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
