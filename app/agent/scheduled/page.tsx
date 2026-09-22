import type { Metadata } from "next";
import ScheduledTasksPage from "@/components/agent/scheduler/ScheduledTasksPage";
import { APP_NAME } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: `${APP_NAME} · Agent · 定时任务`,
};

export default function AgentScheduledPage() {
  return <ScheduledTasksPage />;
}
