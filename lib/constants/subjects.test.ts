import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SUBJECTS,
  DEFAULT_CATEGORIES,
  SUBJECT_ICONS,
  SUBJECT_COLORS,
  subjectColor,
  DEFAULT_SUBJECT,
  DEFAULT_CATEGORY,
} from "./subjects.ts";

test("SUBJECTS 覆盖所有 SubjectId", () => {
  const ids = Object.keys(SUBJECTS);
  assert.ok(ids.includes("probability"));
  assert.ok(ids.includes("physics"));
  assert.ok(ids.includes("chemistry"));
  assert.ok(ids.includes("modern-history"));
  assert.ok(ids.includes("maogai"));
  assert.ok(ids.includes("other"));
});

test("SUBJECTS 每个值是中文名称", () => {
  for (const [id, name] of Object.entries(SUBJECTS)) {
    assert.ok(name, `subject name 非空: ${id}`);
    assert.ok(name.length > 0, `subject name 长度 > 0: ${id}`);
  }
});

test("SUBJECT_ICONS 与 SUBJECTS 键一致", () => {
  const subjectKeys = new Set(Object.keys(SUBJECTS));
  const iconKeys = new Set(Object.keys(SUBJECT_ICONS));
  assert.deepEqual([...subjectKeys].sort(), [...iconKeys].sort());
});

test("SUBJECT_COLORS 与 SUBJECTS 键一致", () => {
  const subjectKeys = new Set(Object.keys(SUBJECTS));
  const colorKeys = new Set(Object.keys(SUBJECT_COLORS));
  assert.deepEqual([...subjectKeys].sort(), [...colorKeys].sort());
});

test("SUBJECT_COLORS 每个值是 hex 颜色", () => {
  for (const [id, color] of Object.entries(SUBJECT_COLORS)) {
    assert.ok(/^#[0-9a-f]{6}$/i.test(color), `color 是 hex: ${id} = ${color}`);
  }
});

test("subjectColor：已知 id 返回对应颜色", () => {
  assert.equal(subjectColor("probability"), SUBJECT_COLORS.probability);
  assert.equal(subjectColor("physics"), SUBJECT_COLORS.physics);
});

test("subjectColor：未知 id 回退石板灰", () => {
  assert.equal(subjectColor("nonexistent"), "#64748b");
});

test("DEFAULT_SUBJECT 是 probability", () => {
  assert.equal(DEFAULT_SUBJECT, "probability");
});

test("DEFAULT_CATEGORY 是 detail", () => {
  assert.equal(DEFAULT_CATEGORY, "detail");
});

test("DEFAULT_CATEGORIES 有 4 个分类", () => {
  assert.ok(DEFAULT_CATEGORIES.textbook);
  assert.ok(DEFAULT_CATEGORIES.detail);
  assert.ok(DEFAULT_CATEGORIES.recording);
  assert.ok(DEFAULT_CATEGORIES.summary);
});
