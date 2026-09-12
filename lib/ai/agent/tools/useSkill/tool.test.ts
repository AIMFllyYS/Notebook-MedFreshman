import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { createUseSkillTool } from "./tool.ts";
import type { UseSkillOutput } from "./types.ts";

const skills = [
  { id: "s1", name: "Bayes", description: "分析错因", content: "步骤一", pinned: false, createdAt: 1 },
  { id: "s2", name: "固定技能", description: "", content: "始终遵循", pinned: true, createdAt: 2 },
];

const ctx: StudyToolContext = {
  subjectId: "probability",
  categoryId: "detail",
  itemId: "1.4",
  skills,
  academicYear: "freshman-2",
};

const execOpts = {
  toolCallId: "t1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("useSkill：按名加载全文，大小写不敏感；找不到列出可用名", async () => {
  const tool = createUseSkillTool(ctx, createToolRuntime());
  const hit = (await tool.execute!({ name: "Bayes" }, execOpts)) as UseSkillOutput;
  assert.equal(hit.found, true);
  assert.match(hit.text, /步骤一/);
  assert.equal(hit.contextKey, "skill:s1");

  const caseInsensitive = (await createUseSkillTool(ctx, createToolRuntime()).execute!(
    { name: "bayes" },
    execOpts,
  )) as UseSkillOutput;
  assert.equal(caseInsensitive.found, true);

  const miss = (await tool.execute!({ name: "不存在" }, execOpts)) as UseSkillOutput;
  assert.equal(miss.found, false);
  assert.match(miss.text, /Bayes/);
  assert.match(miss.text, /固定技能/);
});

test("useSkill：置顶技能也能按名取到；相同技能去重", async () => {
  const runtime = createToolRuntime();
  const tool = createUseSkillTool(ctx, runtime);
  const first = (await tool.execute!({ name: "固定技能" }, execOpts)) as UseSkillOutput;
  const second = (await tool.execute!({ name: "固定技能" }, execOpts)) as UseSkillOutput;
  assert.equal(first.found, true);
  assert.match(first.text, /始终遵循/);
  assert.equal(second.deduped, true);
});
