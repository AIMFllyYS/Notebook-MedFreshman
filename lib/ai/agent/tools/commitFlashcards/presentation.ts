/** 无结果卡片：确认后走复习卡流水线，成功打开记录预览窗。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "写入闪卡",
  settingsLabel: "沉淀闪卡",
  description: "学生确认后，把可测验条目写入复习板（摘录/挖空/出题/自定义）",
  icon: "quiz",
  toggleable: false,
};
