import { tool } from "ai";
import { validateDocumentSpec, documentSpecSchema } from "@/lib/ai/agent/documentTool";
import type { WriteDocumentInput, WriteDocumentOutput } from "@/lib/ai/agent/tools/writeDocument/types";
import { toText, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";

export function createWriteDocumentTool(ctx: StudyToolContext) {
  return tool({
    description:
      "撰写长文章、论文、报告或复习讲义。调用后前端会展示文档生成卡片并分节流式生成；导出支持 Markdown / Word / LaTeX / PDF。用于需要一次性产出较长、结构化文档的场景（如课程论文、章节总结、实验报告）。",
    inputSchema: documentSpecSchema,
    execute: async (input, { toolCallId }): Promise<WriteDocumentOutput> => {
      const validated = validateDocumentSpec(input);
      const spec = validated.ok ? validated.spec : (input as WriteDocumentInput);
      if (!validated.ok) {
        return {
          text: `文档参数校验未通过：${validated.error}。请修正后重新调用 writeDocument。`,
          documentId: `doc_${toolCallId}`,
          spec,
          unsupportedReason: validated.error,
        };
      }
      return {
        text: `长文档「${spec.title}」已生成任务卡片，将在前端分节生成。请用一句话说明这篇文档将帮助学生做什么，然后继续你的讲解。`,
        documentId: `doc_${toolCallId}`,
        spec,
        modelId: ctx.modelId,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
