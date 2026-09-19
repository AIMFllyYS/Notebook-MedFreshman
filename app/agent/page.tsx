import type { Metadata } from "next";
import AgentChatCenter from "@/components/agent/AgentChatCenter";
import { appModeTitle } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: appModeTitle("agent"),
};

export default function AgentPage() {
  return <AgentChatCenter />;
}
