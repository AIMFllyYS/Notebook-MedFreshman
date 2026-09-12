import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLocationLine, buildSystemPrompt } from "./index.ts";

test("buildSystemPrompt：稳定 global 在前，学科名在后，换科目只从学科段失效", () => {
  const prob = buildSystemPrompt({ subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "" });
  const phys = buildSystemPrompt({ subjectId: "physics", categoryId: "detail", itemId: "1.1", currentTopic: "" });
  const split = "当前科目：";
  const probHead = prob.slice(0, prob.indexOf(split));
  const physHead = phys.slice(0, phys.indexOf(split));
  assert.ok(probHead.length > 80);
  assert.equal(probHead, physHead);
  assert.match(prob, /当前科目：/);
  assert.notEqual(prob, phys);
});

test("buildLocationLine：学年在定位行，换学年 / 换页只改这一行", () => {
  const page = {
    subjectId: "probability",
    categoryId: "detail",
    itemId: "1.4",
    currentTopic: "古典概型",
    academicYear: "freshman-2",
  };
  const samePageNewYear = buildLocationLine({ ...page, academicYear: "sophomore-1" });
  const sameYearNewPage = buildLocationLine({ ...page, itemId: "1.5", currentTopic: "几何概型" });
  const original = buildLocationLine(page);
  assert.match(original, /学年：大一下学期/);
  assert.match(samePageNewYear, /学年：大二上学期/);
  assert.equal(original.includes("1.4"), true);
  assert.equal(sameYearNewPage.includes("1.5"), true);
  assert.notEqual(original, samePageNewYear);
  assert.notEqual(original, sameYearNewPage);
});
