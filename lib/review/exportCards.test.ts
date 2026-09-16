import assert from "node:assert/strict";
import { test } from "node:test";
import { flashcardToMarkdown, flashcardsToCsv } from "./exportCards.ts";
import type { ReviewCard } from "@/lib/review/types";

const card: ReviewCard = {
  id: "c1",
  subjectId: "probability",
  sourceLabel: "概率论 / 详解 / 2.3",
  originalText: "泊松分布的期望是 λ",
  mode: "cloze",
  cardType: "cloze",
  front: "泊松分布的期望是 ____",
  back: "λ",
  explanation: "母函数",
  status: "ready",
  createdAt: 1,
};

test("flashcardsToCsv quotes commas and keeps Chinese headers", () => {
  const csv = flashcardsToCsv([card]);
  assert.match(csv, /^正面,背面,出处,模式,原文,解析/);
  assert.match(csv, /泊松分布的期望是 ____/);
  assert.match(csv, /母函数/);
  const messy = flashcardsToCsv([{ ...card, back: "λ, μ", explanation: '说"期望"' }]);
  assert.match(messy, /"λ, μ"/);
  assert.match(messy, /"说""期望"""/);
});

test("flashcardToMarkdown includes front, back and explanation", () => {
  const md = flashcardToMarkdown(card);
  assert.match(md, /## 正面/);
  assert.match(md, /泊松分布的期望是 ____/);
  assert.match(md, /## 背面/);
  assert.match(md, /## 解析/);
  assert.match(md, /出处：概率论 \/ 详解 \/ 2.3/);
});
