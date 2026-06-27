import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAttempt, type QuizState } from "./quiz-store.ts";
import type { QuizQuestion, UserAnswer } from "@/lib/quiz/types";

function makeQuestion(id: string, points: number): QuizQuestion {
  return {
    id,
    type: "single_choice",
    stem: `题 ${id}`,
    options: ["A", "B", "C", "D"],
    answer: 0,
    points,
  } as QuizQuestion;
}

function makeState(results: { awarded: number; max: number; correct: boolean; objective: boolean; q: QuizQuestion }[], hintsUsed: string[] = []): QuizState {
  return {
    status: "ready",
    data: null,
    subjectId: "physics",
    chapterId: "ch01",
    loadedKey: "physics/ch01",
    errorMessage: null,
    phase: "scoring",
    currentIndex: 0,
    answers: {} as Record<string, UserAnswer>,
    hintsUsed,
    results: results.map((r) => ({
      question: r.q,
      answer: 0 as UserAnswer,
      awarded: r.awarded,
      max: r.max,
      correct: r.correct,
      objective: r.objective,
    })),
    load: async () => {},
    reset: () => {},
    setAnswer: () => {},
    useHint: () => {},
    goTo: () => {},
    next: () => {},
    prev: () => {},
    submit: () => {},
    setSelfScore: () => {},
    finishScoring: () => {},
    backToScoring: () => {},
    restart: () => {},
  } as unknown as QuizState;
}

test("buildAttempt：空 results 返回零分", () => {
  const state = makeState([]);
  const attempt = buildAttempt(state, "submitted");
  assert.equal(attempt.earned, 0);
  assert.equal(attempt.max, 0);
  assert.equal(attempt.percent, 0);
  assert.equal(attempt.hintsUsed, 0);
  assert.deepEqual(attempt.perQuestion, []);
});

test("buildAttempt：单题满分", () => {
  const q = makeQuestion("q1", 10);
  const state = makeState([{ awarded: 10, max: 10, correct: true, objective: true, q }]);
  const attempt = buildAttempt(state, "final");
  assert.equal(attempt.earned, 10);
  assert.equal(attempt.max, 10);
  assert.equal(attempt.percent, 100);
});

test("buildAttempt：多题聚合分", () => {
  const q1 = makeQuestion("q1", 10);
  const q2 = makeQuestion("q2", 20);
  const state = makeState([
    { awarded: 8, max: 10, correct: false, objective: true, q: q1 },
    { awarded: 15, max: 20, correct: false, objective: false, q: q2 },
  ]);
  const attempt = buildAttempt(state, "final");
  assert.equal(attempt.earned, 23);
  assert.equal(attempt.max, 30);
  // 23/30 = 0.7666... → round(76.66... * 10) / 10 = 76.7
  assert.equal(attempt.percent, 76.7);
});

test("buildAttempt：hintsUsed 计数", () => {
  const q = makeQuestion("q1", 10);
  const state = makeState([{ awarded: 10, max: 10, correct: true, objective: true, q }], ["q1", "q2"]);
  const attempt = buildAttempt(state, "submitted");
  assert.equal(attempt.hintsUsed, 2);
});

test("buildAttempt：perQuestion 结构正确", () => {
  const q1 = makeQuestion("q1", 10);
  const q2 = makeQuestion("q2", 20);
  const state = makeState([
    { awarded: 10, max: 10, correct: true, objective: true, q: q1 },
    { awarded: 12, max: 20, correct: false, objective: false, q: q2 },
  ]);
  const attempt = buildAttempt(state, "final");
  assert.equal(attempt.perQuestion.length, 2);
  assert.equal(attempt.perQuestion[0].id, "q1");
  assert.equal(attempt.perQuestion[0].correct, true);
  assert.equal(attempt.perQuestion[1].id, "q2");
  assert.equal(attempt.perQuestion[1].correct, null);
});

test("buildAttempt：stage 透传", () => {
  const state = makeState([]);
  assert.equal(buildAttempt(state, "submitted").stage, "submitted");
  assert.equal(buildAttempt(state, "final").stage, "final");
});
