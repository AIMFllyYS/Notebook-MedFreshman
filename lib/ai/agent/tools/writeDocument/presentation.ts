/** 结果卡片：`components/chat/toolCards/writeDocumentCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.writeDocument.label",
  settingsLabelKey: "trace.tool.writeDocument.settingsLabel",
  descriptionKey: "trace.tool.writeDocument.description",
  icon: "document",
  toggleable: true,
};
