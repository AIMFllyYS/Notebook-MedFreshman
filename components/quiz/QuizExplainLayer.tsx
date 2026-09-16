"use client";

import { useQuizExplain } from "@/lib/hooks/useQuizExplain";
import QuizExplainWindow from "@/components/quiz/QuizExplainWindow";

/** 渲染所有深度解析浮窗。挂在 AppShell，避免出题卡片随对话折叠时卸窗。 */
export default function QuizExplainLayer() {
  const windows = useQuizExplain((s) => s.windows);
  return (
    <>
      {windows.map((win) => (
        <QuizExplainWindow key={win.id} win={win} />
      ))}
    </>
  );
}
