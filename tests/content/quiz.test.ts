import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { QuizData, QuestionType } from "@/lib/quiz/types";

const QUIZ_ROOT = join(process.cwd(), "content", "quiz");

const VALID_TYPES: QuestionType[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "analysis",
  "fill_blank",
  "essay",
  "reading",
  "cloze",
  "translation",
];

function findQuizFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findQuizFiles(full, out);
    } else if (entry.name.endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}

const quizFiles = findQuizFiles(QUIZ_ROOT);

test("quiz 目录下存在 JSON 文件", () => {
  assert.ok(quizFiles.length > 0, "应至少有一个 quiz JSON 文件");
});

for (const file of quizFiles) {
  const rel = file.replace(process.cwd() + "\\", "").replace(/\\/g, "/");

  test(`${rel}：可解析为 QuizData`, () => {
    const raw = readFileSync(file, "utf8");
    const data = JSON.parse(raw) as QuizData;
    assert.ok(data, "JSON 不为空");
  });

  test(`${rel}：顶层字段完整`, () => {
    const data = JSON.parse(readFileSync(file, "utf8")) as QuizData;
    assert.ok(data.subjectId, "subjectId 非空");
    assert.ok(data.chapterId, "chapterId 非空");
    assert.ok(data.generatedAt, "generatedAt 非空");
    assert.ok(data.examConfig, "examConfig 非空");
    assert.ok(Array.isArray(data.questions), "questions 是数组");
    assert.ok(data.questions.length > 0, "questions 非空");
  });

  test(`${rel}：每题字段合法`, () => {
    const data = JSON.parse(readFileSync(file, "utf8")) as QuizData;
    const ids = new Set<string>();
    for (const q of data.questions) {
      assert.ok(q.id, "题 id 非空");
      assert.ok(!ids.has(q.id), `题 id 重复: ${q.id}`);
      ids.add(q.id);
      assert.ok(
        VALID_TYPES.includes(q.type),
        `题型不合法: ${q.type} (题 ${q.id})`,
      );
      assert.ok(typeof q.points === "number" && q.points >= 0, `分值应为非负数: ${q.id}`);
      // 复合题型（reading/cloze/translation）用 passage/blanks/items 代替 stem
      if (q.type === "reading" || q.type === "cloze") {
        assert.ok(q.passage || q.stem, `${q.type} 题需 passage 或 stem: ${q.id}`);
      } else if (q.type === "translation") {
        assert.ok(q.items || q.stem, `translation 题需 items 或 stem: ${q.id}`);
      } else {
        assert.ok(q.stem, `题干非空: ${q.id}`);
      }
    }
  });

  test(`${rel}：选择题 answer 索引在 options 范围内`, () => {
    const data = JSON.parse(readFileSync(file, "utf8")) as QuizData;
    for (const q of data.questions) {
      if (q.type === "single_choice" || q.type === "true_false") {
        assert.ok(Array.isArray(q.options), `single_choice 需 options: ${q.id}`);
        assert.ok(
          typeof q.answer === "number" && q.answer >= 0 && q.answer < q.options.length,
          `answer 索引越界: ${q.id} answer=${q.answer} options.length=${q.options.length}`,
        );
      }
      if (q.type === "multiple_choice") {
        assert.ok(Array.isArray(q.options), `multiple_choice 需 options: ${q.id}`);
        assert.ok(Array.isArray(q.answer), `multiple_choice answer 应为数组: ${q.id}`);
        for (const idx of q.answer as number[]) {
          assert.ok(
            idx >= 0 && idx < q.options.length,
            `multiple_choice answer 索引越界: ${q.id} idx=${idx}`,
          );
        }
      }
    }
  });

  test(`${rel}：reading 题有 subQuestions`, () => {
    const data = JSON.parse(readFileSync(file, "utf8")) as QuizData;
    for (const q of data.questions) {
      if (q.type === "reading") {
        assert.ok(q.passage, `reading 需 passage: ${q.id}`);
        assert.ok(Array.isArray(q.subQuestions) && q.subQuestions.length > 0, `reading 需 subQuestions: ${q.id}`);
        for (const sq of q.subQuestions) {
          assert.ok(sq.id, `reading 子题 id 非空: ${q.id}`);
          assert.ok(sq.stem, `reading 子题 stem 非空: ${sq.id}`);
          assert.ok(typeof sq.points === "number" && sq.points > 0, `reading 子题分值应为正: ${sq.id}`);
        }
      }
    }
  });

  test(`${rel}：cloze 题有 blanks`, () => {
    const data = JSON.parse(readFileSync(file, "utf8")) as QuizData;
    for (const q of data.questions) {
      if (q.type === "cloze") {
        assert.ok(Array.isArray(q.blanks) && q.blanks.length > 0, `cloze 需 blanks: ${q.id}`);
        for (const b of q.blanks) {
          assert.ok(b.id, `cloze blank id 非空: ${q.id}`);
          assert.ok(Array.isArray(b.options) && b.options.length > 0, `cloze blank 需 options: ${b.id}`);
          assert.ok(typeof b.answer === "number" && b.answer >= 0 && b.answer < b.options.length, `cloze blank answer 越界: ${b.id}`);
        }
      }
    }
  });

  test(`${rel}：translation 题有 items`, () => {
    const data = JSON.parse(readFileSync(file, "utf8")) as QuizData;
    for (const q of data.questions) {
      if (q.type === "translation") {
        assert.ok(Array.isArray(q.items) && q.items.length > 0, `translation 需 items: ${q.id}`);
        for (const item of q.items) {
          assert.ok(item.id, `translation item id 非空: ${q.id}`);
          assert.ok(item.source, `translation item source 非空: ${item.id}`);
          assert.ok(item.reference, `translation item reference 非空: ${item.id}`);
        }
      }
    }
  });
}
