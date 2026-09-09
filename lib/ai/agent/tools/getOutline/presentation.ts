import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "查阅课程大纲",
  settingsLabel: "课程大纲",
  description: "让 AI 查看全部科目的章节大纲",
  icon: "file",
  toggleable: true,
};
