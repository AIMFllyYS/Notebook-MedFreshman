import type { Metadata } from "next";
import AgentAssetsPage from "@/components/agent/AgentAssetsPage";
import { APP_NAME } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: `${APP_NAME} · Agent · 我的资产`,
};

export default function AgentAssetsRoute() {
  return <AgentAssetsPage />;
}