import assert from "node:assert/strict";
import { test } from "node:test";
import { createRenderInteractiveTool } from "./tool.ts";
import type { RenderInteractiveOutput } from "./types.ts";
import type { StudyToolContext } from "@/lib/ai/agent/tools/_shared";

const execOpts = {
  toolCallId: "call_art",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("renderInteractive：下发 artifactId 与 modelId，不阻塞生成", async () => {
  const ctx: StudyToolContext = {
    subjectId: "physics",
    categoryId: "detail",
    itemId: "2.1",
    skills: [],
    academicYear: "freshman-2",
    modelId: "mimo-v2.5",
  };
  const result = (await createRenderInteractiveTool(ctx).execute!(
    { title: "滑块", prompt: "看参数变化" },
    execOpts,
  )) as RenderInteractiveOutput;
  assert.equal(result.artifactId, "art_call_art");
  assert.equal(result.modelId, "mimo-v2.5");
  assert.equal(result.unsupportedReason, undefined);
  assert.match(result.text, /滑块/);
});

test("renderInteractive：生图模式带上 unsupportedReason", async () => {
  const ctx: StudyToolContext = {
    subjectId: "physics",
    categoryId: "detail",
    itemId: "2.1",
    skills: [],
    academicYear: "freshman-2",
    artifactUnsupportedReason: "当前生图模型不支持 HTML 交互组件生成，请切换文本模型后重试。",
  };
  const result = (await createRenderInteractiveTool(ctx).execute!(
    { title: "演示", prompt: "x" },
    execOpts,
  )) as RenderInteractiveOutput;
  assert.match(result.unsupportedReason ?? "", /生图模型/);
});
