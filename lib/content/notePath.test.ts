import assert from "node:assert/strict";
import { test } from "node:test";
import { noteBreadcrumb, noteHref, parseNotePath } from "./notePath.ts";

test("parseNotePath accepts subject/category/item and two-segment legacy paths", () => {
  assert.deepEqual(parseNotePath("anatomy/textbook/ch09-4"), {
    subjectId: "anatomy",
    categoryId: "textbook",
    itemId: "ch09-4",
  });
  assert.deepEqual(parseNotePath("probability/1.4"), {
    subjectId: "probability",
    categoryId: "detail",
    itemId: "1.4",
  });
  assert.equal(parseNotePath(""), null);
  assert.equal(parseNotePath("only-id"), null);
});

test("noteHref and breadcrumb keep the composite route readable", () => {
  const parsed = parseNotePath("probability/detail/1.4")!;
  assert.equal(noteHref(parsed), "/probability/detail/1.4");
  const crumb = noteBreadcrumb(parsed, "条件概率");
  assert.match(crumb, /概率论/);
  assert.match(crumb, /详解/);
});
