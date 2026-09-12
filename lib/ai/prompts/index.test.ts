import assert from "node:assert/strict";
import { test } from "node:test";
import { SUBJECT_REGISTRY } from "@/lib/content-data/subjects.registry";
import { describeSubjectsByYear } from "@/lib/content-data/subjectsTable";
import { QUIZ_MAX_QUESTIONS } from "@/lib/ai/agent/quizTool";
import { buildLocationLine, buildSystemPrompt } from "./index.ts";

test("buildSystemPrompt：稳定 global 在前，学科名在后，换科目只从学科段失效", () => {
  const prob = buildSystemPrompt({ subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "" });
  const phys = buildSystemPrompt({ subjectId: "physics", categoryId: "detail", itemId: "1.1", currentTopic: "" });
  const split = "当前科目：";
  const probHead = prob.slice(0, prob.indexOf(split));
  const physHead = phys.slice(0, phys.indexOf(split));
  assert.ok(probHead.length > 80);
  assert.equal(probHead, physHead);
  assert.match(prob, /当前科目：/);
  assert.notEqual(prob, phys);
});

test("buildSystemPrompt：科目表覆盖 registry 全科，含医学英语/仪分/医学统计/细胞实验/其他", () => {
  const prompt = buildSystemPrompt({ subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "" });
  const table = describeSubjectsByYear({ includeOther: true, name: "full", joiner: "、" });
  assert.match(prompt, /当前学年/);
  assert.ok(prompt.includes(table), "组装后的 system 应插入 registry 动态科目表");
  assert.doesNotMatch(prompt, /\{subjectTable\}/);
  for (const subject of SUBJECT_REGISTRY) {
    assert.ok(
      prompt.includes(subject.name) || prompt.includes(subject.shortName),
      `提示词漏了科目 ${subject.id}（${subject.name}）`,
    );
  }
  assert.match(prompt, /医学英语/);
  assert.match(prompt, /仪器分析/);
  assert.match(prompt, /医学统计学/);
  assert.match(prompt, /细胞生物学实验/);
  assert.match(prompt, /其他/);
});

test("buildSystemPrompt：工具清单含 useSkill；出题 1–12；导出只承诺 Markdown；韦恩图用 props", () => {
  const prompt = buildSystemPrompt({ subjectId: "histology", categoryId: "textbook", itemId: "ch01-1", currentTopic: "" });
  assert.match(prompt, /\*\*useSkill\*\*/);
  assert.match(prompt, /可调用的技能库/);
  assert.match(prompt, new RegExp(`1–${QUIZ_MAX_QUESTIONS} 题`));
  assert.doesNotMatch(prompt, /1–6 题/);
  assert.match(prompt, /仅支持导出 Markdown/);
  assert.doesNotMatch(prompt, /Word \/ LaTeX \/ PDF/);
  assert.match(prompt, /<InteractiveVenn a=\{0\.3\} b=\{0\.25\} ab=\{0\.1\} aLabel=/);
  assert.doesNotMatch(prompt, /<InteractiveVenn>集合A\|集合B\|交集标签/);
  assert.match(prompt, /单次请求（本次回答）合计最多抓取 20 张/);
});

test("buildLocationLine：学年在定位行，换学年 / 换页只改这一行", () => {
  const page = {
    subjectId: "probability",
    categoryId: "detail",
    itemId: "1.4",
    currentTopic: "古典概型",
    academicYear: "freshman-2",
  };
  const samePageNewYear = buildLocationLine({ ...page, academicYear: "sophomore-1" });
  const sameYearNewPage = buildLocationLine({ ...page, itemId: "1.5", currentTopic: "几何概型" });
  const original = buildLocationLine(page);
  assert.match(original, /学年：大一下学期/);
  assert.match(samePageNewYear, /学年：大二上学期/);
  assert.equal(original.includes("1.4"), true);
  assert.equal(sameYearNewPage.includes("1.5"), true);
  assert.notEqual(original, samePageNewYear);
  assert.notEqual(original, sameYearNewPage);
});
