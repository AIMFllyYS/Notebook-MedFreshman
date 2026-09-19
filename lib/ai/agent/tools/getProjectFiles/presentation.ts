/** 无结果卡片：项目文件索引只进模型上下文。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "查看项目文件索引",
  settingsLabel: "项目文件",
  description: "查看项目文件的文件树与切片索引（正文用 readProjectSlices 按需读）",
  icon: "file",
  toggleable: false,
};