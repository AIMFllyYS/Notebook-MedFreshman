import assert from "node:assert/strict";
import { test } from "node:test";
import { clampMaxToolRounds, MAX_TOOL_ROUNDS_CAP, MAX_TOOL_STEPS, MIN_TOOL_ROUNDS } from "./toolRounds.ts";

test("clampMaxToolRounds：缺省 / 非法回退默认 6，夹到 1–20", () => {
  assert.equal(clampMaxToolRounds(undefined), MAX_TOOL_STEPS);
  assert.equal(clampMaxToolRounds("x"), MAX_TOOL_STEPS);
  assert.equal(clampMaxToolRounds(null), MIN_TOOL_ROUNDS);
  assert.equal(clampMaxToolRounds(0), MIN_TOOL_ROUNDS);
  assert.equal(clampMaxToolRounds(-3), MIN_TOOL_ROUNDS);
  assert.equal(clampMaxToolRounds(3.6), 4);
  assert.equal(clampMaxToolRounds(20), MAX_TOOL_ROUNDS_CAP);
  assert.equal(clampMaxToolRounds(99), MAX_TOOL_ROUNDS_CAP);
  assert.equal(clampMaxToolRounds(6), 6);
});
