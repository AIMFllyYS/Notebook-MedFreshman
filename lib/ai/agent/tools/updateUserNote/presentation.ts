/** 无结果卡片：写回已打开的个人笔记编辑器。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "改写当前笔记",
  settingsLabel: "改写当前笔记",
  description: "学生从笔记窗打开助教后，把 markdown 写回这篇已打开的个人笔记",
  icon: "document",
  toggleable: false,
};
