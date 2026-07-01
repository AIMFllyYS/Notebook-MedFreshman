import assert from "node:assert/strict";
import { test } from "node:test";
import { CALLOUT_TYPES, CALLOUTS, CALLOUT_META, type CalloutType } from "./calloutTypes.ts";

test("CALLOUT_TYPES 包含 8 种类型", () => {
  assert.equal(CALLOUT_TYPES.length, 8);
});

test("CALLOUTS Set 与 CALLOUT_TYPES 一致", () => {
  for (const t of CALLOUT_TYPES) {
    assert.ok(CALLOUTS.has(t), `CALLOUTS 应包含 ${t}`);
  }
});

test("CALLOUT_META 每种类型都有 label 和 cls", () => {
  for (const t of CALLOUT_TYPES) {
    const meta = CALLOUT_META[t];
    assert.ok(meta, `${t} 应有 meta`);
    assert.ok(meta.label, `${t} label 非空`);
    assert.ok(meta.cls, `${t} cls 非空`);
    assert.ok(meta.cls.startsWith("callout-"), `${t} cls 应以 callout- 开头`);
  }
});

test("CalloutType 类型约束：CALLOUT_TYPES as const 确保字面量联合", () => {
  const valid: CalloutType = "definition";
  assert.equal(valid, "definition");
});

test("CALLOUT_META 不含多余键", () => {
  const metaKeys = Object.keys(CALLOUT_META);
  assert.equal(metaKeys.length, CALLOUT_TYPES.length);
});
