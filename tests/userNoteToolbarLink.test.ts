import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function standaloneRule(css: string, selector: string): string {
  const re = /([^{}]+)\{([^}]+)\}/g;
  const hits: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(css))) {
    if (match[1].trim() === selector) hits.push(match[2]);
  }
  assert.equal(hits.length, 1, `expected one standalone ${selector} rule, got ${hits.length}`);
  return hits[0];
}

test("tool action text uses the existing toolbar button, without underline", () => {
  const tools = readWorkspaceFile("app/styles/chat-tools.css");
  const prose = readWorkspaceFile("app/styles/prose.css");
  const flashcards = readWorkspaceFile("components/notes/FlashcardCiteWindow.tsx");
  const cloud = readWorkspaceFile("components/memory/MemoryProposalCloud.tsx");
  const noteEditor = readWorkspaceFile("components/notes/UserNoteEditorWindow.tsx");
  const recordPreview = readWorkspaceFile("components/review/RecordPreviewWindow.tsx");
  const chrome = readWorkspaceFile("components/window/WindowChrome.tsx");

  const linkRule = standaloneRule(tools, ".user-note-toolbar-link");
  assert.match(linkRule, /text-decoration:\s*none/);
  assert.doesNotMatch(linkRule, /underline/);

  assert.match(standaloneRule(prose, ".prose-notes a"), /text-decoration:\s*underline/);
  assert.match(standaloneRule(prose, ".chat-prose a"), /text-decoration:\s*underline/);

  assert.equal((flashcards.match(/className="user-note-toolbar-link"/g) || []).length, 3);
  assert.match(flashcards, /下载这张/);
  assert.match(flashcards, /下载 CSV/);
  assert.match(flashcards, /打开复习板/);
  assert.match(cloud, /className="user-note-toolbar-link"[\s\S]{0,180}不用了/);

  assert.doesNotMatch(noteEditor, /user-note-toolbar-link/);
  assert.match(noteEditor, /user-note-chrome-btn/);
  assert.doesNotMatch(recordPreview, /textDecoration:\s*["']underline["']/);
  assert.doesNotMatch(recordPreview, /user-note-toolbar-link/);
  assert.doesNotMatch(chrome, /text-decoration:\s*underline|underline/);
});
