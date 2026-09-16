import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useMemoryInbox } from "./memoryInbox.ts";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useStore } from "@/lib/stores/ui";

beforeEach(() => {
  useMemoryInbox.setState({ byId: {}, order: [], appliedCommitIds: [] });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ outbound: null });
});

test("ingestProposal opens a left-side memory cloud once per kind", () => {
  const event = {
    proposalId: "prop_1",
    toolCallId: "t1",
    messageId: "m1",
    kind: "note" as const,
    reason: "刚讲清了定义",
    titleHint: "渗透压",
  };
  useMemoryInbox.getState().ingestProposal(event);
  useMemoryInbox.getState().ingestProposal(event);
  useMemoryInbox.getState().ingestProposal({ ...event, proposalId: "prop_2", reason: "又来一次" });
  assert.deepEqual(useMemoryInbox.getState().order, ["prop_1"]);
  assert.equal(useMemoryInbox.getState().byId.prop_1?.status, "proposed");
  assert.ok(useWindowManager.getState().windows.some((win) => win.type === "memory-proposal"));
});

test("confirm sends a commit turn with memoryCommit=note", () => {
  useMemoryInbox.getState().ingestProposal({
    proposalId: "prop_1",
    toolCallId: "t1",
    messageId: "m1",
    kind: "note",
    reason: "值得记住",
    titleHint: "渗透压",
  });
  useMemoryInbox.getState().confirm("prop_1");
  assert.equal(useMemoryInbox.getState().byId.prop_1?.status, "committing");
  assert.equal(useStore.getState().outbound?.memoryCommit, "note");
  assert.match(useStore.getState().outbound?.content ?? "", /commitNotes/);
});
