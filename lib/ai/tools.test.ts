import assert from "node:assert/strict";
import { test } from "node:test";
import { ALL_TOOLS } from "./tools.ts";

test("ALL_TOOLS 包含核心工具", () => {
  assert.ok(ALL_TOOLS.getCurrentPage, "应有 getCurrentPage");
  assert.ok(ALL_TOOLS.getOutline, "应有 getOutline");
  assert.ok(ALL_TOOLS.getSection, "应有 getSection");
  assert.ok(ALL_TOOLS.searchNotes, "应有 searchNotes");
});

test("ALL_TOOLS 每个工具有 function 定义", () => {
  for (const [name, tool] of Object.entries(ALL_TOOLS)) {
    assert.equal(tool.type, "function", `${name} type 应为 function`);
    assert.ok(tool.function.name, `${name} function.name 非空`);
    assert.ok(tool.function.description, `${name} function.description 非空`);
    assert.ok(tool.function.parameters, `${name} function.parameters 非空`);
  }
});

test("ALL_TOOLS 工具名与 key 一致", () => {
  for (const [name, tool] of Object.entries(ALL_TOOLS)) {
    assert.equal(tool.function.name, name, `工具 key ${name} 应与 function.name 一致`);
  }
});

test("ALL_TOOLS getSection 接受 path 和 sectionId 参数", () => {
  const params = ALL_TOOLS.getSection.function.parameters;
  assert.ok(params.properties?.path, "getSection 应有 path 参数");
  assert.ok(params.properties?.sectionId, "getSection 应有 sectionId 参数");
});

test("ALL_TOOLS searchNotes 接受 query 参数", () => {
  const params = ALL_TOOLS.searchNotes.function.parameters;
  assert.ok(params.properties?.query, "searchNotes 应有 query 参数");
});
