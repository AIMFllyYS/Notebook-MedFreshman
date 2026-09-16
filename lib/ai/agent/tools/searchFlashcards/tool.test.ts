import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { createSearchFlashcardsTool } from "./tool.ts";
import type { SearchFlashcardsOutput } from "./types.ts";

const execOpts = {
  toolCallId: "f1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

function ctx(over: Partial<StudyToolContext> = {}): StudyToolContext {
  return {
    subjectId: "anatomy",
    categoryId: "textbook",
    itemId: "ch01-1",
    skills: [],
    academicYear: "sophomore-1",
    userNotes: [],
    flashcards: [
      {
        id: "c1",
        subjectId: "anatomy",
        sourceLabel: "系统解剖学 / 骨学",
        front: "长骨的分部",
        back: "骨干与骺",
        originalText: "长骨由骨干和骺构成",
        status: "ready",
      },
      {
        id: "c2",
        subjectId: "histology",
        sourceLabel: "组织学",
        front: "被覆上皮",
        back: "覆盖体表",
        originalText: "被覆上皮覆盖体表和管腔",
        status: "ready",
      },
    ],
    ...over,
  };
}

test("searchFlashcards 空查询只列 id，不 dump 背面", async () => {
  const result = (await createSearchFlashcardsTool(ctx(), createToolRuntime()).execute!(
    {},
    execOpts,
  )) as SearchFlashcardsOutput;
  assert.match(result.text, /c1/);
  assert.doesNotMatch(result.text, /骨干与骺/);
  assert.equal(result.hits[0]?.id, "c1");
});

test("searchFlashcards 按原文搜索再按 id 取全文", async () => {
  const tool = createSearchFlashcardsTool(ctx(), createToolRuntime());
  const listed = (await tool.execute!({ query: "骨干" }, execOpts)) as SearchFlashcardsOutput;
  assert.equal(listed.hits[0]?.id, "c1");
  const full = (await tool.execute!({ id: "c1" }, execOpts)) as SearchFlashcardsOutput;
  assert.match(full.text, /骨干与骺/);
  assert.match(full.text, /长骨由骨干和骺构成/);
  assert.equal(full.hits[0]?.id, "c1");
});

test("searchFlashcards 窗内无目录时拒绝翻库", async () => {
  const result = (await createSearchFlashcardsTool(
    ctx({
      flashcards: [],
      editingUserNote: { id: "n1", title: "当前篇", markdown: "稿" },
    }),
    createToolRuntime(),
  ).execute!({ query: "上皮" }, execOpts)) as SearchFlashcardsOutput;
  assert.match(result.text, /窗内笔记对话/);
});
