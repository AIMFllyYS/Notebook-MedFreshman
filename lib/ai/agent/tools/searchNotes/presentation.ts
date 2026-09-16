/** 结果卡片：`components/chat/toolCards/searchNotesCard.tsx` */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "检索笔记",
  settingsLabel: "全文检索",
  description: "让 AI 在课堂笔记和个人笔记中按标题/正文/科目检索；先列表再按 id 取全文",
  icon: "search",
  toggleable: true,
};
