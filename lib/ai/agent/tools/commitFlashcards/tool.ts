import { tool } from "ai";
import { z } from "zod";
import type { CommitFlashcardsOutput } from "@/lib/ai/agent/tools/commitFlashcards/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

const RECORD_MODES = ["excerpt", "cloze", "quiz", "custom"] as const;

export function createCommitFlashcardsTool() {
  return tool({
    description:
      "仅在学生已确认「整理成闪卡」之后调用。提交 1–8 条可测验原文，前端会走现有复习卡流水线（先落库原文，再按 excerpt/cloze/quiz/custom 成卡），并出现在科目复习板。不要在聊天正文里重复卡片内容。",
    inputSchema: z.object({
      mode: z.enum(RECORD_MODES).describe("excerpt 摘录 / cloze 挖空 / quiz 出题 / custom 自定义"),
      userInstruction: z.string().optional().describe("custom 模式的额外指令，或希望成卡时强调的点"),
      items: z
        .array(
          z.object({
            originalText: z.string().min(1).describe("一条可测验的原文/事实/步骤"),
            sourceLabel: z.string().optional().describe("人类可读出处"),
          }),
        )
        .min(1)
        .max(8),
      subjectId: z.string().optional().describe("绑定科目 id；省略则用当前科目"),
    }),
    execute: async (input, { toolCallId }): Promise<CommitFlashcardsOutput> => {
      const cardIds = input.items.map((_, index) => `card_${toolCallId}_${index + 1}`);
      return {
        text: `已提交 ${input.items.length} 条闪卡原文（模式 ${input.mode}），前端将写入复习板。请用一句话提示学生可以去复习，不要复述卡片。`,
        cardIds,
        mode: input.mode,
        userInstruction: input.userInstruction,
        items: input.items,
        subjectId: input.subjectId,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
