import { tool } from "ai";
import { z } from "zod";
import type { ProposeMemoryOutput } from "@/lib/ai/agent/tools/proposeMemory/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

const RECORD_MODES = ["excerpt", "cloze", "quiz", "custom"] as const;

export function createProposeMemoryTool() {
  return tool({
    description:
      "轻量提议：当这次对话产出了值得及时复习的要点时调用。只提议，不要在这里写完整笔记或闪卡。前端会在 AI 面板左侧弹出通知云，等学生确认后再调用 commitNotes / commitFlashcards。同一轮对话每种 kind 最多提议一次，不要刷屏。kind=note 表示短记忆提纲（有序列表/表格，不是讲义），kind=flashcard 表示可测验记忆卡。",
    inputSchema: z.object({
      kind: z.enum(["note", "flashcard"]).describe("note=短复习提纲；flashcard=可测验闪卡"),
      reason: z.string().min(1).describe("一句话说明为什么值得记住"),
      titleHint: z.string().optional().describe("笔记标题或闪卡主题的简短建议"),
      suggestedMode: z.enum(RECORD_MODES).optional().describe("闪卡建议模式：摘录/挖空/出题/自定义"),
    }),
    execute: async (input, { toolCallId }): Promise<ProposeMemoryOutput> => {
      const proposalId = `prop_${toolCallId}`;
      const kindLabel = input.kind === "note" ? "笔记" : "闪卡";
      return {
        text: `已向学生提议把这次对话整理成${kindLabel}：${input.reason}。等待学生在通知云确认；确认前不要调用 commitNotes / commitFlashcards。`,
        proposalId,
        kind: input.kind,
        reason: input.reason,
        titleHint: input.titleHint,
        suggestedMode: input.suggestedMode,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
