/** 无结果卡片：切片正文只进模型上下文。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.readProjectSlices.label",
  settingsLabelKey: "trace.tool.readProjectSlices.settingsLabel",
  descriptionKey: "trace.tool.readProjectSlices.description",
  icon: "file",
  toggleable: false,
};
