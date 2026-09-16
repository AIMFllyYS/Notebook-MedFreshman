import { tool } from "ai";
import { z } from "zod";
import type { CommitNotesOutput } from "@/lib/ai/agent/tools/commitNotes/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

export function createCommitNotesTool() {
  return tool({
    description:
      "仅在学生已确认「整理成笔记」之后调用。写入一篇短 Markdown 要点提纲（提纲/要点，不是讲义或长文），前端会创建个人笔记并打开编辑器。不要用 writeDocument。不要在聊天正文里重复笔记全文。",
    inputSchema: z.object({
      title: z.string().min(1).describe("笔记标题"),
      markdown: z.string().min(1).describe("短要点提纲，可用标题、列表与 $KaTeX$"),
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
