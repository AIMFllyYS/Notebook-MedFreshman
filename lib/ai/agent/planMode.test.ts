import assert from "node:assert/strict";
import { test } from "node:test";
import { isPlanModeWriteTool, PLAN_MODE_RULE, PLAN_MODE_WRITE_TOOLS } from "./planMode.ts";

test("planMode：写工具名单覆盖文档/HTML/生图/出题/记忆写回", () => {
  for (const name of ["writeDocument", "renderInteractive", "generateImage", "createQuiz", "updateUserNote"] as const) {
    assert.ok(PLAN_MODE_WRITE_TOOLS.includes(name));
    assert.equal(isPlanModeWriteTool(name), true);
  }
  assert.equal(isPlanModeWriteTool("getCurrentPage"), false);
  assert.equal(isPlanModeWriteTool("searchNotes"), false);
  assert.equal(isPlanModeWriteTool("useSkill"), false);
  assert.match(PLAN_MODE_RULE, /计划模式/);
  assert.match(PLAN_MODE_RULE, /只读/);
});
