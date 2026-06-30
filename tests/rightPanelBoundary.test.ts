import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("right panel dynamic tabs expose loading fallbacks", () => {
  const source = readWorkspaceFile("components/layout/RightPanel.tsx");

  assert.match(source, /loading:\s*\(\)\s*=>\s*<RightPanelTabLoading/);
  assert.match(source, /const ChatPanel = dynamic/);
  assert.match(source, /const VideoTab = dynamic/);
  assert.match(source, /const InteractiveTab = dynamic/);
  assert.match(source, /const BrowserTab = dynamic/);
});

test("right panel tab content is protected by an error boundary", () => {
  const source = readWorkspaceFile("components/layout/RightPanel.tsx");

  assert.match(source, /class RightPanelTabBoundary/);
  assert.match(source, /componentDidCatch/);
  assert.match(source, /<RightPanelTabBoundary key=\{tab\} tab=\{tab\}>/);
  assert.match(source, /onClick=\{\(\) => this\.setState\(\{ error: null \}\)\}/);
});

