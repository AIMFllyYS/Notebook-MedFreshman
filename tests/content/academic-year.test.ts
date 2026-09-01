import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { contentTree } from "@/lib/content-data/manifest";
import {
  ACADEMIC_YEAR_IDS,
  ACADEMIC_YEAR_LABELS,
  academicYearOfSubject,
  filterSubjectsByYear,
  filterContentTreeByYear,
  subjectVisibleToAgent,
} from "@/lib/constants/academic-year";
import {
  getMultiSubjectOutline,
  searchAllContent,
} from "@/lib/content/loader";

const ROOT = process.cwd();

test("学年值存在：大一下学期 / 大二上学期", () => {
  assert.deepEqual([...ACADEMIC_YEAR_IDS], ["freshman-2", "sophomore-1"]);
  assert.equal(ACADEMIC_YEAR_LABELS["freshman-2"], "大一下学期");
  assert.equal(ACADEMIC_YEAR_LABELS["sophomore-1"], "大二上学期");
});

test("切换到大二上学期后导航树只有四本新书，不含大一科目", () => {
  const subjects = filterSubjectsByYear(contentTree.subjects, "sophomore-1");
  const ids = subjects.map((s) => s.id).sort();
  assert.deepEqual(ids, ["anatomy", "biochemistry", "cell-biology", "histology"].sort());
  const names = subjects.map((s) => s.name).join(" ");
  for (const forbidden of ["概率论", "大学物理", "有机化学", "近现代史", "毛概"]) {
    assert.equal(names.includes(forbidden), false, `大二上不应出现 ${forbidden}`);
  }
  for (const expected of ["医学细胞生物学", "生物化学与分子生物学", "系统解剖学", "组织学与胚胎学"]) {
    assert.ok(names.includes(expected), `大二上应包含 ${expected}`);
  }
});

test("切换到大一下学期后导航树是原科目，不含四本新书", () => {
  const subjects = filterSubjectsByYear(contentTree.subjects, "freshman-2");
  const ids = new Set(subjects.map((s) => s.id));
  assert.ok(ids.has("probability"));
  assert.ok(ids.has("physics"));
  assert.ok(ids.has("chemistry"));
  assert.ok(ids.has("modern-history"));
  assert.ok(ids.has("maogai"));
  assert.equal(ids.has("anatomy"), false);
  assert.equal(ids.has("biochemistry"), false);
  assert.equal(ids.has("cell-biology"), false);
  assert.equal(ids.has("histology"), false);
});

test("学年切换只隐藏大一内容，磁盘文件仍在", () => {
  const samples = [
    path.join(ROOT, "content", "chapters", "ch01", "1.1.md"),
    path.join(ROOT, "content", "physics", "detail"),
    path.join(ROOT, "content", "chemistry"),
    path.join(ROOT, "content", "maogai", "textbook"),
    path.join(ROOT, "content", "modern-history", "textbook"),
  ];
  for (const p of samples) {
    assert.ok(fs.existsSync(p), `大一内容应仍在磁盘: ${p}`);
  }
});

test("filterContentTreeByYear 从真实 contentTree 出发过滤", () => {
  const soph = filterContentTreeByYear(contentTree, "sophomore-1");
  assert.equal(soph.subjects.length, 4);
  const fresh = filterContentTreeByYear(contentTree, "freshman-2");
  assert.ok(fresh.subjects.some((s) => s.id === "probability"));
  assert.ok(contentTree.subjects.length > soph.subjects.length);
});

test("getOutline 学年过滤：大二上不含概率论，大一下不含系统解剖", () => {
  const soph = getMultiSubjectOutline("sophomore-1");
  assert.equal(soph.includes("概率论"), false);
  assert.ok(soph.includes("系统解剖学") || soph.includes("anatomy"));
  const fresh = getMultiSubjectOutline("freshman-2");
  assert.ok(fresh.includes("概率论"));
  assert.equal(fresh.includes("系统解剖学"), false);
  const all = getMultiSubjectOutline("all");
  assert.ok(all.includes("概率论"));
});

test("searchAllContent 学年范围：跨学年仍能命中大一笔记", async () => {
  const yearHits = await searchAllContent("贝叶斯公式", {
    limit: 8,
    academicYear: "sophomore-1",
  });
  assert.ok(
    yearHits.every((h) => academicYearOfSubject(h.subjectId) === "sophomore-1"),
    "学年=大二上时命中应全部来自大二科目",
  );

  const cross = await searchAllContent("贝叶斯公式", { limit: 8, academicYear: "all" });
  assert.ok(cross.length > 0, "无限制检索应能命中大一贝叶斯内容");
  assert.ok(
    cross.some((h) => h.subjectId === "probability"),
    "跨学年检索应能命中概率论",
  );
});

test("subjectVisibleToAgent：all 放行跨学年", () => {
  assert.equal(subjectVisibleToAgent("probability", "sophomore-1"), false);
  assert.equal(subjectVisibleToAgent("anatomy", "sophomore-1"), true);
  assert.equal(subjectVisibleToAgent("probability", "all"), true);
  assert.equal(subjectVisibleToAgent("anatomy", "freshman-2"), false);
});
