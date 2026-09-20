/** 结果卡片：`components/chat/toolCards/createQuizCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.createQuiz.label",
  settingsLabelKey: "trace.tool.createQuiz.settingsLabel",
  descriptionKey: "trace.tool.createQuiz.description",
  icon: "quiz",
  toggleable: true,
};
