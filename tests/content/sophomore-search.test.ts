import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { academicYearOfSubject } from "@/lib/constants/academic-year";
import { getMultiSubjectOutline, searchAllContent, readContentMarkdown } from "@/lib/content/loader";

test("getOutline 大二上学期可见四本教材路径", () => {
  const outline = getMultiSubjectOutline("sophomore-1");
  assert.ok(outline.includes("cell-biology/textbook/"));
  assert.ok(outline.includes("biochemistry/textbook/"));
  assert.ok(outline.includes("anatomy/textbook/"));
  assert.ok(outline.includes("histology/textbook/"));
  assert.equal(outline.includes("probability/"), false);
});

test("searchAllContent 学年=大二上：命中来自四本教材", async () => {
  const queries: Array<{ q: string; subject: string }> = [
    { q: "解剖学姿势", subject: "anatomy" },
    { q: "被覆上皮", subject: "histology" },
    { q: "内膜系统", subject: "cell-biology" },
    { q: "氨基酸是蛋白质的基本结构单位", subject: "biochemistry" },
  ];
  for (const { q, subject } of queries) {
    const hits = await searchAllContent(q, { limit: 8, academicYear: "sophomore-1" });
    assert.ok(hits.length > 0, `大二检索「${q}」应有命中`);
    assert.ok(
      hits.every((h) => academicYearOfSubject(h.subjectId) === "sophomore-1"),
      `「${q}」学年过滤后出现了大一科目`,
    );
    assert.ok(
      hits.some((h) => h.subjectId === subject),
      `「${q}」应命中 ${subject}，实际 ${hits.map((h) => h.path).join(",")}`,
    );
  }
});

test("searchAllContent 跨学年仍能命中大一笔记", async () => {
  const hits = await searchAllContent("贝叶斯公式", { limit: 8, academicYear: "all" });
  assert.ok(hits.some((h) => h.subjectId === "probability"), "跨学年应能检索到概率论贝叶斯");
});

test("hybrid 索引含大二教材，关闭子串回退仍能命中", async () => {
  const metaPath = path.join(process.cwd(), "content", ".index", "chunks-meta.json");
  assert.ok(fs.existsSync(metaPath), "content/.index/chunks-meta.json 应存在（pnpm build-index）");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    chunks: Array<{ subjectId: string; path: string; text: string }>;
  };
  const sophomore = new Set(["anatomy", "histology", "cell-biology", "biochemistry"]);
  const sophChunks = meta.chunks.filter((c) => sophomore.has(c.subjectId));
  assert.ok(sophChunks.length > 0, "索引 chunks 必须包含大二科目");
  for (const id of sophomore) {
    assert.ok(
      sophChunks.some((c) => c.subjectId === id && c.path.includes("/textbook/")),
      `索引缺少 ${id} 教材 chunks`,
    );
  }

  const hits = await searchAllContent("被覆上皮", {
    limit: 8,
    academicYear: "sophomore-1",
    allowSubstring: false,
  });
  assert.ok(hits.length > 0, "关闭子串回退后 hybrid/BM25 仍应命中大二教材");
  assert.ok(
    hits.every((h) => academicYearOfSubject(h.subjectId) === "sophomore-1"),
    "学年过滤后不应出现大一",
  );
  assert.ok(
    hits.some((h) => h.subjectId === "histology"),
    `被覆上皮应命中组织学，实际 ${hits.map((h) => h.path).join(",")}`,
  );
});

test("readContentMarkdown 读大二教材叶子", () => {
  const md = readContentMarkdown("histology", "textbook", "ch02-1");
  assert.ok(md && md.includes("被覆上皮"));
  const ana = readContentMarkdown("anatomy", "textbook", "ch00-5");
  assert.ok(ana && (ana.includes("解剖学姿势") || ana.includes("方位")));
});
