import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "撰写长文档",
  settingsLabel: "长文档撰写",
  description: "让 AI 分节撰写长文章/论文/报告，可导出 Markdown / Word / LaTeX / PDF",
  icon: "document",
  toggleable: true,
};
