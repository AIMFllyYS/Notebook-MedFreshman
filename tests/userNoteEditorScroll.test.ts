import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function ruleFor(css: string, selector: string): string {
  const re = /([^{}]+)\{([^}]+)\}/g;
  const hits: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(css))) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) hits.push(match[2]);
  }
  assert.equal(hits.length, 1, `expected one ${selector} rule, got ${hits.length}`);
  return hits[0];
}

test("note editor height chain scrolls in the body, not the window chrome", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const editor = readWorkspaceFile("components/notes/UserNoteEditorWindow.tsx");

  for (const selector of [
    ".user-note-with-agent",
    ".user-note-workspace",
    ".user-note-toc-split",
    ".user-note-editor",
    ".user-note-wysiwyg",
    ".user-note-single",
  ]) {
    const rule = ruleFor(css, selector);
    assert.match(rule, /min-height:\s*0/);
    assert.match(rule, /overflow:\s*hidden/);
    assert.match(rule, /height:\s*100%/);
  }

  const crepe = ruleFor(css, ".user-note-crepe");
  assert.match(crepe, /overflow-y:\s*auto/);
  assert.match(crepe, /flex:\s*1 1 0%/);
  assert.doesNotMatch(crepe, /overflow:\s*hidden/);

  assert.match(editor, /className="user-note-with-agent"/);
  assert.match(editor, /h-full min-h-0 min-w-0 overflow-hidden/);
  assert.doesNotMatch(editor, /content\//);
});

test("Crepe prose padding stays small and headings shrink", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const prose = ruleFor(css, ".user-note-crepe .milkdown .ProseMirror");
  assert.match(prose, /padding:\s*8px 16px 28px 28px/);
  assert.doesNotMatch(prose, /120px/);
  assert.doesNotMatch(prose, /60px/);

  assert.match(ruleFor(css, ".user-note-crepe .milkdown .ProseMirror h1"), /font-size:\s*1\.45em/);
  assert.match(ruleFor(css, ".user-note-crepe .milkdown .ProseMirror h2"), /font-size:\s*1\.22em/);
});

test("classroom sticky notes left-align full Milkdown, not a textarea", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const editor = readWorkspaceFile("components/notes/MilkdownNoteEditor.tsx");
  const sticky = readWorkspaceFile("components/notes/ClassroomNoteWindow.tsx");

  const compactPad = ruleFor(
    css,
    ".classroom-note .user-note-crepe .milkdown .ProseMirror",
  );
  assert.match(compactPad, /padding:\s*2px 8px 16px/);
  assert.doesNotMatch(compactPad, /120px/);

  assert.match(editor, /\[Crepe\.Feature\.BlockEdit\]:\s*true/);
  assert.match(editor, /\[Crepe\.Feature\.Latex\]:\s*true/);
  assert.match(editor, /\[Crepe\.Feature\.Toolbar\]:\s*true/);
  assert.doesNotMatch(editor, /BlockEdit\]:\s*!compact/);
  assert.match(sticky, /MilkdownNoteEditor/);
  assert.match(sticky, /compact/);
  assert.match(sticky, /完整 Milkdown/);
});
