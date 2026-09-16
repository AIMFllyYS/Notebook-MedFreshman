import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_NOTE_MARKDOWN,
  deriveNoteTitle,
  formatFlashcardQuote,
  formatNoteQuote,
  listCourseNoteHits,
  plainSnippet,
  subjectLabel,
  userNoteWindowId,
} from "@/lib/notes/userNote";

test("deriveNoteTitle prefers the first ATX heading", () => {
  assert.equal(deriveNoteTitle("# 泊松分布\n\n正文"), "泊松分布");
  assert.equal(deriveNoteTitle("前言\n## 第二节"), "第二节");
});

test("deriveNoteTitle falls back to first non-empty line then default", () => {
  assert.equal(deriveNoteTitle("  没有标题的一行  "), "没有标题的一行");
  assert.equal(deriveNoteTitle("   \n\n"), "无标题笔记");
});

test("deriveNoteTitle clamps long titles", () => {
  const title = deriveNoteTitle(`# ${"长".repeat(80)}`);
  assert.equal(title.length, 60);
});

test("default markdown contains KaTeX delimiters", () => {
  assert.match(DEFAULT_NOTE_MARKDOWN, /\$E = mc\^\{2\}\$/);
  assert.match(DEFAULT_NOTE_MARKDOWN, /\$\$/);
  assert.match(DEFAULT_NOTE_MARKDOWN, /\\int/);
});

test("formatNoteQuote prefixes title and truncates long bodies", () => {
  const short = formatNoteQuote({ title: "笔记 A", markdown: "hello" });
  assert.equal(short, "【笔记】笔记 A\n\nhello");
  const long = formatNoteQuote({ title: "长", markdown: "x".repeat(5000) });
  assert.match(long, /^【笔记】长\n\n/);
  assert.match(long, /已截断/);
  assert.ok(long.length < 5000);
});

test("formatFlashcardQuote includes front, back and optional explanation", () => {
  const quoted = formatFlashcardQuote({
    sourceLabel: "大学物理 / 详解 / 1.1",
    front: "什么是质点？",
    back: "可忽略大小的物体",
    originalText: "原文",
    explanation: "理想模型",
  });
  assert.match(quoted, /【复习闪卡 · 大学物理 \/ 详解 \/ 1.1】/);
  assert.match(quoted, /正面：什么是质点？/);
  assert.match(quoted, /背面：可忽略大小的物体/);
  assert.match(quoted, /解析：理想模型/);
});

test("plainSnippet strips markdown chrome", () => {
  assert.equal(plainSnippet("# 标题\n\n**加粗** 与 `code`"), "标题 加粗 与 code");
});

test("listCourseNoteHits skips stubs and navigation-only nodes", () => {
  const hits = listCourseNoteHits("probability");
  assert.ok(hits.length > 10);
  assert.ok(hits.every((hit) => hit.path.startsWith("probability/")));
  assert.ok(hits.every((hit) => !hit.path.endsWith("/toc")));
  assert.ok(hits.some((hit) => hit.title.length > 0));
});

test("subjectLabel and window id helpers", () => {
  assert.equal(subjectLabel(null), "未归档");
  assert.equal(userNoteWindowId("abc"), "user-note-editor:abc");
});
