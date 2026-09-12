import assert from "node:assert/strict";
import { test } from "node:test";
import { computeContextBreakdown } from "./contextBreakdown.ts";
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
