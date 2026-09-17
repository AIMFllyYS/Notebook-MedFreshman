import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("note editor height chain scrolls in the body, not the window chrome", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const editor = readWorkspaceFile("components/notes/UserNoteEditorWindow.tsx");

  assert.match(css, /\.user-note-with-agent,\s*\.user-note-workspace,\s*\.user-note-toc-split \{[\s\S]*?height:\s*100%;[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.user-note-editor \{[\s\S]*?height:\s*100%;[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.user-note-wysiwyg \{[\s\S]*?height:\s*100%;[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.user-note-split,\s*\.user-note-single \{[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.user-note-crepe,\s*\.user-note-crepe-loading \{[\s\S]*?overflow-y:\s*auto;[\s\S]*?flex:\s*1 1 0%;/);

  assert.match(editor, /className="user-note-with-agent"/);
  assert.match(editor, /h-full min-h-0 min-w-0 overflow-hidden/);
});

test("Crepe prose padding stays small and headings shrink", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  assert.match(css, /\.user-note-crepe \.milkdown \.ProseMirror \{\s*padding:\s*8px 16px 28px 28px;/);
  assert.match(css, /\.user-note-crepe \.milkdown \.ProseMirror h1 \{\s*font-size:\s*1\.45em;/);
  assert.match(css, /\.user-note-crepe \.milkdown \.ProseMirror h2 \{\s*font-size:\s*1\.22em;/);
  assert.doesNotMatch(css, /\.user-note-crepe \.milkdown \.ProseMirror \{\s*padding:[^}]*120px/);
});

test("classroom sticky notes left-align full Milkdown, not a textarea", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const editor = readWorkspaceFile("components/notes/MilkdownNoteEditor.tsx");
  const sticky = readWorkspaceFile("components/notes/ClassroomNoteWindow.tsx");

  assert.match(
    css,
    /\.classroom-note \.user-note-crepe \.milkdown \.ProseMirror,\s*\.user-note-crepe\.is-compact \.milkdown \.ProseMirror \{\s*padding:\s*2px 8px 16px;/,
  );
  assert.match(editor, /\[Crepe\.Feature\.BlockEdit\]:\s*true/);
  assert.match(editor, /\[Crepe\.Feature\.Latex\]:\s*true/);
  assert.match(editor, /\[Crepe\.Feature\.Toolbar\]:\s*true/);
  assert.doesNotMatch(editor, /BlockEdit\]:\s*!compact/);
  assert.match(sticky, /MilkdownNoteEditor/);
  assert.match(sticky, /compact/);
  assert.match(sticky, /完整 Milkdown/);
});
