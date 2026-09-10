import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { CONTENT_PATH_RESOLVERS, LEGACY_CHAPTERS_ROOT } from "@/lib/content/contentPaths";

test("legacy-chapters：detail 小节解析到 content/chapters/ch01/1.1.md", () => {
  const got = CONTENT_PATH_RESOLVERS["legacy-chapters"]("probability", "detail", "1.1", "md");
  assert.equal(got, path.join(LEGACY_CHAPTERS_ROOT, "ch01", "1.1.md"));
});

test("legacy-chapters：detail 章级 id 解析到 content/chapters/ch01/index.md", () => {
  const got = CONTENT_PATH_RESOLVERS["legacy-chapters"]("probability", "detail", "ch01", "md");
  assert.equal(got, path.join(LEGACY_CHAPTERS_ROOT, "ch01", "index.md"));
});

test("legacy-chapters：非 detail 仍走 subject-tree", () => {
  const got = CONTENT_PATH_RESOLVERS["legacy-chapters"]("probability", "summary", "sum-01", "md");
  assert.equal(got, path.join(process.cwd(), "content", "probability", "summary", "sum-01.md"));
});

test("subject-tree：解析到 content/<subject>/<category>/<id>.md", () => {
  const got = CONTENT_PATH_RESOLVERS["subject-tree"]("histology", "textbook", "ch02-1", "md");
  assert.equal(got, path.join(process.cwd(), "content", "histology", "textbook", "ch02-1.md"));
});
