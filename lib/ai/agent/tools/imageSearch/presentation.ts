/** 结果卡片：`components/chat/toolCards/imageSearchCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "搜索图片",
  settingsLabel: "联网图片",
  description: "随联网搜索开关启用；从 Unsplash 搜索真实照片",
  icon: "search",
  toggleable: false,
};
