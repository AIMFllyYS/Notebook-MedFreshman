import assert from "node:assert/strict";
import { test } from "node:test";
import { MODELS, CUSTOM_MODEL_ID, DEFAULT_MODEL_ID, getModelInfo, getModelGroups } from "./models.ts";

test("MODELS 非空且每个模型有必需字段", () => {
  assert.ok(MODELS.length > 0);
  for (const m of MODELS) {
    assert.ok(m.id, "model id 非空");
    assert.ok(m.label, `model label 非空: ${m.id}`);
    assert.ok(m.group, `model group 非空: ${m.id}`);
    assert.ok(typeof m.thinking === "boolean", `thinking 是布尔: ${m.id}`);
    assert.ok(typeof m.tools === "boolean", `tools 是布尔: ${m.id}`);
    assert.ok(m.hint, `hint 非空: ${m.id}`);
  }
});

test("CUSTOM_MODEL_ID 是 'custom'", () => {
  assert.equal(CUSTOM_MODEL_ID, "custom");
});

test("DEFAULT_MODEL_ID 存在于 MODELS", () => {
  const found = getModelInfo(DEFAULT_MODEL_ID);
  assert.ok(found, `DEFAULT_MODEL_ID ${DEFAULT_MODEL_ID} 应在 MODELS 中`);
});

test("getModelInfo：存在的 id 返回 ModelInfo", () => {
  const m = getModelInfo("mimo-v2.5");
  assert.ok(m);
  assert.equal(m!.id, "mimo-v2.5");
  assert.equal(m!.provider, "mimo");
});

test("getModelInfo：不存在的 id 返回 undefined", () => {
  assert.equal(getModelInfo("nonexistent-model"), undefined);
});

test("getModelGroups：按 group 聚合且保持声明顺序", () => {
  const groups = getModelGroups();
  assert.ok(groups.length > 0);
  // 验证每个 group 至少有一个模型
  for (const g of groups) {
    assert.ok(g.models.length > 0, `group ${g.group} 至少一个模型`);
  }
  // 验证顺序：第一个 group 应是 "小米 MiMo"
  assert.equal(groups[0].group, "小米 MiMo");
});

test("getModelGroups：所有模型都被分组覆盖", () => {
  const groups = getModelGroups();
  const totalModels = groups.reduce((sum, g) => sum + g.models.length, 0);
  assert.equal(totalModels, MODELS.length);
});

test("MODELS：model id 唯一", () => {
  const ids = new Set<string>();
  for (const m of MODELS) {
    assert.ok(!ids.has(m.id), `model id 重复: ${m.id}`);
    ids.add(m.id);
  }
});
