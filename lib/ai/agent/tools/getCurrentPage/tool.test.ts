import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { contentIo } from "@/lib/content/contentPathGuard";
import { createGetCurrentPageTool } from "./tool.ts";
import type { GetCurrentPageOutput } from "./types.ts";

const ctx: StudyToolContext = {
  subjectId: "probability",
  categoryId: "detail",
  itemId: "1.4",
  skills: [],
  academicYear: "freshman-2",
};

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("getCurrentPage：读到正文时带标题与 contextKey", async (t) => {
  t.mock.method(contentIo, "readFileSync", () => "# fixture page");
  const result = (await createGetCurrentPageTool(ctx, createToolRuntime()).execute!({}, execOpts)) as GetCurrentPageOutput;
  assert.match(result.text, /# fixture page/);
  assert.equal(result.contextKey, "page:probability/detail/1.4");
});

test("getCurrentPage：占位页给出尚未生成提示", async (t) => {
  t.mock.method(contentIo, "readFileSync", () => {
    throw new Error("missing");
  });
  const missingCtx: StudyToolContext = { ...ctx, itemId: "no-such-page" };
  const result = (await createGetCurrentPageTool(missingCtx, createToolRuntime()).execute!({}, execOpts)) as GetCurrentPageOutput;
  assert.match(result.text, /尚未生成|未找到|占位/);
  assert.equal(result.contextKey, "page:probability/detail/no-such-page");
});

test("getCurrentPage：通用对话没有当前页时直说，不谎报成「占位未生成」", async (t) => {
  // 即使磁盘上真能读到内容，未绑定页面的上下文也不该把它当成「用户正在看的那一页」
  t.mock.method(contentIo, "readFileSync", () => "# fixture page");
  const agentCtx: StudyToolContext = { ...ctx, categoryId: "", itemId: "" };
  const result = (await createGetCurrentPageTool(agentCtx, createToolRuntime()).execute!({}, execOpts)) as GetCurrentPageOutput;
  assert.match(result.text, /没有打开任何小节/);
  assert.doesNotMatch(result.text, /fixture page|尚未生成/);
});

test("getCurrentPage：同一 contextKey 二次调用只回已加载", async (t) => {
  t.mock.method(contentIo, "readFileSync", () => "body");
  const runtime = createToolRuntime();
  const tool = createGetCurrentPageTool(ctx, runtime);
  const first = (await tool.execute!({}, execOpts)) as GetCurrentPageOutput;
  const second = (await tool.execute!({}, execOpts)) as GetCurrentPageOutput;
  assert.equal(first.deduped, undefined);
  assert.equal(second.deduped, true);
  assert.match(second.text, /上下文已加载/);
});
