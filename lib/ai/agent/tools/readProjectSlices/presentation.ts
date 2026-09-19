/** 无结果卡片：切片正文只进模型上下文。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "读取项目切片",
  settingsLabel: "项目切片",
  description: "按切片读项目文件正文（未携带的切片会提示用户点「带入对话」）",
  icon: "file",
  toggleable: false,
};