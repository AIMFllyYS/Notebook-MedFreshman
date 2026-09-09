import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "出题",
  settingsLabel: "结构化出题",
  description: "让 AI 用题库组件出可作答、可判分的题目（替代折叠文本）",
  icon: "quiz",
  toggleable: true,
};
