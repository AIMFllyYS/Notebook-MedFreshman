/** 结果卡片：`components/chat/toolCards/searchNotesCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "检索笔记",
  settingsLabel: "全文检索",
  description: "让 AI 在全部课程笔记中按关键词检索",
  icon: "search",
  toggleable: true,
};
