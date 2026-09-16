import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("global search and URL dialog reuse one spotlight chrome", () => {
  const chrome = readWorkspaceFile("components/search/spotlightChrome.ts");
  const dialog = readWorkspaceFile("components/search/SpotlightDialog.tsx");
  const search = readWorkspaceFile("components/search/GlobalSearchButton.tsx");
  const url = readWorkspaceFile("components/window/OpenUrlDialog.tsx");
  const taskbar = readWorkspaceFile("components/window/WindowTaskbar.tsx");

  assert.match(chrome, /w-\[min\(720px,calc\(100vw-28px\)\)\]/);
  assert.match(chrome, /mt-\[12vh\]/);
  assert.match(chrome, /rounded-2xl/);
  assert.match(dialog, /SPOTLIGHT_PANEL_CLASS/);
  assert.match(search, /SpotlightDialog/);
  assert.match(url, /SpotlightDialog/);
  assert.match(taskbar, /OpenUrlDialog/);
  assert.match(taskbar, /data-menu-group="open-panels"/);
  assert.match(taskbar, /data-menu-group="import-products"/);
  assert.match(taskbar, /data-menu-group="create-files"/);
  assert.match(taskbar, /data-menu-divider/);
});
