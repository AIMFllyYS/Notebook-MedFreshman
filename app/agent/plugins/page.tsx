import type { Metadata } from "next";
import AgentPluginsPage from "@/components/agent/plugins/AgentPluginsPage";
import { APP_NAME } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: `${APP_NAME} · Agent · 插件市场`,
};

export default function AgentPluginsRoute() {
  return <AgentPluginsPage />;
}
