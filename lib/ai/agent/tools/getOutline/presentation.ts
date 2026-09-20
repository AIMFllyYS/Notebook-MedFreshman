/** 无结果卡片。有 UI 时放 `components/chat/toolCards/getOutlineCard.tsx`。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.getOutline.label",
  settingsLabelKey: "trace.tool.getOutline.settingsLabel",
  descriptionKey: "trace.tool.getOutline.description",
  icon: "file",
  toggleable: true,
};
