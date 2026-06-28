import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";
import { partitionTaskbarWindows } from "@/components/window/WindowTaskbar";
import type { ManagedWindow } from "@/lib/hooks/useWindowManager";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("artifact viewer is mounted in the global app shell window layer", () => {
  const chatPanel = readWorkspaceFile("components/chat/ChatPanel.tsx");
  const appShell = readWorkspaceFile("components/layout/AppShell.tsx");

  assert.doesNotMatch(
    chatPanel,
    /ArtifactViewer/,
    "ChatPanel is tab-scoped; artifact windows must not unmount when the AI tab unmounts.",
  );
  assert.match(
    appShell,
    /components\/chat\/ArtifactViewer/,
    "AppShell should dynamically import the artifact viewer as a global floating window layer.",
  );
  assert.match(
    appShell,
    /<ArtifactViewer\s*\/>/,
    "AppShell should render the artifact viewer alongside the other global window layers.",
  );
});

function windowFixture(id: string): ManagedWindow {
  return {
    id,
    type: "floating-chat",
    title: id,
    pos: { x: 0, y: 0 },
    size: { width: 420, height: 480 },
    z: 5001,
    fullscreen: false,
    minimized: false,
    data: { sessionId: id },
  };
}

test("taskbar overflow does not show fixed fallback icons before width is available", () => {
  const windows = ["one", "two", "three"].map(windowFixture);
  const { visible, overflow } = partitionTaskbarWindows(windows, "topbar", 0);

  assert.equal(visible.length, 0);
  assert.deepEqual(overflow.map((win) => win.id), ["one", "two", "three"]);
});

test("taskbar overflow uses the full measured host width before collapsing", () => {
  const windows = ["one", "two", "three", "four", "five", "six"].map(windowFixture);
  const { visible, overflow } = partitionTaskbarWindows(windows, "topbar", 128);

  assert.deepEqual(visible.map((win) => win.id), ["one", "two", "three"]);
  assert.deepEqual(overflow.map((win) => win.id), ["four", "five", "six"]);
});

test("taskbar overflow reserves room for the overflow menu when icons exceed capacity", () => {
  const windows = ["one", "two", "three", "four"].map(windowFixture);
  const { visible, overflow } = partitionTaskbarWindows(windows, "content-tab", 96);

  assert.deepEqual(visible.map((win) => win.id), ["one", "two"]);
  assert.deepEqual(overflow.map((win) => win.id), ["three", "four"]);
});

test("taskbar window tooltip uses one responsive custom label instead of native title", () => {
  const taskbar = readWorkspaceFile("components/window/WindowTaskbar.tsx");

  assert.doesNotMatch(
    taskbar,
    /title=\{win\.title\}/,
    "Native title and custom tooltip render as two competing hover labels.",
  );
  assert.match(taskbar, /aria-label=\{win\.title\}/);
  assert.match(taskbar, /whitespace-nowrap/);
  assert.match(taskbar, /max-w-\[min\(70vw,28rem\)\]/);
});

test("taskbar window tooltip is portaled above tab and toolbar stacking contexts", () => {
  const taskbar = readWorkspaceFile("components/window/WindowTaskbar.tsx");

  assert.match(
    taskbar,
    /createPortal/,
    "Window tooltip should render through a body portal instead of staying inside the taskbar button.",
  );
  assert.match(taskbar, /position:\s*"fixed"/);
  assert.match(taskbar, /z-\[11000\]/);
  assert.doesNotMatch(
    taskbar,
    /absolute right-0 top-8 z-\[7000\]/,
    "Inline absolute tooltip can be trapped behind the content tab bar stacking context.",
  );
});
