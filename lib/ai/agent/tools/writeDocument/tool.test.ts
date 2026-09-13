import assert from "node:assert/strict";
import { test } from "node:test";
import { createWriteDocumentTool } from "./tool.ts";
import { documentSpecSchema, validateDocumentSpec } from "@/lib/ai/agent/documentTool";
import type { WriteDocumentOutput } from "./types.ts";
import type { StudyToolContext } from "@/lib/ai/agent/tools/_shared";

const ctx: StudyToolContext = {
  subjectId: "probability",
  categoryId: "detail",
  itemId: "1.4",
  skills: [],
  academicYear: "freshman-2",
  modelId: "z-ai/glm-5.3-flash",
};

const execOpts = {
  toolCallId: "doc1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("writeDocument 描述只承诺 Markdown 导出", () => {
  const tool = createWriteDocumentTool(ctx);
  assert.match(String(tool.description), /仅支持导出 Markdown/);
  assert.doesNotMatch(String(tool.description), /Word|LaTeX|PDF/);
});

test("writeDocument：合法 spec 下发卡片 id", async () => {
  const result = (await createWriteDocumentTool(ctx).execute!(
    { title: "复习讲义", format: "markdown", genre: "review-notes", brief: "总结本章" },
    execOpts,
  )) as WriteDocumentOutput;
  assert.equal(result.documentId, "doc_doc1");
  assert.equal(result.modelId, "z-ai/glm-5.3-flash");
  assert.equal(result.unsupportedReason, undefined);
  assert.match(result.text, /复习讲义/);
});

test("writeDocument：模型给 docx / pdf 也归一化成 markdown（交付只有 .md）", () => {
  for (const format of ["docx", "pdf"]) {
    const parsed = validateDocumentSpec({
      title: "复习讲义",
      format,
      genre: "review-notes",
      brief: "总结本章",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.spec.format, "markdown");
  }
  // 工具 schema 不再向模型描述 Word / PDF。
  assert.doesNotMatch(String(documentSpecSchema.shape.format.description), /docx|pdf|Word|PDF/);
});

test("writeDocument：非法 spec 返回 unsupportedReason 且仍带 documentId", async () => {
  const result = (await createWriteDocumentTool(ctx).execute!(
    { title: "", format: "markdown", genre: "article", brief: "" },
    execOpts,
  )) as WriteDocumentOutput;
  assert.equal(result.documentId, "doc_doc1");
  assert.ok(result.unsupportedReason);
  assert.match(result.text, /校验未通过/);
});
