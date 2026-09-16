/** 无结果卡片：写回或删除个人笔记。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "改写笔记",
  settingsLabel: "改写笔记",
  description: "按 id 改写或删除个人笔记；正在编辑时也可直接写回当前篇",
  icon: "document",
  toggleable: false,
};
