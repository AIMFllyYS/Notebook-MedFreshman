import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "读取笔记章节",
  settingsLabel: "读取指定页面",
  description: "让 AI 调取任意科目的任意小节正文",
  icon: "file",
  toggleable: true,
};
