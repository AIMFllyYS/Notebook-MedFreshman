"use client";

import { useEffect } from "react";
import MemoryProposalCloud from "@/components/memory/MemoryProposalCloud";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { syncMemoryInboxFromSessions, useMemoryInbox } from "@/lib/stores/memoryInbox";

export default function MemoryInboxLayer() {
  const messagesById = useChatHistory((s) => s.messagesById);
  const hydrated = useChatHistory((s) => s._hasHydrated);
  const ready = useChatHistory((s) => s._activeMessagesReady);
  const byId = useMemoryInbox((s) => s.byId);
  const order = useMemoryInbox((s) => s.order);

  useEffect(() => {
    if (!hydrated || !ready) return;
    syncMemoryInboxFromSessions(messagesById);
  }, [hydrated, ready, messagesById]);

  const visible = order
    .map((id) => byId[id])
    .filter((item) => item && item.status !== "dismissed");

  return (
    <>
      {visible.map((proposal) => (
        <MemoryProposalCloud key={proposal.id} proposal={proposal} />
      ))}
    </>
  );
}
