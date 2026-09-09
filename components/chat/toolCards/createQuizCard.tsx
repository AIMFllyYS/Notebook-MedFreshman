"use client";

import ChatQuizCard from "@/components/chat/ChatQuizCard";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

export default function CreateQuizResultCard({ part }: ResultCardProps<"createQuiz">) {
  if (part.state !== "output-available" || !part.output.questions?.length) return null;
  return (
    <ChatQuizCard
      title={part.output.title}
      questions={part.output.questions}
      intent={part.output.intent}
      droppedCount={part.output.droppedCount}
    />
  );
}
