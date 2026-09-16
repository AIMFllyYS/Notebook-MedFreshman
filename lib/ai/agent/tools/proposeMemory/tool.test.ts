import assert from "node:assert/strict";
import { test } from "node:test";
import { createProposeMemoryTool } from "./tool.ts";
import type { ProposeMemoryOutput } from "./types.ts";

const execOpts = {
  toolCallId: "p1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("proposeMemory returns a proposal and tells the model to wait", async () => {
  const result = (await createProposeMemoryTool().execute!(
    { kind: "note", reason: "刚讲清了渗透压定义" },
    execOpts,
  )) as ProposeMemoryOutput;
  assert.equal(result.proposalId, "prop_p1");
  assert.equal(result.kind, "note");
  assert.match(result.text, /等待学生/);
  assert.doesNotMatch(result.text, /已写入/);
});
