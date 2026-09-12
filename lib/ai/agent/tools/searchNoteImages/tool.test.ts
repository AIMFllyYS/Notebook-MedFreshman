import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { createSearchNoteImagesTool, searchNoteImagesIo } from "./tool.ts";
import type { NoteImageHit, SearchNoteImagesOutput } from "./types.ts";

const ctx: StudyToolContext = {
  subjectId: "histology",
  categoryId: "textbook",
  itemId: "ch01-1",
  skills: [],
  academicYear: "sophomore-1",
};

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

const image: NoteImageHit = {
  src: "/images/histology/textbook/p0001.png",
  alt: "被覆上皮",
  caption: "被覆上皮",
  path: "histology/textbook/ch01-1",
  subjectId: "histology",
  categoryId: "textbook",
  itemId: "ch01-1",
  title: "组胚 > 教材 > 上皮",
  context: "单层扁平",
  score: 3,
};

test("searchNoteImages：默认当前学年并带 preferSubjectId", async (t) => {
  const filters: unknown[] = [];
  t.mock.method(searchNoteImagesIo, "searchNoteImages", (query: string, opts: object) => {
    filters.push({ query, ...opts });
    return [image];
  });
  const result = (await createSearchNoteImagesTool(ctx, createToolRuntime()).execute!(
    { query: "被覆上皮" },
    execOpts,
  )) as SearchNoteImagesOutput;
  assert.equal(result.images.length, 1);
  assert.match(result.text, /::figure/);
  assert.deepEqual(filters[0], {
    query: "被覆上皮",
    academicYear: "sophomore-1",
    subjectId: undefined,
    preferSubjectId: "histology",
    limit: undefined,
  });
});

test("searchNoteImages：无图时给换词提示；相同 query 去重", async (t) => {
  t.mock.method(searchNoteImagesIo, "searchNoteImages", () => []);
  const runtime = createToolRuntime();
  const tool = createSearchNoteImagesTool(ctx, runtime);
  const miss = (await tool.execute!({ query: "没有这张图" }, execOpts)) as SearchNoteImagesOutput;
  assert.match(miss.text, /未找到/);
  const again = (await tool.execute!({ query: "没有这张图" }, execOpts)) as SearchNoteImagesOutput;
  assert.equal(again.deduped, true);
});
