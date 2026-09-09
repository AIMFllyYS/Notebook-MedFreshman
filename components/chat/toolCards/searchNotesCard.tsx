"use client";

import NoteCitationCard from "@/components/chat/NoteCitationCard";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

export default function SearchNotesResultCard({ part }: ResultCardProps<"searchNotes">) {
  if (part.state !== "output-available" || !part.output.hits?.length) return null;
  return <NoteCitationCard hits={part.output.hits} />;
}
