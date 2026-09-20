/** 无结果卡片。有 UI 时放 `components/chat/toolCards/getCurrentPageCard.tsx`。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.getCurrentPage.label",
  settingsLabelKey: "trace.tool.getCurrentPage.settingsLabel",
  descriptionKey: "trace.tool.getCurrentPage.description",
  icon: "file",
  toggleable: true,
};
