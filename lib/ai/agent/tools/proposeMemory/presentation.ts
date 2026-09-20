/** 无结果卡片：前端走左侧通知云，不进对话产出框。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.proposeMemory.label",
  settingsLabelKey: "trace.tool.proposeMemory.settingsLabel",
  descriptionKey: "trace.tool.proposeMemory.description",
  icon: "document",
  toggleable: true,
};
