import assert from "node:assert/strict";
import { test } from "node:test";
import { createUpdateUserNoteTool } from "./tool.ts";
import type { UpdateUserNoteOutput } from "./types.ts";
import type { StudyToolContext } from "@/lib/ai/agent/tools/_shared.ts";

const execOpts = {
  toolCallId: "u1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

function ctx(over: Partial<StudyToolContext> = {}): StudyToolContext {
  return {
    subjectId: "anatomy",
    categoryId: "detail",
    itemId: "1.1",
    skills: [],
    academicYear: "sophomore-1",
    ...over,
  };
}

test("updateUserNote writes back the open note id, not a model-supplied id", async () => {
  const tool = createUpdateUserNoteTool(
    ctx({
      editingUserNote: { id: "note_open", title: "被覆上皮", markdown: "旧稿" },
    }),
  );
  const result = (await tool.execute!(
    { markdown: "# 被覆上皮\n\n1. 分类", title: "上皮组织" },
    execOpts,
  )) as UpdateUserNoteOutput;
  assert.equal(result.noteId, "note_open");
  assert.equal(result.applied, true);
  assert.match(result.markdown, /分类/);
  assert.equal(result.title, "上皮组织");
  assert.match(result.text, /写回编辑器/);
});

test("updateUserNote refuses to write when no personal note is open", async () => {
  const tool = createUpdateUserNoteTool(ctx());
  const result = (await tool.execute!({ markdown: "# 新稿" }, execOpts)) as UpdateUserNoteOutput;
  assert.equal(result.applied, false);
  assert.equal(result.noteId, "");
  assert.match(result.text, /没有打开的个人笔记/);
});
