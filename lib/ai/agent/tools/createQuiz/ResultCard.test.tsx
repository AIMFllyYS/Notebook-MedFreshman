import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CreateQuizResultCard from "./ResultCard";
import type { ChatMessage } from "@/lib/types/chat";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";
import type { QuizQuestion } from "@/lib/quiz/types";

vi.mock("@/components/quiz/QuizQuestion", () => ({
  default: ({ question }: { question: QuizQuestion }) => <div>{question.stem}</div>,
}));

afterEach(() => cleanup());

const message = { id: "m", role: "assistant", timestamp: 1, parts: [] } as ChatMessage;

describe("createQuiz ResultCard", () => {
  it("renders quiz fold title", () => {
    const part = {
      type: "tool-createQuiz",
      toolCallId: "c1",
      state: "output-available",
      input: { title: "即时检验", questions: [] },
      output: {
        text: "…",
        quizId: "quiz_1",
        title: "即时检验",
        intent: "check",
        droppedCount: 0,
        questions: [{
          id: "q1",
          type: "single_choice",
          difficulty: "basic",
          source: "current_chapter",
          points: 2,
          stem: "第一题",
          options: ["甲", "乙"],
          answer: 0,
        }],
      },
    } as ToolPart<"createQuiz">;
    render(<CreateQuizResultCard part={part} message={message} isStreaming={false} ctx={{ isStreaming: false }} />);
    expect(screen.getByText(/即时检验 · 1 题/)).toBeVisible();
  });
});
