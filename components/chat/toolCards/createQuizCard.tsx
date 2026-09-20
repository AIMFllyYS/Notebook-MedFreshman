"use client";

import { useEffect } from "react";
import ChatQuizCard from "@/components/chat/ChatQuizCard";
import { AgentQuizIcon } from "@/components/icons/AgentIcons";
import { openAgentQuiz } from "@/lib/quiz-dock/open";
import { useIsAgentSurface } from "@/lib/window/useManagedWindowSurface";
import { useT } from "@/lib/i18n";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

/**
 * createQuiz 结果卡。
 * - Studio / 非 Agent 面：原来的折叠答题卡（`ChatQuizCard`），行为不变。
 * - Agent 面：对话流里只留一条瘦行，题目本体进右栏出题窗（`quiz-dock`）。
 *   挂载即自动打开一次，靠 `lib/quiz-dock/open.ts` 的 sessionStorage 集合保证
 *   「同会话同 quizId 只自动弹一次」——刷新后历史对话里的旧题不会再弹。
 */
export default function CreateQuizResultCard({ part }: ResultCardProps<"createQuiz">) {
  const t = useT();
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

  if (!output) return null;

  if (!isAgentSurface) {
    return (
      <ChatQuizCard
        title={output.title}
        questions={output.questions}
        intent={output.intent}
        droppedCount={output.droppedCount}
      />
    );
  }

  return (
    <div
      className="chat-quiz-agent-row agent-fold my-3 flex min-w-0 items-center gap-2 px-3 py-2"
      data-testid="chat-quiz-agent-row"
    >
      <AgentQuizIcon size={16} className="shrink-0" />
      <span className="min-w-0 truncate text-[13px] text-[var(--md-sys-color-on-surface)]">
        {t("agent.quiz.dock.created", { count: output.questions.length })}
      </span>
      <button
        type="button"
        onClick={() =>
          openAgentQuiz({
            quizId: output.quizId,
            title: output.title,
            intent: output.intent,
            questions: output.questions,
            droppedCount: output.droppedCount,
          })
        }
        className="ml-auto shrink-0 rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-primary)]"
      >
        {t("agent.quiz.dock.open")}
      </button>
    </div>
  );
}
