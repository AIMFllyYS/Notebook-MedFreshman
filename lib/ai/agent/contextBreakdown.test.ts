import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDY_TOOL_NAMES } from "./tools/names.ts";
import {
  classifyTool,
  computeContextBreakdown,
  estimateRequestContextTokens,
} from "./contextBreakdown.ts";
import { estimateFullContextTokens, isSoftLimitReached } from "@/lib/context/estimateFullContext.ts";
import { estimateTokens } from "@/lib/context/estimateTokens.ts";
import type { StudyAgentBundle } from "./studyAgent.ts";

const emptyParts = {
  baseSystemPrompt: "sys",
  globalContext: "",
  skillsMenuText: "",
  pinnedSkillsText: "",
  volatile: "定位",
  instructions: "sys\n定位",
} satisfies StudyAgentBundle["promptParts"];

test("computeContextBreakdown：截断态垫高 displayTotal，判定用的 total 不垫", () => {
  const breakdown = computeContextBreakdown({
    promptParts: emptyParts,
    tools: {},
    historyMessages: [{ role: "user", content: "hi" }],
    steps: [],
    clientContextTokens: 90_000,
    truncated: true,
  });
  assert.ok(breakdown.total < 90_000);
  assert.equal(breakdown.displayTotal, 90_000);
  assert.equal(breakdown.truncated, true);
});

test("classifyTool：getOutline / searchNoteImages 进 pages，其余未覆盖工具选对桶", () => {
  assert.equal(classifyTool("getOutline"), "pages");
  assert.equal(classifyTool("searchNoteImages"), "pages");
  assert.equal(classifyTool("getCurrentPage"), "pages");
  assert.equal(classifyTool("getSection"), "pages");
  assert.equal(classifyTool("searchNotes"), "pages");
  assert.equal(classifyTool("webSearch"), "webSearch");
  assert.equal(classifyTool("imageSearch"), "webSearch");
  assert.equal(classifyTool("useSkill"), "skills");
  for (const name of [
    "renderInteractive",
    "drawDiagram",
    "generateImage",
    "createQuiz",
    "writeDocument",
    "getArtifact",
  ]) {
    assert.equal(classifyTool(name), "conversation", name);
  }
  for (const name of STUDY_TOOL_NAMES) {
    assert.ok(
      ["skills", "webSearch", "pages", "conversation"].includes(classifyTool(name)),
      name,
    );
  }
});

test("computeContextBreakdown：getOutline 与 searchNoteImages 计入 pages", () => {
  const pagePayload = "大纲或笔记图";
  const breakdown = computeContextBreakdown({
    promptParts: emptyParts,
    tools: {},
    historyMessages: [],
    steps: [
      {
        text: "",
        reasoningText: "",
        toolCalls: [],
        toolResults: [
          { toolName: "getOutline", output: { text: pagePayload } },
          { toolName: "searchNoteImages", output: { text: pagePayload } },
        ],
      } as never,
    ],
    clientContextTokens: null,
    truncated: false,
  });
  const expected = estimateTokens(pagePayload) * 2 + estimateTokens(emptyParts.volatile);
  assert.equal(breakdown.pages, expected);
});

test("estimateRequestContextTokens：与 estimateFullContextTokens 同一套全量口径", () => {
  const historyMessages = [{ role: "user" as const, content: "hello".repeat(200) }];
  const tokens = estimateRequestContextTokens({
    promptParts: emptyParts,
    tools: {},
    historyMessages,
  });
  const expected = estimateFullContextTokens({
    systemText:
      emptyParts.baseSystemPrompt +
      emptyParts.globalContext +
      emptyParts.skillsMenuText +
      emptyParts.pinnedSkillsText,
    toolDefsTokens: 0,
    referenceText: emptyParts.volatile,
    historyText: "hello".repeat(200),
  });
  assert.equal(tokens, expected);
  assert.equal(isSoftLimitReached(tokens, Math.floor(tokens / 0.8)), true);
});

test("computeContextBreakdown：cachedTokens 来自上游 usage，cacheHit 由其派生", () => {
  const hit = computeContextBreakdown({
    promptParts: emptyParts,
    tools: {},
    historyMessages: [],
    steps: [],
    clientContextTokens: null,
    truncated: false,
    cachedTokens: 24,
  });
  assert.equal(hit.cachedTokens, 24);
  assert.equal(hit.cacheHit, true);

  const miss = computeContextBreakdown({
    promptParts: emptyParts,
    tools: {},
    historyMessages: [],
    steps: [],
    clientContextTokens: null,
    truncated: false,
    cachedTokens: 0,
  });
  assert.equal(miss.cachedTokens, 0);
  assert.equal(miss.cacheHit, false);
});

test("computeContextBreakdown：非截断态不垫高", () => {
  const breakdown = computeContextBreakdown({
    promptParts: emptyParts,
    tools: {},
    historyMessages: [{ role: "user", content: "hi" }],
    steps: [],
    clientContextTokens: 90_000,
    truncated: false,
  });
  assert.ok(breakdown.total < 90_000);
  assert.equal(breakdown.displayTotal, breakdown.total);
});
