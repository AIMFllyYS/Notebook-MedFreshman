/** 结果卡片：`components/chat/toolCards/webSearchCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "搜索网页",
  settingsLabel: "联网搜索",
  description: "需配置 Bocha key；联网获取实时信息",
  icon: "search",
  toggleable: true,
};
