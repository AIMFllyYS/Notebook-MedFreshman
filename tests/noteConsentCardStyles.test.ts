import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

/**
 * 这条测试挡的是一类已经真实发生过的缺陷：组件写了 className，
 * 但 CSS 一条都没加 —— 卡片在页面上退回成裸文本（"同意修改取消" 挤成一行）。
 * 静态扫描足够，因为它检查的正是「类名与样式是否成对」这件事本身。
 */
test("every note-consent class used by the card has a matching CSS rule", () => {
  const tsx = readWorkspaceFile("components/notes/NoteChangeConsentCard.tsx");
  const css = readWorkspaceFile("app/styles/chat-tools.css");

  const classes = new Set<string>();
  for (const match of tsx.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{[^}]*"([^"]*)"[^}]*\})/g)) {
    for (const chunk of [match[1], match[2], match[3]]) {
      if (!chunk) continue;
      for (const token of chunk.split(/\s+/)) {
        if (token.startsWith("note-consent")) classes.add(token);
      }
    }
  }

  // 条件态类名走 clsx 复合选择器，className= 扫描收不到，按真实选择器逐条钉。
  assert.match(css, /\.note-consent-btn\.is-primary\b/);
  assert.match(css, /\.note-consent-toggle svg\.is-open\b/);
  assert.match(css, /\.note-consent-line\.is-removed\b/);
  assert.match(css, /\.note-consent-line\.is-added\b/);

  assert.ok(classes.size >= 8, `Expected the card to use several note-consent classes, found ${classes.size}`);
  const missing = [...classes].filter((token) => {
    const escaped = token.replace(/[-]/g, "\\-");
    return !new RegExp(`\\.${escaped}\\b`).test(css);
  });
  assert.deepEqual(missing, [], `确认卡的这些类名没有任何 CSS 规则：${missing.join(", ")}`);
  assert.ok(classes.has("note-consent"), "底线：卡片根类 .note-consent 必须存在");
});

test("note-consent card keeps the shared tool-card visual language", () => {
  const css = readWorkspaceFile("app/styles/chat-tools.css");
  const block = /\.note-consent \{[\s\S]*?\n\}/.exec(css);
  assert.ok(block, "缺少 .note-consent 基础规则");
  const body = block![0];
  assert.match(body, /border: 1px solid var\(--md-sys-color-outline-variant\)/);
  assert.match(body, /border-radius: 12px/);
  assert.match(body, /background: var\(--md-sys-color-surface-container\)/);
  // 卡片直接挂在 .chat-message-content 下，没有外层包裹，必须自己吃满宽度。
  assert.match(body, /width: 100%/);
});
