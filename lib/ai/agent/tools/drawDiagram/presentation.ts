/** 无结果卡片。有 UI 时放 `components/chat/toolCards/drawDiagramCard.tsx`。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "绘制图示",
  settingsLabel: "SVG 绘图",
  description: "让 AI 绘制矢量示意图（分子/电路/光路/几何等）",
  icon: "image",
  toggleable: true,
};
