import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BLANK_NOTE_MARKDOWN,
  DEFAULT_NOTE_MARKDOWN,
  EXAMPLE_USER_NOTE_ID,
  deriveNoteTitle,
  formatClassroomNoteQuote,
  formatFlashcardQuote,
  formatNoteQuote,
  isClassroomNote,
  makeExampleUserNote,
  plainSnippet,
  seedExampleNoteIfEmpty,
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

test("default markdown is the case note, not a blank create template", () => {
  assert.match(DEFAULT_NOTE_MARKDOWN, /^# 案例笔记/m);
  assert.match(DEFAULT_NOTE_MARKDOWN, /\$E = mc\^\{2\}\$/);
  assert.match(DEFAULT_NOTE_MARKDOWN, /\$\$/);
  assert.match(DEFAULT_NOTE_MARKDOWN, /\\int/);
  assert.equal(BLANK_NOTE_MARKDOWN.trim(), "");
  assert.notEqual(DEFAULT_NOTE_MARKDOWN.trim(), BLANK_NOTE_MARKDOWN.trim());
});

test("seedExampleNoteIfEmpty inserts the case note once when the library is empty", () => {
  const first = seedExampleNoteIfEmpty({}, []);
  assert.ok(first);
  assert.equal(first.order.length, 1);
  assert.equal(first.byId[EXAMPLE_USER_NOTE_ID]?.title, "案例笔记");
  assert.equal(first.byId[EXAMPLE_USER_NOTE_ID]?.markdown, DEFAULT_NOTE_MARKDOWN);
  assert.equal(first.byId[EXAMPLE_USER_NOTE_ID]?.subjectId, null);

  const again = seedExampleNoteIfEmpty(first.byId, first.order);
  assert.equal(again, null);

  const existing = seedExampleNoteIfEmpty(
    { mine: { ...makeExampleUserNote(), id: "mine", title: "课堂备忘", markdown: "旧稿" } },
    ["mine"],
  );
  assert.equal(existing, null);
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

test("classroom note helpers treat missing kind as personal", () => {
  assert.equal(isClassroomNote({ kind: "classroom" }), true);
  assert.equal(isClassroomNote({ kind: "personal" }), false);
  assert.equal(isClassroomNote({}), false);
});

test("formatClassroomNoteQuote keeps the selected sentence and annotation", () => {
  const quoted = formatClassroomNoteQuote({
    title: "泊松",
    markdown: "课上强调均值等于方差。",
    quote: "泊松分布的均值等于方差",
    source: { kind: "agent", label: "概率论 · Agent" },
  });
  assert.match(quoted, /【课堂笔记 · 概率论 · Agent】/);
  assert.match(quoted, /原文：泊松分布的均值等于方差/);
  assert.match(quoted, /课上强调均值等于方差/);
});

test("subjectLabel and window id helpers", () => {
  assert.equal(subjectLabel(null), "未归档");
  assert.equal(userNoteWindowId("abc"), "user-note-editor:abc");
});
