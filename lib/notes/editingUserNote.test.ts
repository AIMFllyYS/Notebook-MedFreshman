import assert from "node:assert/strict";
import { test } from "node:test";
import { EDITING_NOTE_CONTEXT_MAX_CHARS, formatEditingUserNoteContext } from "./editingUserNote.ts";

test("formatEditingUserNoteContext includes id, title, markdown and the writeback tool", () => {
  const text = formatEditingUserNoteContext({
    id: "note_1",
    title: "被覆上皮",
    markdown: "# 被覆上皮\n\n1. 分类",
  });
  assert.match(text, /正在编辑的个人笔记/);
  assert.match(text, /id=note_1/);
  assert.match(text, /被覆上皮/);
  assert.match(text, /updateUserNote/);
  assert.match(text, /1\. 分类/);
  assert.match(text, /不要调用 commitNotes 或 writeDocument 另开一篇/);
});

test("formatEditingUserNoteContext truncates long markdown", () => {
  const text = formatEditingUserNoteContext({
    id: "note_long",
    title: "",
    markdown: "字".repeat(EDITING_NOTE_CONTEXT_MAX_CHARS + 20),
  });
  assert.match(text, /无标题笔记/);
  assert.match(text, /已截断/);
  assert.ok(text.length < EDITING_NOTE_CONTEXT_MAX_CHARS + 400);
});
