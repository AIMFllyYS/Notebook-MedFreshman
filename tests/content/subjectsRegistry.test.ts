import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  SUBJECT_REGISTRY,
  SUBJECT_IDS,
  SUBJECT_BY_ID,
  isSubjectId,
  subjectName,
  subjectShortName,
  subjectIconName,
  subjectHeader,
  subjectsOfYear,
} from "@/lib/content-data/subjects.registry";
import { isSubjectIconName } from "@/lib/ui/subjectIcons";
import { ACADEMIC_YEAR_IDS, academicYearOfSubject } from "@/lib/constants/academic-year";
import { contentTree } from "@/lib/content-data/manifest";

test("registry：id 唯一且非空", () => {
  const ids = SUBJECT_REGISTRY.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "存在重复学科 id");
  for (const s of SUBJECT_REGISTRY) {
    assert.ok(s.id && s.name && s.shortName && s.color, `字段缺失: ${s.id}`);
    assert.ok(/^[a-z0-9-]+$/.test(s.id), `id 只能是小写字母/数字/连字符: ${s.id}`);
  }
});

test("registry：icon 全部在白名单内", () => {
  for (const s of SUBJECT_REGISTRY) {
    assert.ok(isSubjectIconName(s.icon), `${s.id} 的 icon ${s.icon} 不在 lib/ui/subjectIcons.ts 白名单`);
  }
});

test("registry：year 合法；已有内容的学期都有学科", () => {
  for (const s of SUBJECT_REGISTRY) {
    assert.ok((ACADEMIC_YEAR_IDS as readonly string[]).includes(s.year), `${s.id} year 非法`);
    assert.equal(academicYearOfSubject(s.id), s.year);
  }
  assert.ok(subjectsOfYear("freshman-2").length > 0, "大一下应有学科");
  assert.ok(subjectsOfYear("sophomore-1").length > 0, "大二上应有学科");
  assert.equal(subjectsOfYear("junior-1").length, 0, "大三上尚无学科是合法空学期");
});

test("registry ↔ manifest：学科集合一致，name/icon 由 registry 派生", () => {
  const treeIds = contentTree.subjects.map((s) => s.id).sort();
  assert.deepEqual(treeIds, [...SUBJECT_IDS].sort());
  for (const subject of contentTree.subjects) {
    const meta = SUBJECT_BY_ID[subject.id];
    assert.equal(subject.name, meta.name, `${subject.id} manifest name 与 registry 不一致`);
    assert.equal(subject.icon, meta.icon, `${subject.id} manifest icon 与 registry 不一致`);
  }
});

test("registry：promptFile 若显式指定则文件必须存在；缺省约定文件存在时可被发现", () => {
  const root = path.join(process.cwd(), "lib", "ai", "prompts");
  for (const s of SUBJECT_REGISTRY) {
    if (s.promptFile) {
      assert.ok(fs.existsSync(path.join(root, s.promptFile)), `${s.id} promptFile 不存在: ${s.promptFile}`);
    }
  }
  assert.ok(fs.existsSync(path.join(root, "subjects", "physics.md")));
});

test("helper：isSubjectId / subjectName / subjectShortName / subjectIconName / subjectHeader", () => {
  assert.equal(isSubjectId("physics"), true);
  assert.equal(isSubjectId("nope"), false);
  assert.equal(isSubjectId(undefined), false);
  assert.equal(isSubjectId("constructor"), false, "不得被原型链污染");
  assert.equal(subjectName("physics"), "大学物理");
  assert.equal(subjectName("nope"), "nope");
  assert.equal(subjectName(undefined), "");
  assert.equal(subjectShortName("chemistry"), "有机");
  assert.equal(subjectIconName("nope"), "Folder");
  assert.deepEqual(subjectHeader("maogai"), {
    id: "maogai",
    name: SUBJECT_BY_ID.maogai.name,
    icon: SUBJECT_BY_ID.maogai.icon,
  });
});
