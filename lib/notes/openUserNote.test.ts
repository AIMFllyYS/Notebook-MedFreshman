import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createAndOpenNote, openFlashcardCitePicker, openNoteLibrary } from "@/lib/notes/openUserNote";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
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
  useFlashcardCitations.setState({ open: false, subjectId: null, activeCardId: null });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useStore.setState({ activeSubjectId: DEFAULT_SUBJECT });
});

test("createAndOpenNote uses the active subject when omitted", () => {
  const id = createAndOpenNote();
  assert.equal(useUserNotes.getState().byId[id]?.subjectId, DEFAULT_SUBJECT);
  assert.ok(useWindowManager.getState().windows.some((win) => win.type === "user-note-editor"));
});

test("createAndOpenNote can leave a note unfiled", () => {
  const id = createAndOpenNote(null);
  assert.equal(useUserNotes.getState().byId[id]?.subjectId, null);
});

test("openNoteLibrary defaults to the active subject in cite mode", () => {
  openNoteLibrary({ intent: "cite" });
  assert.equal(useUserNotes.getState().libraryOpen, true);
  assert.equal(useUserNotes.getState().libraryIntent, "cite");
  assert.equal(useUserNotes.getState().librarySubjectId, DEFAULT_SUBJECT);
});

test("openFlashcardCitePicker defaults to the active subject", () => {
  openFlashcardCitePicker();
  assert.equal(useFlashcardCitations.getState().open, true);
  assert.equal(useFlashcardCitations.getState().subjectId, DEFAULT_SUBJECT);
});
