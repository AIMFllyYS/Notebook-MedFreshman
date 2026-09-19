import type { Metadata } from "next";
import AgentPlaceholderPage from "@/components/agent/AgentPlaceholderPage";
import { AgentScheduleIcon } from "@/components/icons/AgentIcons";
import { APP_NAME } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: `${APP_NAME} · Agent · 定时任务`,
};

export default function AgentScheduledPage() {
  return (
    <AgentPlaceholderPage
      title="定时任务"
      description="让 Agent 按时间自己干活：什么时候整理、整理什么、结果放哪，都由你定。"
      plans={[
        "定时整理课堂笔记：下课时间一到，自动把当堂内容整理成提纲，写进对应科目。",
        "定时出闪卡：按遗忘曲线把这一周学过的内容分批生成复习卡。",
        "定时提醒与日报：每天固定时间汇总今天产生的笔记、闪卡与长文，推给你一份清单。",
      ]}
      icon={<AgentScheduleIcon size={26} />}
    />
  );
}
