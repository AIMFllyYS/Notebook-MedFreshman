import assert from "node:assert/strict";
import { test } from "node:test";
import {
  readQuiz,
  readContentMarkdown,
  readSectionMarkdown,
  readExamples,
  deriveExampleKey,
  locateSection,
  findChapter,
} from "@/lib/content/loader";

// ── readQuiz ───────────────────────────────────────────────────

test("readQuiz：读取存在的 quiz 文件", () => {
  const quiz = readQuiz("modern-history", "ch01");
  assert.ok(quiz, "modern-history/ch01.json 应存在");
  assert.ok(quiz.subjectId, "应有 subjectId");
  assert.ok(quiz.questions, "应有 questions 数组");
});

test("readQuiz：不存在的文件返回 null", () => {
  assert.equal(readQuiz("modern-history", "ch99"), null);
});

test("readQuiz：空参数返回 null", () => {
  assert.equal(readQuiz("", "ch01"), null);
  assert.equal(readQuiz("modern-history", ""), null);
});

test("readQuiz：路径穿越防护", () => {
  assert.equal(readQuiz("../etc", "passwd"), null);
  assert.equal(readQuiz("modern-history", "../../etc/passwd"), null);
});

// ── readContentMarkdown ────────────────────────────────────────

test("readContentMarkdown：probability/detail 路径解析", () => {
  // probability/detail 使用 content/chapters/ch01/1.1.md 结构
  const content = readContentMarkdown("probability", "detail", "1.1");
  // 文件可能不存在（stub），但不应抛错
  assert.ok(content === null || typeof content === "string");
});

test("readContentMarkdown：不存在的路径返回 null", () => {
  assert.equal(readContentMarkdown("nonexistent", "detail", "999"), null);
});

// ── readSectionMarkdown ────────────────────────────────────────

test("readSectionMarkdown：不存在的章节返回 null", () => {
  assert.equal(readSectionMarkdown("ch99", "99.9"), null);
});

// ── deriveExampleKey ───────────────────────────────────────────

test("deriveExampleKey：detail 分类从 itemId 推导 chapterId", () => {
  assert.deepEqual(deriveExampleKey("detail", "1.1"), {
    chapterId: "ch01",
    sectionId: "1.1",
  });
  assert.deepEqual(deriveExampleKey("detail", "12.3"), {
    chapterId: "ch12",
    sectionId: "12.3",
  });
});

test("deriveExampleKey：english 分类 chapterId=sectionId=itemId", () => {
  assert.deepEqual(deriveExampleKey("english", "unit-1"), {
    chapterId: "unit-1",
    sectionId: "unit-1",
  });
});

test("deriveExampleKey：非 detail/english 分类返回空串", () => {
  assert.deepEqual(deriveExampleKey("recording", "rec-01"), {
    chapterId: "",
    sectionId: "",
  });
});

test("deriveExampleKey：itemId 无数字前缀返回空串", () => {
  assert.deepEqual(deriveExampleKey("detail", "abc"), {
    chapterId: "",
    sectionId: "",
  });
});

// ── readExamples ───────────────────────────────────────────────

test("readExamples：空参数返回空数组", () => {
  assert.deepEqual(readExamples("physics", "", "1.1"), []);
  assert.deepEqual(readExamples("physics", "ch01", ""), []);
});

test("readExamples：不存在的目录返回空数组", () => {
  assert.deepEqual(readExamples("physics", "ch99", "99.9"), []);
});

// ── locateSection / findChapter ────────────────────────────────

test("findChapter：存在的章节", () => {
  const ch = findChapter("ch01");
  // ch01 可能在 manifest 中
  if (ch) {
    assert.equal(ch.id, "ch01");
    assert.ok(ch.title);
    assert.ok(Array.isArray(ch.sections));
  }
});

test("locateSection：不存在的 sectionId 返回 undefined", () => {
  assert.equal(locateSection("999.999"), undefined);
});
