/** 无结果卡片：写回或删除个人笔记。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.updateUserNote.label",
  settingsLabelKey: "trace.tool.updateUserNote.settingsLabel",
  descriptionKey: "trace.tool.updateUserNote.description",
  icon: "document",
  toggleable: false,
};
