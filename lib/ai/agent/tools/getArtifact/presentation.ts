/** 无结果卡片。取回的 HTML 只进模型上下文，不另开演示卡。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "取回演示全文",
  settingsLabel: "取回演示全文",
  description: "按 id 取回此前生成的 HTML 演示全文（上下文里只保留摘要）",
  icon: "terminal",
  toggleable: false,
};
