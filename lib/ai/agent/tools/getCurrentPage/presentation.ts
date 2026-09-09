import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "阅读当前页面",
  settingsLabel: "读取当前页",
  description: "让 AI 获取你正在阅读的页面内容",
  icon: "file",
  toggleable: true,
};
