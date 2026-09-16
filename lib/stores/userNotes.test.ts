import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { userNoteWindowId, USER_NOTE_LIBRARY_WINDOW_ID } from "@/lib/notes/userNote";
import { closeManagedWindow } from "@/lib/keyboard/windowActions";

function reset() {
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
}

beforeEach(reset);

test("createNote can seed an agent summary instead of the default template", () => {
  const id = useUserNotes.getState().createNote("physics", {
    title: "牛顿定律",
    markdown: "# 牛顿定律\n\n$F=ma$",
  });
  const note = useUserNotes.getState().byId[id];
  assert.equal(note?.title, "牛顿定律");
  assert.equal(note?.markdown, "# 牛顿定律\n\n$F=ma$");
});

test("createNote binds subject and seeds default markdown", () => {
  const id = useUserNotes.getState().createNote("probability");
  const note = useUserNotes.getState().byId[id];
  assert.ok(note);
  assert.equal(note?.subjectId, "probability");
  assert.equal(note?.title, "无标题笔记");
  assert.match(note?.markdown ?? "", /\$E = mc\^\{2\}\$/);
});

test("updateNote auto-follows heading until the title is edited by hand", () => {
  const id = useUserNotes.getState().createNote("physics");
  useUserNotes.getState().updateNote(id, { markdown: "# 牛顿定律\n\n$F=ma$" });
  assert.equal(useUserNotes.getState().byId[id]?.title, "牛顿定律");

  useUserNotes.getState().updateNote(id, { title: "力学笔记" });
  useUserNotes.getState().updateNote(id, { markdown: "# 别的标题\n\n正文" });
  assert.equal(useUserNotes.getState().byId[id]?.title, "力学笔记");
});

test("openEditor opens a managed window and closeManagedWindow clears it", () => {
  const id = useUserNotes.getState().createNote("probability");
  useUserNotes.getState().openEditor(id);
  const winId = userNoteWindowId(id);
  const win = useWindowManager.getState().windows.find((item) => item.id === winId);
  assert.equal(win?.type, "user-note-editor");
  assert.deepEqual(win?.data, { noteId: id });
  assert.deepEqual(useUserNotes.getState().openEditorIds, [id]);

  closeManagedWindow(win!);
  assert.equal(useWindowManager.getState().windows.length, 0);
  assert.deepEqual(useUserNotes.getState().openEditorIds, []);
});

test("openLibrary cite mode and closeManagedWindow", () => {
  useUserNotes.getState().openLibrary({ subjectId: "probability", intent: "cite" });
  const win = useWindowManager.getState().windows.find((item) => item.id === USER_NOTE_LIBRARY_WINDOW_ID);
  assert.equal(win?.type, "user-note-library");
  assert.equal(win?.title, "选择笔记");
  assert.equal(useUserNotes.getState().libraryIntent, "cite");
  closeManagedWindow(win!);
  assert.equal(useUserNotes.getState().libraryOpen, false);
});

test("removeNote deletes the record and closes its editor", () => {
  const id = useUserNotes.getState().createNote(null);
  useUserNotes.getState().openEditor(id);
  useUserNotes.getState().removeNote(id);
  assert.equal(useUserNotes.getState().byId[id], undefined);
  assert.equal(useWindowManager.getState().windows.length, 0);
});

test("flashcard cite picker opens a singleton window", () => {
  useFlashcardCitations.getState().openPicker({ subjectId: "probability" });
  const win = useWindowManager.getState().windows.find((item) => item.type === "flashcard-cite-picker");
  assert.ok(win);
  assert.match(win?.title ?? "", /选择复习闪卡/);
  closeManagedWindow(win!);
  assert.equal(useFlashcardCitations.getState().open, false);
});
