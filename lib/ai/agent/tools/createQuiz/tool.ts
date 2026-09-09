import { tool } from "ai";
import { createQuizInputSchema, normalizeQuiz, describeQuizForModel } from "@/lib/ai/agent/quizTool";
import type { CreateQuizInput, CreateQuizOutput } from "@/lib/ai/agent/tools/createQuiz/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

export function createCreateQuizTool() {
  return tool({
    description:
      "把即时检验题/诊断题/练习题/章节小测渲染为可作答的题目卡片。调用后前端直接展示结构化题目，学生可作答、查看提示、提交后自动判分并查看解析。不要再在正文里重复题干、选项、提示或答案。",
    inputSchema: createQuizInputSchema,
    execute: async (input, { toolCallId }): Promise<CreateQuizOutput> => {
      const quizId = `quiz_${toolCallId}`;
      const normalized = normalizeQuiz(input as CreateQuizInput, quizId);
      return {
        text: describeQuizForModel(input.title, normalized),
        quizId,
        title: input.title,
        intent: input.intent ?? "practice",
        questions: normalized.questions,
        droppedCount: normalized.droppedCount,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
