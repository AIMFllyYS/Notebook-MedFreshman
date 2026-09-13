import assert from "node:assert/strict";
import { test } from "node:test";
import {
  expectedLessonId,
  validateLessonManifest,
  exampleValidLessonManifest,
} from "@/lib/content/lectures/schema";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

test("合法样例通过校验", () => {
  const r = validateLessonManifest(exampleValidLessonManifest(), {
    expectedDirSubjectId: "instrumental-analysis",
    expectedDirLessonId: "rec-2026-fall-007-008",
  });
  assert.equal(r.ok, true, r.errors.join("; "));
  assert.ok(r.manifest);
});

test("未声明字段被 strict 拒绝（防 typo / 私有键）", () => {
  const raw = clone(exampleValidLessonManifest()) as Record<string, unknown>;
  raw.extra = 1;
  const r = validateLessonManifest(raw);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("结构非法")));
});

test("课程名与 subjectId 不一致报错（防分析化学误进 chemistry）", () => {
  const raw = clone(exampleValidLessonManifest()) as Record<string, unknown>;
  raw.subjectId = "chemistry";
  const r = validateLessonManifest(raw);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("subjectId 不一致")));
});

test("lessonId 与学期实例/节次推导不一致报错", () => {
  const raw = clone(exampleValidLessonManifest()) as Record<string, unknown>;
  raw.lessonId = "rec-2026-fall-005-006";
  const r = validateLessonManifest(raw);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("lessonId")));
});

test("材料文件名/格式被冻结，改动即报错", () => {
  const raw = clone(exampleValidLessonManifest()) as { materials: Record<string, { file: string; format: string }> };
  raw.materials.notes.file = "notes.md";
  const r = validateLessonManifest(raw);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("notes.file")));
});

test("非法日历日期报错", () => {
  const raw = clone(exampleValidLessonManifest()) as Record<string, unknown>;
  raw.taughtOn = "2026-02-30";
  const r = validateLessonManifest(raw);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("taughtOn")));
});

test("expectedLessonId：单节与连堂", () => {
  assert.equal(expectedLessonId("rec-2026-fall", { start: 7, end: 7 }), "rec-2026-fall-007");
  assert.equal(expectedLessonId("rec-2026-fall", { start: 7, end: 8 }), "rec-2026-fall-007-008");
});
