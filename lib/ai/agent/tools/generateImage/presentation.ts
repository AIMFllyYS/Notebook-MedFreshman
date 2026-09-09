import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "准备生成图片",
  settingsLabel: "AI 生图",
  description: "让 AI 生成图片（需用户批准，优先 SVG，仅必要时使用）",
  icon: "image",
  toggleable: true,
};
