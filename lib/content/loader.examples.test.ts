import assert from "node:assert/strict";
import { test } from "node:test";
import { readExamples, readExampleById, readExamplesMeta } from "@/lib/content/loader";

// 路径穿越防护：/api/examples 把查询参数原样透传到 examplesDir，
// 三个路径段都必须过与正文一致的段白名单。

test("readExamplesMeta：subjectId/chapterId/sectionId 含 .. 一律拒绝", () => {
  assert.deepEqual(readExamplesMeta("..", "ch01", "1.1"), []);
  assert.deepEqual(readExamplesMeta("physics", "..", "1.1"), []);
  assert.deepEqual(readExamplesMeta("physics", "ch01", ".."), []);
  assert.deepEqual(readExamplesMeta("../..", "..", ".."), []);
});

test("readExamplesMeta：段内含 / 与 \\ 一律拒绝", () => {
  assert.deepEqual(readExamplesMeta("physics/x", "ch01", "1.1"), []);
  assert.deepEqual(readExamplesMeta("physics", "ch\\01", "1.1"), []);
  assert.deepEqual(readExamplesMeta("physics", "ch01", "1/1"), []);
});

test("readExampleById：穿越参数返回 null 且不抛错", () => {
  assert.equal(readExampleById("..", "ch01", "1.1", "EX01"), null);
  assert.equal(readExampleById("physics", "../..", "1.1", "EX01"), null);
  assert.equal(readExampleById("physics", "ch01", "../../", "EX01"), null);
  // exampleId 侧旧有防护仍在
  assert.equal(readExampleById("physics", "ch01", "1.1", ".."), null);
  assert.equal(readExampleById("physics", "ch01", "1.1", "a/b"), null);
});

test("readExamples：合法参数仍正常读取", () => {
  const metas = readExamplesMeta("physics", "ch01", "1.3");
  assert.ok(metas.length > 0, "physics/ch01/1.3 应能列出例题");
  const first = readExampleById("physics", "ch01", "1.3", metas[0].id);
  assert.ok(first && first.content.length > 0);
  assert.ok(readExamples("physics", "ch01", "1.3").length === metas.length);
});
