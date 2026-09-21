import assert from "node:assert/strict";
import { test } from "node:test";
import { createToolRuntime } from "./_shared.ts";
import { allocateCiteIndex, appendCiteLegend, formatCiteLine, prefixCiteTag } from "./citeIndex.ts";

test("allocateCiteIndex 按请求递增", () => {
  const runtime = createToolRuntime();
  assert.equal(allocateCiteIndex(runtime), 1);
  assert.equal(allocateCiteIndex(runtime), 2);
  assert.equal(runtime.nextCiteIndex, 3);
});

test("appendCiteLegend / prefixCiteTag 把编号写进回灌文本", () => {
  assert.match(appendCiteLegend("综述", [formatCiteLine(1, "维基", "https://example.edu")]), /\[1\] 维基/);
  assert.match(prefixCiteTag("【上皮】\n\n正文", 2, "教材", "histology/textbook/ch02-1"), /\[2\].*histology\/textbook\/ch02-1/);
});
