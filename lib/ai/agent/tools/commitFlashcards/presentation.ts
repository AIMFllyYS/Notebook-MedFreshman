/** 无结果卡片：确认后走复习卡流水线，成功打开记录预览窗。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.commitFlashcards.label",
  settingsLabelKey: "trace.tool.commitFlashcards.settingsLabel",
  descriptionKey: "trace.tool.commitFlashcards.description",
  icon: "quiz",
  toggleable: false,
};
