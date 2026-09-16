import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createAndOpenNote, openArtifactImportPicker, openDocumentImportPicker, openFlashcardCitePicker, openNoteLibrary } from "@/lib/notes/openUserNote";
import { useAgentProductPicker } from "@/lib/stores/agentProductPicker";
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
  useAgentProductPicker.setState({ open: false, kind: "document" });
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

test("createAndOpenNote on the bookshelf home stays unfiled", () => {
  const prev = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { pathname: "/" } },
  });
  try {
    const id = createAndOpenNote();
    assert.equal(useUserNotes.getState().byId[id]?.subjectId, null);
  } finally {
    if (prev) Object.defineProperty(globalThis, "window", { configurable: true, value: prev });
    else delete (globalThis as { window?: unknown }).window;
  }
});

test("import pickers reuse one window and switch title with kind", () => {
  openDocumentImportPicker();
  assert.ok(useWindowManager.getState().windows.some((win) => win.title === "导入长文本"));
  openArtifactImportPicker();
  assert.equal(useWindowManager.getState().windows.filter((win) => win.type === "agent-product-picker").length, 1);
  assert.ok(useWindowManager.getState().windows.some((win) => win.title === "导入可交互 HTML"));
});

test("import pickers open a shared agent-product window", () => {
  openDocumentImportPicker();
  assert.equal(useAgentProductPicker.getState().kind, "document");
  assert.ok(useWindowManager.getState().windows.some((win) => win.type === "agent-product-picker"));
  openArtifactImportPicker();
  assert.equal(useAgentProductPicker.getState().kind, "artifact");
  assert.equal(useWindowManager.getState().windows.filter((win) => win.type === "agent-product-picker").length, 1);
});
