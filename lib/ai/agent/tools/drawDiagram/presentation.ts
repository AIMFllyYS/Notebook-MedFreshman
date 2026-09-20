/** 无结果卡片。有 UI 时放 `components/chat/toolCards/drawDiagramCard.tsx`。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.drawDiagram.label",
  settingsLabelKey: "trace.tool.drawDiagram.settingsLabel",
  descriptionKey: "trace.tool.drawDiagram.description",
  icon: "image",
  toggleable: true,
};
