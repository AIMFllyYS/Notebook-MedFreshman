import type { Metadata } from "next";
import AgentWorkspace from "@/components/layout/AgentWorkspace";
import { appModeTitle } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: appModeTitle("agent"),
};

export default function AgentPage() {
  return <AgentWorkspace />;
}
