/** 结果卡片：`components/chat/toolCards/renderInteractiveCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "HTML 演示",
  settingsLabel: "HTML 演示",
  description: "生成可交互的 HTML 演示页（Artifact），在独立浮窗中打开",
  icon: "terminal",
  toggleable: true,
};
