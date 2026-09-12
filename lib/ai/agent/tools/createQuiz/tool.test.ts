import assert from "node:assert/strict";
import { test } from "node:test";
import { QUIZ_MAX_QUESTIONS } from "@/lib/ai/agent/quizTool";
import { createCreateQuizTool } from "./tool.ts";
import type { CreateQuizInput, CreateQuizOutput } from "./types.ts";

const execOpts = {
  toolCallId: "call_quiz",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

function choice(i: number) {
  return {
    type: "single_choice" as const,
    stem: `题干 ${i}`,
    options: ["对", "错"],
    answer: 0,
  };
}

test("createQuiz：12 道合法题全部保留", async () => {
  const input: CreateQuizInput = {
    title: "即时检验",
    intent: "check",
    questions: Array.from({ length: QUIZ_MAX_QUESTIONS }, (_, i) => choice(i + 1)),
  };
  const result = (await createCreateQuizTool().execute!(input, execOpts)) as CreateQuizOutput;
  assert.equal(result.questions.length, QUIZ_MAX_QUESTIONS);
  assert.equal(result.droppedCount, 0);
  assert.equal(result.quizId, "quiz_call_quiz");
  assert.match(result.text, /题目卡片/);
});

test("createQuiz：缺选项的选择题被丢弃", async () => {
  const input: CreateQuizInput = {
    title: "诊断",
    questions: [
      { type: "single_choice", stem: "不完整", options: ["只有一项"], answer: 0 },
      { type: "true_false", stem: "线粒体有膜", answer: 1 },
    ],
  };
  const result = (await createCreateQuizTool().execute!(input, execOpts)) as CreateQuizOutput;
  assert.equal(result.questions.length, 1);
  assert.equal(result.droppedCount, 1);
  assert.match(result.text, /被丢弃/);
});
