import assert from "node:assert/strict";
import { test } from "node:test";
import { assembleReference, pickReferenceTier, summarizePageMarkdown } from "./referenceTiers.ts";

test("pickReferenceTier：overflow → outline，compact → summary，否则 full", () => {
  assert.equal(pickReferenceTier({ overflow: true }), "outline");
  assert.equal(pickReferenceTier({ compact: true }), "summary");
  assert.equal(pickReferenceTier({}), "full");
});

test("assembleReference 按档位丢全文再丢摘要，目录最后留", () => {
  const parts = {
    outline: "概率论, 物理",
    summary: "## 当前页摘要：古典概型\n- 样本空间",
    full: "## 当前内容：古典概型\n很长的正文".repeat(3),
  };
  const outline = assembleReference(parts, "outline");
  const summary = assembleReference(parts, "summary");
  const full = assembleReference(parts, "full");
  assert.match(outline, /课程目录/);
  assert.doesNotMatch(outline, /当前页摘要/);
  assert.doesNotMatch(outline, /很长的正文/);
  assert.match(summary, /当前页摘要/);
  assert.doesNotMatch(summary, /很长的正文/);
  assert.match(full, /很长的正文/);
  assert.ok(full.length > summary.length && summary.length > outline.length);
});

test("summarizePageMarkdown 抽标题与首段", () => {
  const md = "# 标题\n\n第一段说明。\n\n## 小节\n更多";
  const out = summarizePageMarkdown(md, "古典概型");
  assert.match(out, /当前页摘要：古典概型/);
  assert.match(out, /小节/);
  assert.match(out, /第一段说明/);
});
