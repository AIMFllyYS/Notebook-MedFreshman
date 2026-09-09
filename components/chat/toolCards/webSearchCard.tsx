"use client";

import WebSourceFold from "@/components/chat/WebSourceFold";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

export default function WebSearchResultCard({ part }: ResultCardProps<"webSearch">) {
  if (part.state !== "output-available" || !part.output.sources?.length) return null;
  return <WebSourceFold sources={part.output.sources} cacheHit={part.output.cacheHit} />;
}
