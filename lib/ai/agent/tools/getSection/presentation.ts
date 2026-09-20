/** 无结果卡片。有 UI 时放 `components/chat/toolCards/getSectionCard.tsx`。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.getSection.label",
  settingsLabelKey: "trace.tool.getSection.settingsLabel",
  descriptionKey: "trace.tool.getSection.description",
  icon: "file",
  toggleable: true,
};
