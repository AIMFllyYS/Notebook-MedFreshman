import assert from "node:assert/strict";
import { test } from "node:test";
import { createCommitNotesTool } from "./tool.ts";
import type { CommitNotesOutput } from "./types.ts";

const execOpts = {
  toolCallId: "n1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("commitNotes hands title and markdown to the frontend", async () => {
  const tool = createCommitNotesTool();
  const description = typeof tool.description === "function" ? "" : (tool.description ?? "");
  assert.match(description, /有序列表/);
  assert.match(description, /短记忆提纲/);
  const result = (await tool.execute!(
    { title: "渗透压", markdown: "# 渗透压\n\n- 定义" },
    execOpts,
  )) as CommitNotesOutput;
  assert.equal(result.noteId, "note_n1");
  assert.equal(result.title, "渗透压");
  assert.match(result.markdown, /定义/);
  assert.match(result.text, /打开编辑器/);
});
