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

test("Crepe prose padding stays small and every heading level is pinned to the note ladder", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  assert.match(css, /\.user-note-crepe \.milkdown \.ProseMirror \{\s*padding:\s*8px 16px 28px 28px;/);
  assert.doesNotMatch(css, /\.user-note-crepe \.milkdown \.ProseMirror \{\s*padding:[^}]*120px/);

  // H1–H6 必须全部落在 --note-hN 令牌上：只压 h1/h2 会让 Crepe 出厂的
  // h3=2em / h4=1.75em / h5=1.5em 反超 h1，这正是用户报的「标题层级乱」。
  for (const level of [1, 2, 3, 4, 5, 6]) {
    assert.match(
      css,
      new RegExp(
        `\\.user-note-crepe \\.milkdown \\.ProseMirror h${level},\\s*\\n\\.user-note-preview\\.prose-notes h${level} \\{\\s*\\n\\s*font-size: var\\(--note-h${level},`,
      ),
      `笔记标题 h${level} 没有被笔记作用域覆盖`,
    );
  }

  // 令牌本身必须单调递减，且编辑器与预览共用同一组。
  const ladder = [1, 2, 3, 4, 5, 6].map((level) => {
    const hit = new RegExp(`--note-h${level}: ([0-9.]+)rem;`).exec(css);
    assert.ok(hit, `缺少 --note-h${level}`);
    return Number(hit![1]);
  });
  for (let i = 1; i < ladder.length; i += 1) {
    assert.ok(ladder[i] < ladder[i - 1], `--note-h${i + 1} 必须小于 --note-h${i}`);
  }
  assert.match(css, /\.user-note-editor,\s*\n\.user-note-preview,\s*\n\.classroom-note \{/);
});

test("note heading CSS never leaks into the shared prose-notes used by textbooks", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const prose = readWorkspaceFile("app/styles/prose.css");
  // 预览侧必须带 .user-note-preview 前缀，否则会连全站教材标题一起改。
  assert.doesNotMatch(css, /(^|\n)\.prose-notes h[1-6]/);
  assert.doesNotMatch(prose, /user-note-preview/);
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
  // 划词工具栏补标题层级：出厂只有加粗/斜体/删除线/代码/链接。
  assert.match(editor, /\[Crepe\.Feature\.Toolbar\]: \{ buildToolbar: buildNoteToolbar \}/);
  assert.match(editor, /commands\?\.call\?\.\("WrapInHeading", level\)/);
  assert.doesNotMatch(editor, /BlockEdit\]:\s*!compact/);
  assert.match(sticky, /MilkdownNoteEditor/);
  assert.match(sticky, /compact/);
  assert.match(sticky, /完整 Milkdown/);
});
