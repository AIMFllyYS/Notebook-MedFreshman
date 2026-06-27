import assert from "node:assert/strict";
import { test } from "node:test";
import { QUICK_PROMPTS } from "./prompts.ts";

test("QUICK_PROMPTS 有 3 个预设", () => {
  assert.equal(QUICK_PROMPTS.length, 3);
});

test("QUICK_PROMPTS 每个有 icon/label/text", () => {
  for (const p of QUICK_PROMPTS) {
    assert.ok(p.icon, "icon 非空");
    assert.ok(p.label, "label 非空");
    assert.ok(p.text, "text 非空");
  }
});

test("QUICK_PROMPTS label 唯一", () => {
  const labels = new Set(QUICK_PROMPTS.map((p) => p.label));
  assert.equal(labels.size, QUICK_PROMPTS.length);
});

test("QUICK_PROMPTS text 唯一", () => {
  const texts = new Set(QUICK_PROMPTS.map((p) => p.text));
  assert.equal(texts.size, QUICK_PROMPTS.length);
});
