/** 无结果卡片：前端走左侧通知云，不进对话产出框。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "提议沉淀",
  settingsLabel: "记忆提议",
  description: "对话里出现值得记住的定义/定理/步骤时，轻量提议整理成笔记或闪卡",
  icon: "document",
  toggleable: true,
};
