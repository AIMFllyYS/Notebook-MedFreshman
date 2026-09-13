import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isRegisteredCourseName,
  normalizeCourseName,
  resolveSubjectByCourseName,
  UnknownCourseError,
} from "@/lib/content/lectures/subjectAliases";

test("分析化学显式映射到 instrumental-analysis，而不是 chemistry", () => {
  assert.equal(resolveSubjectByCourseName("分析化学"), "instrumental-analysis");
  assert.notEqual(resolveSubjectByCourseName("分析化学"), "chemistry");
});

test("常见课程名 / 简称映射", () => {
  assert.equal(resolveSubjectByCourseName("有机化学"), "chemistry");
  assert.equal(resolveSubjectByCourseName("人体组织学"), "histology");
  assert.equal(resolveSubjectByCourseName("生化"), "biochemistry");
  assert.equal(resolveSubjectByCourseName("生物化学与分子生物学"), "biochemistry");
  assert.equal(resolveSubjectByCourseName("系统解剖学"), "anatomy");
});

test("全角括号与多余空格归一后仍可匹配", () => {
  assert.equal(normalizeCourseName("  概率论与数理统计（全英文） "), "概率论与数理统计(全英文)");
  assert.equal(resolveSubjectByCourseName("概率论与数理统计（全英文）"), "probability");
});

test("未登记课程名抛 UnknownCourseError，绝不静默并入相近学科", () => {
  assert.throws(() => resolveSubjectByCourseName("不存在的课程"), UnknownCourseError);
  assert.equal(isRegisteredCourseName("创新管理"), false);
  assert.throws(() => resolveSubjectByCourseName("医学研究规范与技能"), UnknownCourseError);
});
