import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { applyCommitNotes } from "./applyMemoryTools.ts";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useStore } from "@/lib/stores/ui";
import { DEFAULT_SUBJECT } from "@/lib/constants/subjects";

beforeEach(() => {
  useUserNotes.setState({
    byId: {},
    order: [],
    openEditorIds: [],
    libraryOpen: false,
    libraryIntent: "browse",
    librarySubjectId: null,
  });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ activeSubjectId: DEFAULT_SUBJECT });
});

test("applyCommitNotes writes a short note and opens the editor", () => {
  const id = applyCommitNotes({
    text: "ok",
    noteId: "note_x",
    title: "渗透压",
    markdown: "# 渗透压\n\n- 定义：$\\Pi = cRT$",
  });
  const note = useUserNotes.getState().byId[id];
  assert.equal(note?.title, "渗透压");
  assert.match(note?.markdown ?? "", /cRT/);
  assert.ok(useWindowManager.getState().windows.some((win) => win.type === "user-note-editor"));
});
