import assert from "node:assert/strict";
import { test } from "node:test";
import { strToU8, zipSync } from "fflate";
import { detectSkillImportKind, parseSkillArchive } from "./importSkills.ts";

test("detectSkillImportKind：md / zip / .skill", () => {
  assert.equal(detectSkillImportKind("note.md"), "markdown");
  assert.equal(detectSkillImportKind("pack.zip"), "archive");
  assert.equal(detectSkillImportKind("review.skill"), "archive");
  assert.equal(detectSkillImportKind("notes.txt"), "unknown");
});

test("parseSkillArchive：优先 SKILL.md，名称回退目录名", () => {
  const bytes = zipSync({
    "错题复盘/SKILL.md": strToU8("---\nname: 错题复盘\ndescription: 分析错因\n---\n按步骤复盘。"),
    "错题复盘/scripts/run.sh": strToU8("echo skip"),
    "__MACOSX/SKILL.md": strToU8("mac junk"),
  });
  const skills = parseSkillArchive(bytes, "pack.skill");
  assert.equal(skills.length, 1);
  assert.equal(skills[0]?.name, "错题复盘");
  assert.equal(skills[0]?.description, "分析错因");
  assert.equal(skills[0]?.content, "按步骤复盘。");
});

test("parseSkillArchive：无 SKILL.md 时导入包内全部 md", () => {
  const bytes = zipSync({
    "a.md": strToU8("# A\n\n第一项"),
    "nested/b.markdown": strToU8("---\nname: B技能\n---\n正文B"),
  });
  const skills = parseSkillArchive(bytes, "loose.zip");
  assert.equal(skills.length, 2);
  assert.deepEqual(skills.map((s) => s.name).sort(), ["B技能", "a"]);
});
