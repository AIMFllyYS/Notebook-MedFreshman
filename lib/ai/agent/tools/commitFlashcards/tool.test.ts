import assert from "node:assert/strict";
import { test } from "node:test";
import { createCommitFlashcardsTool } from "./tool.ts";
import type { CommitFlashcardsOutput } from "./types.ts";

const execOpts = {
  toolCallId: "f1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("commitFlashcards keeps originalText for the review pipeline", async () => {
  const result = (await createCommitFlashcardsTool().execute!(
    {
      mode: "cloze",
      items: [{ originalText: "泊松分布的期望是 λ" }],
    },
    execOpts,
  )) as CommitFlashcardsOutput;
  assert.deepEqual(result.cardIds, ["card_f1_1"]);
  assert.equal(result.mode, "cloze");
  assert.equal(result.items[0]?.originalText, "泊松分布的期望是 λ");
  assert.match(result.text, /复习板/);
});
