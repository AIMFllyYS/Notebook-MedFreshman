import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { hybridSearch } from "./hybridSearch.ts";

const manifestPath = path.join(process.cwd(), "content", ".index", "manifest.json");
const hasIndex = fs.existsSync(manifestPath);

function skipIfNoIndex() {
  if (!hasIndex) {
    test("hybridSearch 集成：本地无 content/.index，跳过", { skip: true }, () => {});
    return true;
  }
  return false;
}

if (!skipIfNoIndex()) {
  test("绪论 + cell-biology / 大二上：top-3 含 cell-biology/textbook/ch01", async () => {
    const hits = await hybridSearch("绪论", {
      topK: 8,
      academicYear: "sophomore-1",
      preferSubjectId: "cell-biology",
      queryContext: "医学细胞生物学 第一章 绪论",
    });
    assert.ok(hits.length > 0, "应有命中");
    const top3 = hits.slice(0, 3);
    assert.ok(
      top3.some((h) => h.path.startsWith("cell-biology/textbook/ch01")),
      `top-3 应含细胞生物学第一章，实际 ${top3.map((h) => h.path).join(", ")}`,
    );
  });

  test("第三章 + biochemistry：top-5 含 biochemistry ch03", async () => {
    const hits = await hybridSearch("第三章", {
      topK: 8,
      academicYear: "sophomore-1",
      preferSubjectId: "biochemistry",
      queryContext: "生物化学 第三章",
    });
    assert.ok(hits.length > 0);
    assert.ok(
      hits.slice(0, 5).some((h) => h.subjectId === "biochemistry" && /ch03/.test(h.path)),
      `top-5 应含生化第三章，实际 ${hits.slice(0, 5).map((h) => h.path).join(", ")}`,
    );
  });

  test("被覆上皮：top-1 为 histology", async () => {
    const hits = await hybridSearch("被覆上皮", {
      topK: 5,
      academicYear: "sophomore-1",
      preferSubjectId: "histology",
    });
    assert.ok(hits.length > 0);
    assert.equal(hits[0].subjectId, "histology");
  });

  test("贝叶斯公式 + crossYear：top-3 含 probability", async () => {
    const hits = await hybridSearch("贝叶斯公式", { topK: 8, academicYear: "all" });
    assert.ok(hits.length > 0);
    assert.ok(
      hits.slice(0, 3).some((h) => h.subjectId === "probability"),
      `top-3 应含概率论，实际 ${hits.slice(0, 3).map((h) => h.path).join(", ")}`,
    );
  });

  test("rec-05 + chemistry：top-1 为 chemistry/recording/rec-05", async () => {
    const hits = await hybridSearch("rec-05", {
      topK: 5,
      academicYear: "freshman-2",
      preferSubjectId: "chemistry",
    });
    assert.ok(hits.length > 0);
    assert.ok(
      hits[0].path.startsWith("chemistry/recording/rec-05"),
      `top-1 应为 chemistry/recording/rec-05，实际 ${hits[0].path}`,
    );
  });
}
