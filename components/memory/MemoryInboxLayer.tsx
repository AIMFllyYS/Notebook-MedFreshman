"use client";

import { useEffect } from "react";
import MemoryProposalCloud from "@/components/memory/MemoryProposalCloud";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useMemoryInbox } from "@/lib/stores/memoryInbox";
import { collectMemoryToolEvents } from "@/lib/memory/memoryLoop";

export default function MemoryInboxLayer() {
  const messagesById = useChatHistory((s) => s.messagesById);
  const byId = useMemoryInbox((s) => s.byId);
  const order = useMemoryInbox((s) => s.order);

  useEffect(() => {
    const messages = Object.values(messagesById).flat();
    const { proposals, commits } = collectMemoryToolEvents(messages);
    const inbox = useMemoryInbox.getState();
    for (const proposal of proposals) inbox.ingestProposal(proposal);
    for (const commit of commits) inbox.ingestCommit(commit);
  }, [messagesById]);

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
