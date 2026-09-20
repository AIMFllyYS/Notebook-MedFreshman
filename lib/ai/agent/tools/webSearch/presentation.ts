/** 结果卡片：`components/chat/toolCards/webSearchCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.webSearch.label",
  settingsLabelKey: "trace.tool.webSearch.settingsLabel",
  descriptionKey: "trace.tool.webSearch.description",
  icon: "search",
  toggleable: true,
};
