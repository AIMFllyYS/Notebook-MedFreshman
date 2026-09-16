import assert from "node:assert/strict";
import { test } from "node:test";
import {
  collectFlashcardCatalog,
  collectUserNoteCatalog,
  filterNotesBySubject,
  findUserNote,
  formatMemoryCatalogLine,
  listUserNoteLines,
  MAX_MEMORY_NOTE_CHARS,
  searchFlashcardCatalog,
  searchUserNoteCatalog,
} from "./memoryCatalog.ts";

test("collectUserNoteCatalog 按更新时间倒序并截断正文", () => {
  const notes = collectUserNoteCatalog([
    { id: "old", title: "旧", markdown: "旧文", subjectId: "anatomy", updatedAt: 1 },
    { id: "new", title: "新", markdown: "x".repeat(MAX_MEMORY_NOTE_CHARS + 20), subjectId: "histology", updatedAt: 9 },
  ]);
  assert.equal(notes[0]?.id, "new");
  assert.equal(notes[0]?.markdown.length, MAX_MEMORY_NOTE_CHARS);
  assert.equal(notes[1]?.id, "old");
});

test("searchUserNoteCatalog 能按标题/正文命中，空查询只列摘要", () => {
  const notes = [
    { id: "a", title: "被覆上皮", markdown: "单层扁平上皮覆盖血管", subjectId: "histology", updatedAt: 2 },
    { id: "b", title: "骨学", markdown: "长骨由骨干和骺构成", subjectId: "anatomy", updatedAt: 1 },
  ];
  const byTitle = searchUserNoteCatalog(notes, "被覆上皮");
  assert.equal(byTitle[0]?.id, "a");
  const byBody = searchUserNoteCatalog(notes, "骨干");
  assert.equal(byBody[0]?.id, "b");
  const listed = searchUserNoteCatalog(filterNotesBySubject(notes, "histology"), "");
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.id, "a");
  assert.match(listUserNoteLines(notes)[0] ?? "", /被覆上皮/);
  assert.equal(findUserNote(notes, "b")?.title, "骨学");
});

test("searchFlashcardCatalog 复用复习卡字段，不另开存储", () => {
  const cards = collectFlashcardCatalog([
    {
      id: "c1",
      subjectId: "anatomy",
      sourceLabel: "系统解剖学 / 骨学",
      front: "长骨的分部",
      back: "骨干与骺",
      originalText: "长骨由骨干和骺构成",
      status: "ready",
      createdAt: 2,
    },
    {
      id: "c2",
      subjectId: "histology",
      sourceLabel: "组织学",
      front: "被覆上皮",
      back: "覆盖体表和管腔",
      originalText: "被覆上皮覆盖体表",
      status: "ready",
      createdAt: 1,
    },
  ]);
  const hits = searchFlashcardCatalog(cards, "骨干");
  assert.equal(hits[0]?.id, "c1");
  assert.match(hits[0]?.snippet ?? "", /骨干/);
});

test("formatMemoryCatalogLine 只报数量", () => {
  const line = formatMemoryCatalogLine(
    [{ id: "n", title: "秘密正文", markdown: "不该出现", subjectId: null, updatedAt: 1 }],
    [],
  );
  assert.match(line, /个人笔记 1 篇/);
  assert.doesNotMatch(line, /秘密正文/);
  assert.equal(formatMemoryCatalogLine([], []), "");
});
