import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCommitPrompt,
  collectMemoryToolEvents,
  memoryCommitOf,
  shouldAcceptProposal,
} from "./memoryLoop.ts";
import type { ChatMessage } from "@/lib/types/chat";

function message(id: string, parts: ChatMessage["parts"]): ChatMessage {
  return { id, role: "assistant", parts, timestamp: 1 };
}

test("memoryCommitOf maps propose kind to commit gate", () => {
  assert.equal(memoryCommitOf("note"), "note");
  assert.equal(memoryCommitOf("flashcard"), "flashcards");
});

test("shouldAcceptProposal rejects duplicate id and live same kind", () => {
  const incoming = {
    proposalId: "prop_1",
    toolCallId: "t1",
    messageId: "m1",
    kind: "note" as const,
    reason: "记住这个定义",
  };
  assert.equal(shouldAcceptProposal([], incoming, false), true);
  assert.equal(shouldAcceptProposal([], incoming, true), false);
  assert.equal(shouldAcceptProposal(["note"], incoming, false), false);
  assert.equal(shouldAcceptProposal(["flashcard"], incoming, false), true);
});

test("buildCommitPrompt asks for the matching commit tool", () => {
  assert.match(buildCommitPrompt("note", { title: "渗透压" }), /commitNotes/);
  assert.match(buildCommitPrompt("note", { title: "渗透压" }), /渗透压/);
  assert.match(buildCommitPrompt("note", { title: "渗透压" }), /不要再调用 proposeMemory/);
  assert.match(buildCommitPrompt("note", { title: "渗透压" }), /有序列表/);
  assert.match(buildCommitPrompt("note", { title: "渗透压" }), /短记忆提纲/);
  assert.match(buildCommitPrompt("note", { title: "渗透压" }), /不要写非常详细的 Markdown/);
  assert.match(buildCommitPrompt("flashcard", { mode: "cloze" }), /commitFlashcards/);
  assert.match(buildCommitPrompt("flashcard", { mode: "cloze" }), /cloze/);
  assert.match(buildCommitPrompt("flashcard", { mode: "cloze" }), /按约定模式/);
  assert.match(buildCommitPrompt("flashcard", { mode: "excerpt" }), /excerpt/);
});

test("collectMemoryToolEvents reads propose and commit outputs", () => {
  const events = collectMemoryToolEvents([
    message("a", [
      {
        type: "tool-proposeMemory",
        toolCallId: "p1",
        state: "output-available",
        input: { kind: "note", reason: "定义清楚了" },
        output: { text: "提议", proposalId: "prop_p1", kind: "note", reason: "定义清楚了" },
      },
    ]),
    message("b", [
      {
        type: "tool-commitNotes",
        toolCallId: "c1",
        state: "output-available",
        input: { title: "渗透压", markdown: "# 渗透压" },
        output: { text: "已写", noteId: "note_c1", title: "渗透压", markdown: "# 渗透压" },
      },
    ]),
  ]);
  assert.equal(events.proposals.length, 1);
  assert.equal(events.proposals[0]?.proposalId, "prop_p1");
  assert.equal(events.commits.length, 1);
  assert.equal(events.commits[0]?.kind, "note");
  assert.equal(events.commits[0]?.notes?.title, "渗透压");
});
