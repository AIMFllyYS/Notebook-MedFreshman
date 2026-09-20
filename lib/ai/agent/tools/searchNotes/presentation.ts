/** 结果卡片：`components/chat/toolCards/searchNotesCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.searchNotes.label",
  settingsLabelKey: "trace.tool.searchNotes.settingsLabel",
  descriptionKey: "trace.tool.searchNotes.description",
  icon: "search",
  toggleable: true,
};
