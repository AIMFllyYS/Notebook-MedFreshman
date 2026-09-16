import assert from "node:assert/strict";
import { test } from "node:test";
import { formatQuestionContext, QUIZ_EXPLAIN_SEED_PROMPT } from "./formatQuestionContext.ts";
import type { QuizQuestion } from "./types.ts";

function makeQ(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "q1",
    type: "single_choice",
    difficulty: "medium",
    source: "current_chapter",
    points: 10,
    stem: "下列哪项正确？",
    answer: 1,
    options: ["甲", "乙", "丙"],
    explanation: "乙对应课堂定义。",
    ...overrides,
  };
}

test("formatQuestionContext：选择题含题干、选项、参考答案与已有解析", () => {
  const text = formatQuestionContext(makeQ());
  assert.match(text, /题型：单选题/);
  assert.match(text, /下列哪项正确？/);
  assert.match(text, /A\. 甲/);
  assert.match(text, /B\. 乙/);
  assert.match(text, /参考答案：B/);
  assert.match(text, /已有解析：\n乙对应课堂定义。/);
});

test("formatQuestionContext：无解析时写明暂无，不丢题干", () => {
  const text = formatQuestionContext(makeQ({ explanation: undefined }));
  assert.match(text, /已有解析：（本题暂无现成解析）/);
  assert.match(text, /下列哪项正确？/);
});

test("formatQuestionContext：判断 / 辨析写正确或错误", () => {
  assert.match(formatQuestionContext(makeQ({ type: "true_false", options: undefined, answer: 1 })), /参考答案：正确/);
  assert.match(formatQuestionContext(makeQ({ type: "analysis", options: undefined, answer: 0, reasoning: "命题不成立" })), /参考答案：错误/);
  assert.match(formatQuestionContext(makeQ({ type: "analysis", options: undefined, answer: 0, reasoning: "命题不成立" })), /参考理由：\n命题不成立/);
});

test("formatQuestionContext：阅读理解带材料与小题", () => {
  const text = formatQuestionContext(makeQ({
    type: "reading",
    options: undefined,
    answer: "",
    passage: "原文一段。",
    subQuestions: [{
      id: "s1",
      type: "single_choice",
      stem: "作者意图？",
      options: ["叙述", "议论"],
      answer: 0,
      explanation: "开篇即叙事",
      points: 2,
    }],
  }));
  assert.match(text, /材料：\n原文一段。/);
  assert.match(text, /作者意图？/);
  assert.match(text, /子题解析：开篇即叙事/);
});

test("QUIZ_EXPLAIN_SEED_PROMPT 要求独立解答且不照抄", () => {
  assert.match(QUIZ_EXPLAIN_SEED_PROMPT, /独立解答/);
  assert.match(QUIZ_EXPLAIN_SEED_PROMPT, /不要照抄/);
});
