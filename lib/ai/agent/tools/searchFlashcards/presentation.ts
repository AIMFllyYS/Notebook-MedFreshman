import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "检索闪卡",
  settingsLabel: "闪卡检索",
  description: "让 AI 在现有复习闪卡中按正反面/原文/科目查找，先列表再按 id 引用分析",
  icon: "search",
  toggleable: true,
};
