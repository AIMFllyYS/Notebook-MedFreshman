import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  applyUpdateUserNote,
  applyUpdateUserNoteEvents,
  collectUpdateUserNoteEvents,
  resetAppliedUserNoteEdits,
  selectEditingUserNote,
} from "./applyUserNoteAgent.ts";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import type { ChatMessage } from "@/lib/types/chat";

function resetNotes() {
  resetAppliedUserNoteEdits();
  useUserNotes.setState({
    byId: {},
    order: [],
    openEditorIds: [],
    agentEditingNoteId: null,
    noteAgentOpenIds: [],
    noteAgentSessionById: {},
    libraryOpen: false,
    libraryIntent: "browse",
    librarySubjectId: null,
  });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
}

beforeEach(resetNotes);
afterEach(resetNotes);

function openNote(markdown = "旧稿") {
  const id = useUserNotes.getState().createNote("anatomy", { title: "被覆上皮", markdown });
  useUserNotes.getState().openEditor(id);
  useUserNotes.getState().setAgentEditingNoteId(id);
  return id;
}

test("selectEditingUserNote only returns the open note the student handed to Agent", () => {
  const id = openNote("# 旧");
  const selected = selectEditingUserNote();
  assert.equal(selected?.id, id);
  assert.equal(selected?.title, "被覆上皮");
  assert.equal(selected?.markdown, "# 旧");

  useUserNotes.getState().closeEditor(id);
  assert.equal(selectEditingUserNote(), null);
});

test("selectEditingUserNote can lock a specific open note besides the cited one", () => {
  const cited = openNote("# 引用这篇");
  const other = useUserNotes.getState().createNote("anatomy", { title: "窗内这篇", markdown: "# 窗内" });
  useUserNotes.getState().openEditor(other);
  assert.equal(selectEditingUserNote()?.id, cited);
  assert.equal(selectEditingUserNote(other)?.id, other);
  assert.equal(selectEditingUserNote(other)?.markdown, "# 窗内");
});

test("applyUpdateUserNote writes markdown back into the open editor", () => {
  const id = openNote("旧稿");
  const ok = applyUpdateUserNote({
    text: "ok",
    noteId: id,
    markdown: "# 被覆上皮\n\n1. 单层扁平",
    title: "上皮组织",
    applied: true,
  });
  assert.equal(ok, true);
  assert.equal(useUserNotes.getState().byId[id]?.markdown, "# 被覆上皮\n\n1. 单层扁平");
  assert.equal(useUserNotes.getState().byId[id]?.title, "上皮组织");
});

test("applyUpdateUserNote ignores a note that is not open", () => {
  const id = useUserNotes.getState().createNote("anatomy", { title: "关着", markdown: "旧" });
  const ok = applyUpdateUserNote({
    text: "ok",
    noteId: id,
    markdown: "新稿",
    applied: true,
  });
  assert.equal(ok, false);
  assert.equal(useUserNotes.getState().byId[id]?.markdown, "旧");
});

test("collect and apply updateUserNote events from a mocked agent tool part", () => {
  const id = openNote("旧稿");
  const message: ChatMessage = {
    id: "m1",
    role: "assistant",
    timestamp: 1,
    parts: [
      {
        type: "tool-updateUserNote",
        toolCallId: "u1",
        state: "output-available",
        input: { markdown: "# 新稿" },
        output: { text: "已写回", noteId: id, markdown: "# 新稿", applied: true },
      },
    ],
  };
  const events = collectUpdateUserNoteEvents([message]);
  assert.equal(events.length, 1);
  assert.deepEqual(applyUpdateUserNoteEvents([message]), [id]);
  assert.equal(useUserNotes.getState().byId[id]?.markdown, "# 新稿");
  assert.deepEqual(applyUpdateUserNoteEvents([message]), [], "same tool call is not applied twice");
});
