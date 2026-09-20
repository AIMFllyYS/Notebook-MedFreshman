/** 无结果卡片：确认后在通知云内展示过程，成功则打开笔记编辑器。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.commitNotes.label",
  settingsLabelKey: "trace.tool.commitNotes.settingsLabel",
  descriptionKey: "trace.tool.commitNotes.description",
  icon: "document",
  toggleable: false,
};
