"use client";

import DocumentCard from "@/components/chat/DocumentCard";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

export default function WriteDocumentResultCard({ part, isStreaming }: ResultCardProps<"writeDocument">) {
  if (part.state !== "output-available") return null;
  return (
    <DocumentCard
      documentId={part.output.documentId}
      spec={part.output.spec}
      modelId={part.output.modelId}
      unsupportedReason={part.output.unsupportedReason}
      autoStart={!!isStreaming}
    />
  );
}
