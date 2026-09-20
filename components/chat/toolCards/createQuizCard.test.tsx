import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CreateQuizResultCard from "./createQuizCard";
import { useAppMode } from "@/lib/stores/appMode";
import { useWindowManager } from "@/lib/stores/windowManager";
import { resetAutoOpenedQuizzes } from "@/lib/quiz-dock/open";
import type { ChatMessage } from "@/lib/types/chat";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";
import type { QuizQuestion } from "@/lib/quiz/types";

vi.mock("@/components/quiz/QuizQuestion", () => ({
  default: ({ question }: { question: QuizQuestion }) => <div>{question.stem}</div>,
}));

const message = { id: "m", role: "assistant", timestamp: 1, parts: [] } as ChatMessage;

function quizPart(): ToolPart<"createQuiz"> {
  return {
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
}

function renderCard() {
  render(<CreateQuizResultCard part={quizPart()} message={message} isStreaming={false} ctx={{ isStreaming: false }} />);
}

function windows() {
  return useWindowManager.getState().windows;
}

beforeEach(() => {
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  resetAutoOpenedQuizzes();
  useAppMode.setState({ mode: "studio" });
});

afterEach(() => {
  cleanup();
  useAppMode.setState({ mode: "studio" });
});

describe("createQuiz ResultCard", () => {
  it("renders quiz fold title", () => {
    renderCard();
    expect(screen.getByText(/即时检验 · 1 题/)).toBeVisible();
    expect(windows()).toHaveLength(0);
  });

  it("shows a slim row and auto-opens the right dock on the Agent surface", () => {
    useAppMode.setState({ mode: "agent" });
    renderCard();

    expect(screen.getByTestId("chat-quiz-agent-row")).toBeVisible();
    expect(screen.getByText(/已出题 · 1 题/)).toBeVisible();
    expect(screen.queryByTestId("chat-quiz-card")).not.toBeInTheDocument();

    const [win] = windows();
    expect(win.type).toBe("quiz-dock");
    expect(win.id).toBe("quiz-dock:quiz_1");
    expect(win.data).toMatchObject({ quizId: "quiz_1", title: "即时检验", intent: "check" });
  });

  it("reopens the dock window from 在右侧作答 after the user closed it", () => {
    useAppMode.setState({ mode: "agent" });
    renderCard();
    useWindowManager.getState().closeWindow("quiz-dock:quiz_1");
    expect(windows()).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "在右侧作答" }));
    expect(windows().map((win) => win.id)).toEqual(["quiz-dock:quiz_1"]);
  });

  it("does not auto-open the same quiz again when the card remounts", () => {
    useAppMode.setState({ mode: "agent" });
    renderCard();
    useWindowManager.getState().closeWindow("quiz-dock:quiz_1");
    cleanup();

    renderCard();
    expect(screen.getByTestId("chat-quiz-agent-row")).toBeVisible();
    expect(windows()).toHaveLength(0);
  });
});
