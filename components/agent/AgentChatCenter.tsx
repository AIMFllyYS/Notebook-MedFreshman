"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import { useAgentChatContext } from "@/lib/hooks/useAgentChatContext";

/** Agent 中央对话（`/agent` 的内容）。左栏与右侧工作区分别由 AgentShell / AppShell 承载。 */
export default function AgentChatCenter() {
  const chatContext = useAgentChatContext();
  return <ChatPanel chatContext={chatContext} hideHeader emptyLayout="agent" />;
}
