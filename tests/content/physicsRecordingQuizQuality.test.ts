import assert from "node:assert/strict";
import { test } from "node:test";
import type { QuizData } from "@/lib/quiz/types";
import {
  PHYSICS_RECORDING_IDS,
  validatePhysicsRecordingQuiz,
} from "@/lib/quiz/physicsRecordingQuality";

function makeQuiz(overrides: Partial<QuizData> = {}): QuizData {
  return {
    subjectId: "physics",
    chapterId: "rec-01",
    generatedAt: "2026-06-29",
    examConfig: {
      source: "docs/sop/04-quiz-generation.md",
      totalPoints: 100,
      timeLimit: 50,
    },
    questions: [
      {
        id: "q001",
        type: "single_choice",
        difficulty: "basic",
        source: "current_chapter",
        sourceChapter: "rec-01",
        points: 2,
        stem: "质点做匀加速直线运动时，速度随时间变化的表达式是（  ）。",
        options: [
          "$v=v_0+at$",
          "$x=x_0+v_0t$",
          "$a=\\Delta x/\\Delta t$",
          "$v^2=v_0^2$",
        ],
        answer: 0,
        hint: "从加速度定义 $a=\\mathrm{d}v/\\mathrm{d}t$ 出发。",
        explanation:
          "1. 已知匀加速直线运动的加速度 $a$ 为常量。\n2. 由 $a=\\mathrm{d}v/\\mathrm{d}t$ 积分得 $v-v_0=at$。\n3. 因而 $v=v_0+at$。A 正确；B 是位移公式的一部分；C 把加速度误写成平均速度；D 少了位移项。",
        sourceRef: {
          path: "content/physics/recording/rec-01.md",
          label: "rec-01 · 说话人1 12:00 · 匀加速运动",
        },
      },
    ],
    summary: {
      totalQuestions: 1,
      byType: { single_choice: 1 },
      bySource: { current_chapter: 1 },
      byDifficulty: { basic: 1 },
    },
    ...overrides,
  };
}

test("PHYSICS_RECORDING_IDS：只覆盖当前存在的 25 讲", () => {
  assert.equal(PHYSICS_RECORDING_IDS.length, 25);
  assert.ok(PHYSICS_RECORDING_IDS.includes("rec-01"));
  assert.ok(PHYSICS_RECORDING_IDS.includes("rec-27"));
  assert.ok(!PHYSICS_RECORDING_IDS.includes("rec-05"));
  assert.ok(!PHYSICS_RECORDING_IDS.includes("rec-18"));
});

test("validatePhysicsRecordingQuiz：合格录音题库无错误", () => {
  const result = validatePhysicsRecordingQuiz(makeQuiz(), {
    filePath: "content/quiz/physics/rec-01.json",
    strictStyle: true,
  });
  assert.deepEqual(result.errors, []);
});

test("validatePhysicsRecordingQuiz：禁止题干依赖录音语境", () => {
  const quiz = makeQuiz();
  quiz.questions[0]!.stem = "根据录音内容，质点运动学中速度的定义是（  ）。";
  const result = validatePhysicsRecordingQuiz(quiz, {
    filePath: "content/quiz/physics/rec-01.json",
    strictStyle: true,
  });
  assert.match(result.errors.join("\n"), /题干含禁用录音依赖表达/);
});

test("validatePhysicsRecordingQuiz：严格模式禁止解析以老师口吻代替规范依据", () => {
  const quiz = makeQuiz();
  quiz.questions[0]!.explanation = "老师明确说过速度公式是 $v=v_0+at$，所以选 A。";
  const result = validatePhysicsRecordingQuiz(quiz, {
    filePath: "content/quiz/physics/rec-01.json",
    strictStyle: true,
  });
  assert.match(result.errors.join("\n"), /解析含口语化课堂依据/);
});

test("validatePhysicsRecordingQuiz：校验 sourceRef 指向当前物理录音文件", () => {
  const quiz = makeQuiz();
  quiz.questions[0]!.sourceRef = {
    path: "content/physics/detail/1.1.md",
    label: "1.1 运动学",
  };
  const result = validatePhysicsRecordingQuiz(quiz, {
    filePath: "content/quiz/physics/rec-01.json",
  });
  assert.match(result.errors.join("\n"), /sourceRef.path 应指向当前录音文件/);
});
