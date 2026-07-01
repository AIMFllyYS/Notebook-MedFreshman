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
  assert.match(source, /: "auto"/);
});

test("image mode chat forces generateImage and does not expose artifact tools", () => {
  const source = readWorkspaceFile("app/api/chat/route.ts");

  assert.match(source, /const baseToolDefs = isImageMode[\s\S]*?toolDefs\.filter\(\(t\) => t\.function\.name === "generateImage"\)/);
  assert.match(source, /reqBody\.tool_choice = isImageMode[\s\S]*?function: \{ name: "generateImage" \}/);
  assert.match(source, /生图模式硬性规则/);
});

test("artifact and image generation use the model selected when the tool call was created", () => {
  const chatRoute = readWorkspaceFile("app/api/chat/route.ts");
  const artifactCard = readWorkspaceFile("components/chat/ArtifactCard.tsx");
  const imageViewer = readWorkspaceFile("components/chat/ImageGenViewer.tsx");
  const imageCard = readWorkspaceFile("components/chat/ImageGenCard.tsx");

  assert.match(chatRoute, /const artifactModelId = modelId \|\| effectiveModelId/);
  assert.match(chatRoute, /artifactUnsupportedReason/);
  assert.match(chatRoute, /imageModelId: modelId/);
  assert.match(artifactCard, /const artifactModelId = modelId \|\| settings\.selectedModelId/);
  assert.match(imageCard, /modelId,/);
  assert.match(imageViewer, /const imageModelId = cur\.modelId \|\| settings\.selectedModelId/);
  assert.match(imageViewer, /defaultImageModelId: cur\.modelId \? null : settings\.defaultImageModelId/);
});

test("artifact route rejects image models before invoking html generation", () => {
  const source = readWorkspaceFile("app/api/artifact/route.ts");

  assert.match(source, /getModelInfoWithCustom\(modelId,\s*customApiGroups\)\?\.type === "image"/);
  assert.match(source, /当前生图模型不支持 HTML 交互组件生成/);
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
  // apiProtocol 三选一是新的顶层选项；老 reasoningField/thinkingRequestStyle 收进"高级"面板
  assert.match(source, /apiProtocol: f\.apiProtocol/);
  assert.match(source, /f\.showAdvanced\s*\?\s*f\.reasoningField\.trim\(\)\s*\|\|\s*undefined/);
  assert.match(source, /imageApiStyle: f\.imageApiStyle/);
});
