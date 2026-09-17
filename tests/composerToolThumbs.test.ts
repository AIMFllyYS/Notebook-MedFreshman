import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("composer command icons copy the minimized-window thumbnail chrome", () => {
  const icons = readWorkspaceFile("components/chat/composer/ComposerIcons.tsx");
  const css = readWorkspaceFile("app/styles/prose.css");
  const taskbar = readWorkspaceFile("components/window/WindowTaskbar.tsx");
  const panel = readWorkspaceFile("components/chat/composer/ComposerCommandPanel.tsx");

  assert.match(icons, /data-composer-thumb="square"/);
  assert.match(icons, /composer-tool-thumb/);
  assert.doesNotMatch(icons, /TrafficGlyph|<circle cx=\{6\} cy=\{6\} r=\{5\.5\}/);
  assert.match(icons, /name="plan"/);
  assert.match(icons, /name="generateImage"/);
  assert.match(icons, /name="renderInteractive"/);
  assert.match(icons, /name="writeDocument"/);
  assert.match(icons, /name="flashcards"/);
  assert.match(icons, /name="notes"/);
  assert.match(icons, /Skills 不画字形/);
  assert.match(icons, /<ComposerThumb name="skill" \/>/);

  assert.match(taskbar, /rounded-lg border[\s\S]*shadow-sm/);
  assert.match(taskbar, /border-\[color-mix\(in_srgb,var\(--line\)_88%,var\(--md-sys-color-primary\)_12%\)\]/);
  assert.match(css, /\.composer-tool-thumb \{[\s\S]*?border-radius:\s*6px;/);
  assert.match(css, /border:\s*1px solid color-mix\(in srgb, var\(--line\) 82%, var\(--md-sys-color-primary\) 18%\)/);
  assert.match(css, /\.composer-command-panel \.app-menu-check \{[\s\S]*?width:\s*22px;/);

  assert.match(panel, /<PlanModeIcon \/>/);
  assert.match(panel, /<ForcedToolIcon tool=\{tool\} \/>/);
  assert.match(panel, /<SkillIcon \/>/);
});
