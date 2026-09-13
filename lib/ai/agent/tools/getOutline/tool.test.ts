import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { createGetOutlineTool, getOutlineIo } from "./tool.ts";
import type { GetOutlineOutput } from "./types.ts";

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

test("getOutline：默认只取当前学年，crossYear 走全部", async (t) => {
  const scopes: unknown[] = [];
  t.mock.method(getOutlineIo, "getMultiSubjectOutline", (scope: string) => {
    scopes.push(scope);
    return scope === "all" ? "=== 系统解剖学 (anatomy) ===\n=== 概率论与数理统计 (probability) ===" : "=== 概率论与数理统计 (probability) ===";
  });
  const runtime = createToolRuntime();
  const tool = createGetOutlineTool(ctx, runtime);
  const year = (await tool.execute!({}, execOpts)) as GetOutlineOutput;
  assert.equal(year.contextKey, "outline:freshman-2");
  assert.match(year.text, /probability/);
  assert.doesNotMatch(year.text, /anatomy/);

  const all = (await tool.execute!({ crossYear: true }, execOpts)) as GetOutlineOutput;
  assert.equal(all.contextKey, "outline:all");
  assert.match(all.text, /anatomy/);
  assert.deepEqual(scopes, ["freshman-2", "all"]);
});

test("getOutline：同一学年二次调用按 contextKey 去重", async (t) => {
  t.mock.method(getOutlineIo, "getMultiSubjectOutline", () => "outline body");
  const runtime = createToolRuntime();
  const tool = createGetOutlineTool(ctx, runtime);
  const first = (await tool.execute!({}, execOpts)) as GetOutlineOutput;
  const second = (await tool.execute!({}, execOpts)) as GetOutlineOutput;
  assert.equal(first.deduped, undefined);
  assert.equal(second.deduped, true);
});
