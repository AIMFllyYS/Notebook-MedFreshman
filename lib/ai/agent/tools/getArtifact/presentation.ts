/** 无结果卡片。取回的 HTML 只进模型上下文，不另开演示卡。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.getArtifact.label",
  settingsLabelKey: "trace.tool.getArtifact.settingsLabel",
  descriptionKey: "trace.tool.getArtifact.description",
  icon: "terminal",
  toggleable: false,
};
