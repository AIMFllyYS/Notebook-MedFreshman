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
    userNotes: [],
    flashcards: [],
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
  assert.equal(result.action, "update");
  assert.match(result.markdown, /分类/);
  assert.equal(result.title, "上皮组织");
  assert.match(result.text, /写回/);
});

test("updateUserNote refuses to write when no personal note is open or listed", async () => {
  const tool = createUpdateUserNoteTool(ctx());
  const result = (await tool.execute!({ markdown: "# 新稿" }, execOpts)) as UpdateUserNoteOutput;
  assert.equal(result.applied, false);
  assert.equal(result.noteId, "");
  assert.match(result.text, /没有可写回的个人笔记/);
});

test("updateUserNote can update or delete a catalog note by id", async () => {
  const tool = createUpdateUserNoteTool(
    ctx({
      userNotes: [{ id: "n2", title: "骨学", markdown: "旧", subjectId: "anatomy", updatedAt: 1 }],
    }),
  );
  const updated = (await tool.execute!(
    { noteId: "n2", markdown: "# 长骨" },
    execOpts,
  )) as UpdateUserNoteOutput;
  assert.equal(updated.applied, true);
  assert.equal(updated.noteId, "n2");
  assert.equal(updated.markdown, "# 长骨");

  const removed = (await tool.execute!({ noteId: "n2", action: "delete" }, execOpts)) as UpdateUserNoteOutput;
  assert.equal(removed.applied, true);
  assert.equal(removed.action, "delete");
  assert.equal(removed.noteId, "n2");
});
