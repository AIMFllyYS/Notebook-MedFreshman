import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { useTokenTracker } from "@/lib/hooks/useTokenTracker.ts";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("token tracker keeps a fixed session context budget", () => {
  const tracker = useTokenTracker.getState();
  tracker.resetSession();

  useTokenTracker.getState().setCurrentContext(10_000, 128_000);
  useTokenTracker.getState().setCurrentContext(20_000, 1_000_000);

  assert.equal(useTokenTracker.getState().modelContextLimit, 128_000);
  assert.equal(useTokenTracker.getState().sessionContextBudgetTokens, 128_000);
});

test("usage accounting does not overwrite context ring totals", () => {
  useTokenTracker.getState().resetSession();
  useTokenTracker.getState().setCurrentContext(90_000, 128_000);
  useTokenTracker.getState().addUsage({
    promptTokens: 1_000,
    completionTokens: 500,
    totalTokens: 1_500,
  });

  assert.equal(useTokenTracker.getState().currentContextTokens, 90_000);
  assert.equal(useTokenTracker.getState().lastTurn.promptTokens, 1_000);
});

test("context breakdown drives ring total and warning state", () => {
  useTokenTracker.getState().resetSession();
  useTokenTracker.getState().setCurrentContext(10_000, 128_000);
  useTokenTracker.getState().setContextBreakdown({
    tools: 100,
    skills: 100,
    pages: 100,
    webSearch: 0,
    conversation: 99_700,
    total: 100_000,
    truncated: true,
    cacheHit: true,
    warning: "soft limit",
  });

  const state = useTokenTracker.getState();
  assert.equal(state.currentContextTokens, 100_000);
  assert.equal(state.contextTruncated, true);
  assert.equal(state.contextWarning, "soft limit");
});

test("chat route uses last user message, selected model context manager, and soft truncation metadata", () => {
  const source = readWorkspaceFile("app/api/chat/route.ts");

  assert.match(source, /reverse\(\)\.find\(\(m\) => m\.role === "user"\)/);
  assert.match(source, /getContextManager\(options\.contextMode \?\? "full", effectiveModelId\)/);
  assert.match(source, /clientContextTruncated/);
  assert.match(source, /clientContextTokens/);
  assert.match(source, /breakdown\.truncated = effectiveContextTruncated/);
  assert.match(source, /breakdown\.cacheHit = ctxResult\.cacheHit/);
});

test("dynamic tool context uses contextKey de-duplication", () => {
  const route = readWorkspaceFile("app/api/chat/route.ts");
  const tools = readWorkspaceFile("lib/ai/tools.ts");

  assert.match(tools, /contextKey\?: string/);
  assert.match(tools, /contextKey: `page:/);
  assert.match(tools, /contextKey: `skill:/);
  assert.match(route, /const loadedContextKeys = new Set<string>\(\)/);
  assert.match(route, /loadedContextKeys\.has\(result\.contextKey\)/);
});

test("chat panel warns at 80 percent but does not disable input", () => {
  const source = readWorkspaceFile("components/chat/ChatPanel.tsx");

  assert.match(source, /const showWarning = ctxRatio >= 0\.8 \|\| contextTruncated/);
  assert.doesNotMatch(source, /disabled=\{contextFull\}/);
  assert.doesNotMatch(source, /disabledReason="上下文已满/);
});
