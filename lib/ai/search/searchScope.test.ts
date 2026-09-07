import assert from "node:assert/strict";
import { test } from "node:test";
import { chunkInScope } from "./searchScope.ts";

test("chunkInScope：无过滤放行", () => {
  assert.equal(chunkInScope("anatomy"), true);
  assert.equal(chunkInScope("probability", {}), true);
  assert.equal(chunkInScope("anatomy", { academicYear: "all" }), true);
});

test("chunkInScope：学年硬过滤", () => {
  assert.equal(chunkInScope("anatomy", { academicYear: "sophomore-1" }), true);
  assert.equal(chunkInScope("probability", { academicYear: "sophomore-1" }), false);
  assert.equal(chunkInScope("anatomy", { academicYear: "freshman-2" }), false);
  assert.equal(chunkInScope("probability", { academicYear: "freshman-2" }), true);
});

test("chunkInScope：科目硬过滤优先于学年", () => {
  assert.equal(chunkInScope("histology", { subjectId: "histology", academicYear: "sophomore-1" }), true);
  assert.equal(chunkInScope("anatomy", { subjectId: "histology", academicYear: "sophomore-1" }), false);
});
