import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { useMemoryInbox } from "./memoryInbox.ts";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useStore } from "@/lib/stores/ui";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useUserNotes } from "@/lib/stores/userNotes";
import { setNoteCommitRunnerForTests, type RunNoteCommitInput } from "@/lib/memory/runNoteCommit";
import { createAssistantPlaceholder } from "@/lib/chat/messageParts";
import { DEFAULT_SUBJECT } from "@/lib/constants/subjects";
import type { ChatMessage } from "@/lib/types/chat";

function noteCommitMessage(title: string): ChatMessage {
  return {
    ...createAssistantPlaceholder("side-a", {}),
    parts: [
      {
        type: "tool-commitNotes",
        toolCallId: "c1",
        state: "output-available",
        input: { title, markdown: "1. 定义" },
        output: { text: "ok", noteId: "note_c1", title, markdown: "1. 定义" },
      },
    ],
  };
}

beforeEach(() => {
  useMemoryInbox.setState({ byId: {}, order: [], appliedCommitIds: [] });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ outbound: null, activeSubjectId: DEFAULT_SUBJECT, activeCategoryId: "detail", activeItemId: "1.1" });
  useUserNotes.setState({
    byId: {},
    order: [],
    openEditorIds: [],
    libraryOpen: false,
    libraryIntent: "browse",
    librarySubjectId: null,
  });
  useChatHistory.setState({
    activeSessionId: "main",
    messagesById: {
      main: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "什么是渗透压？" }], timestamp: 1 },
        { id: "m1", role: "assistant", parts: [{ type: "text", text: "定义清楚了" }], timestamp: 2 },
      ],
    },
  });
  setNoteCommitRunnerForTests(async (input: RunNoteCommitInput) => {
    const assistant = noteCommitMessage(input.title || "课堂要点");
    input.onWrite(assistant);
    return assistant;
  });
});

afterEach(() => {
  setNoteCommitRunnerForTests(null);
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

test("confirm note 不走 sendToChat，旁路仍带上下文和 memoryCommit", async () => {
  let seen: RunNoteCommitInput | undefined;
  setNoteCommitRunnerForTests(async (input) => {
    seen = input;
    const assistant = noteCommitMessage(input.title || "课堂要点");
    input.onWrite(assistant);
    return assistant;
  });
  useMemoryInbox.getState().ingestProposal({
    proposalId: "prop_1",
    toolCallId: "t1",
    messageId: "m1",
    kind: "note",
    reason: "值得记住",
    titleHint: "渗透压",
  });
  useMemoryInbox.getState().confirm("prop_1");
  assert.equal(useStore.getState().outbound, null);
  await Promise.resolve();
  await Promise.resolve();
  assert.ok(seen);
  assert.equal(seen?.title, "渗透压");
  assert.equal(seen?.historyMessages.length, 2);
  assert.equal(seen?.historyMessages[0]?.id, "u1");
  assert.equal(seen?.historyMessages[1]?.id, "m1");
  assert.equal(seen?.sessionId, "main");
  assert.equal(useChatHistory.getState().messagesById.main?.length, 2);
});

test("confirm note 成功后关云并打开笔记窗，主 thread 仍干净", async () => {
  useMemoryInbox.getState().ingestProposal({
    proposalId: "prop_1",
    toolCallId: "t1",
    messageId: "m1",
    kind: "note",
    reason: "值得记住",
    titleHint: "渗透压",
  });
  useMemoryInbox.getState().confirm("prop_1");
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(useStore.getState().outbound, null);
  assert.equal(useMemoryInbox.getState().byId.prop_1?.status, "dismissed");
  assert.ok(useWindowManager.getState().windows.some((win) => win.type === "user-note-editor"));
  assert.ok(!useWindowManager.getState().windows.some((win) => win.type === "memory-proposal"));
  assert.equal(useChatHistory.getState().messagesById.main?.length, 2);
});

test("confirm note 失败时云内报错，主 thread 仍干净", async () => {
  setNoteCommitRunnerForTests(async () => {
    throw new Error("模型超时");
  });
  useMemoryInbox.getState().ingestProposal({
    proposalId: "prop_1",
    toolCallId: "t1",
    messageId: "m1",
    kind: "note",
    reason: "值得记住",
    titleHint: "渗透压",
  });
  useMemoryInbox.getState().confirm("prop_1");
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(useStore.getState().outbound, null);
  assert.equal(useMemoryInbox.getState().byId.prop_1?.status, "proposed");
  assert.match(useMemoryInbox.getState().byId.prop_1?.error ?? "", /模型超时/);
  assert.equal(useChatHistory.getState().messagesById.main?.length, 2);
  assert.ok(useWindowManager.getState().windows.some((win) => win.type === "memory-proposal"));
});

test("confirm flashcard 仍走 sendToChat 旧路径", () => {
  useMemoryInbox.getState().ingestProposal({
    proposalId: "prop_f",
    toolCallId: "t2",
    messageId: "m1",
    kind: "flashcard",
    reason: "值得测验",
    suggestedMode: "cloze",
  });
  useMemoryInbox.getState().confirm("prop_f");
  assert.equal(useMemoryInbox.getState().byId.prop_f?.status, "committing");
  assert.equal(useStore.getState().outbound?.memoryCommit, "flashcards");
  assert.match(useStore.getState().outbound?.content ?? "", /commitFlashcards/);
});
