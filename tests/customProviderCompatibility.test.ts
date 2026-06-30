import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("chat route uses provider helpers for custom reasoning and thinking params", () => {
  const source = readWorkspaceFile("app/api/chat/route.ts");

  assert.match(source, /extractReasoningDelta\(delta,\s*reasoningField\)/);
  assert.match(source, /buildThinkingRequestParams\(activeProvider\.thinkingRequestStyle/);
  assert.doesNotMatch(source, /reqBody\.enable_thinking\s*=\s*true/);
  assert.doesNotMatch(source, /reqBody\.thinking_budget\s*=/);
});

test("chat route omits tools for models that do not support tool calling", () => {
  const source = readWorkspaceFile("app/api/chat/route.ts");

  assert.match(source, /const modelSupportsTools = modelInfo\?\.tools !== false/);
  assert.match(source, /if \(modelSupportsTools && effectiveToolDefs\.length > 0\)/);
  assert.match(source, /reqBody\.tool_choice = "auto"/);
});

test("image generation route honors explicit custom image API style", () => {
  const source = readWorkspaceFile("app/api/image-gen/route.ts");

  assert.match(source, /detectImageApiStyle\(provider\.apiModelId,\s*provider\.imageApiStyle\)/);
  assert.doesNotMatch(source, /function detectImageApiStyle/);
});

test("custom model settings preserve provider compatibility fields", () => {
  const source = readWorkspaceFile("components/chat/ChatSettings.tsx");

  assert.match(source, /reasoningField: m\.reasoningField \?\? ""/);
  assert.match(source, /thinkingRequestStyle: m\.thinkingRequestStyle/);
  assert.match(source, /imageApiStyle: m\.imageApiStyle \?\? "auto"/);
  assert.match(source, /reasoningField: f\.reasoningField\.trim\(\) \|\| undefined/);
  assert.match(source, /imageApiStyle: f\.imageApiStyle/);
});

