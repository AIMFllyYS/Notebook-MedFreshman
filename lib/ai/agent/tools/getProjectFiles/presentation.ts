/** 无结果卡片：项目文件索引只进模型上下文。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.getProjectFiles.label",
  settingsLabelKey: "trace.tool.getProjectFiles.settingsLabel",
  descriptionKey: "trace.tool.getProjectFiles.description",
  icon: "file",
  toggleable: false,
};
