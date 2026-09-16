/** 无结果卡片：确认后在通知云内展示过程，成功则打开笔记编辑器。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "写入笔记",
  settingsLabel: "沉淀笔记",
  description: "学生确认后，把短要点提纲写入个人笔记并打开编辑器",
  icon: "document",
  toggleable: false,
};
