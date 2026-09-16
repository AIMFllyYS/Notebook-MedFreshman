import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { createSearchNotesTool, searchNotesIo } from "./tool.ts";
import type { SearchNotesOutput } from "./types.ts";

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

function ctx(over: Partial<StudyToolContext> = {}): StudyToolContext {
  return {
    subjectId: "histology",
    categoryId: "textbook",
    itemId: "ch01-1",
    skills: [],
    academicYear: "sophomore-1",
    userNotes: [
      { id: "n1", title: "被覆上皮", markdown: "单层扁平上皮覆盖血管内膜。", subjectId: "histology", updatedAt: 2 },
      { id: "n2", title: "骨学", markdown: `长骨由骨干和骺构成。\n\n${"铺垫。".repeat(40)}\n\n## 细节\n这篇很长，列表阶段不该出现这一段。`, subjectId: "anatomy", updatedAt: 1 },
    ],
    flashcards: [],
    ...over,
  };
}

test("searchNotes：scope=personal 先列表不 dump 全文", async () => {
  const result = (await createSearchNotesTool(ctx(), createToolRuntime()).execute!(
    { scope: "personal" },
    execOpts,
  )) as SearchNotesOutput;
  assert.match(result.text, /n1/);
  assert.match(result.text, /被覆上皮/);
  assert.doesNotMatch(result.text, /覆盖血管内膜/);
  assert.equal(result.hits[0]?.kind, "personal");
  assert.equal(result.hits[0]?.noteId, "n1");
});

test("searchNotes：按正文找到个人笔记后再按 id 取全文", async (t) => {
  t.mock.method(searchNotesIo, "getIndexHealth", () => ({
    ok: true,
    reason: "",
    manifest: null,
    contentHashMatch: true,
    embeddingReachable: true,
  }));
  t.mock.method(searchNotesIo, "searchAllContent", async () => []);
  t.mock.method(searchNotesIo, "findContentItem", () => undefined);
  const tool = createSearchNotesTool(ctx(), createToolRuntime());
  const listed = (await tool.execute!({ query: "骨干", scope: "personal" }, execOpts)) as SearchNotesOutput;
  assert.equal(listed.hits[0]?.noteId, "n2");
  assert.doesNotMatch(listed.text, /列表阶段不该出现这一段/);

  const full = (await tool.execute!({ id: "n2", scope: "personal" }, execOpts)) as SearchNotesOutput;
  assert.match(full.text, /列表阶段不该出现这一段/);
  assert.equal(full.hits[0]?.noteId, "n2");
});

test("searchNotes：窗内无目录时不翻整库", async () => {
  const result = (await createSearchNotesTool(
    ctx({
      userNotes: [],
      editingUserNote: { id: "n1", title: "被覆上皮", markdown: "旧稿" },
    }),
    createToolRuntime(),
  ).execute!({ scope: "personal" }, execOpts)) as SearchNotesOutput;
  assert.match(result.text, /窗内笔记对话/);
  assert.equal(result.hits.length, 0);
});

test("searchNotes：scope=all 合并课堂与个人，课堂无命中仍保留个人", async (t) => {
  t.mock.method(searchNotesIo, "getIndexHealth", () => ({
    ok: true,
    reason: "",
    manifest: null,
    contentHashMatch: true,
    embeddingReachable: true,
  }));
  t.mock.method(searchNotesIo, "searchAllContent", async () => []);
  t.mock.method(searchNotesIo, "findContentItem", () => undefined);
  const result = (await createSearchNotesTool(ctx(), createToolRuntime()).execute!(
    { query: "被覆上皮" },
    execOpts,
  )) as SearchNotesOutput;
  assert.match(result.text, /个人笔记/);
  assert.equal(result.hits.some((hit) => hit.noteId === "n1"), true);
});
