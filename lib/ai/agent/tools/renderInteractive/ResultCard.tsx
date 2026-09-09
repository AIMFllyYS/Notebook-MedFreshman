"use client";

import ArtifactCard from "@/components/chat/ArtifactCard";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

export default function RenderInteractiveResultCard({ part, isStreaming }: ResultCardProps<"renderInteractive">) {
  if (part.state !== "output-available") return null;
  return (
    <ArtifactCard
      artifactId={part.output.artifactId}
      title={part.output.title}
      prompt={part.output.prompt}
      modelId={part.output.modelId}
      unsupportedReason={part.output.unsupportedReason}
      autoStart={!!isStreaming}
    />
  );
}
