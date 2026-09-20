/** 结果卡片：`components/chat/toolCards/generateImageCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.generateImage.label",
  settingsLabelKey: "trace.tool.generateImage.settingsLabel",
  descriptionKey: "trace.tool.generateImage.description",
  icon: "image",
  toggleable: true,
};
