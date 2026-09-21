"use client";

import { useEffect } from "react";
import ChatQuizCard from "@/components/chat/ChatQuizCard";
import { openAgentQuiz } from "@/lib/quiz-dock/open";
import { useIsAgentSurface } from "@/lib/window/useManagedWindowSurface";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

/**
 * createQuiz 结果卡。
 * - Studio / 非 Agent 面：原来的折叠答题卡（`ChatQuizCard`），行为不变。
 * - Agent 面：中间栏不渲染任何「已出题 / 到右侧作答」提示；题目进右栏出题窗，
 *   入口改挂右上参考列。挂载仍自动打开一次，靠 `lib/quiz-dock/open.ts`
 *   的 sessionStorage 集合保证「同会话同 quizId 只自动弹一次」。
 */
export default function CreateQuizResultCard({ part }: ResultCardProps<"createQuiz">) {
  const isAgentSurface = useIsAgentSurface();
  const output =
    part.state === "output-available" && part.output.questions?.length ? part.output : null;

  useEffect(() => {
    if (!isAgentSurface || !output) return;
    openAgentQuiz(
      {
        quizId: output.quizId,
        title: output.title,
        intent: output.intent,
        questions: output.questions,
        droppedCount: output.droppedCount,
      },
      { auto: true },
    );
  }, [isAgentSurface, output]);

  if (!output || isAgentSurface) return null;

  return (
    <ChatQuizCard
      title={output.title}
      questions={output.questions}
      intent={output.intent}
      droppedCount={output.droppedCount}
    />
  );
}
