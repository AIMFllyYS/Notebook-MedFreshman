import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "检索笔记图片",
  settingsLabel: "笔记图片",
  description: "让 AI 检索并直接引用课程笔记里已有的插图",
  icon: "gallery",
  toggleable: true,
};
