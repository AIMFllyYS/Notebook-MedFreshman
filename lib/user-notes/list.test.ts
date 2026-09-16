import assert from "node:assert/strict";
import { test } from "node:test";
import { filterUserNotes, markdownExcerpt, orderedUserNotes, relativeTime } from "./list.ts";
import type { UserNote } from "@/lib/user-notes/types";

function note(partial: Partial<UserNote> & Pick<UserNote, "id">): UserNote {
  return {
    title: "标题",
    markdown: "正文",
    subjectId: "physics",
    createdAt: 1,
    updatedAt: 1,
    ...partial,
  };
}

test("orderedUserNotes 按 order 取笔记并丢掉缺失 id", () => {
  const byId = {
    a: note({ id: "a", title: "A" }),
    c: note({ id: "c", title: "C" }),
  };
  assert.deepEqual(
    orderedUserNotes(byId, ["c", "missing", "a"]).map((n) => n.id),
    ["c", "a"],
  );
});

test("filterUserNotes 按科目和标题/正文检索，并按 updatedAt 倒序", () => {
  const notes = [
    note({ id: "old", title: "牛顿", markdown: "力学", subjectId: "physics", updatedAt: 10 }),
    note({ id: "new", title: "动量", markdown: "牛顿第二定律", subjectId: "physics", updatedAt: 30 }),
    note({ id: "chem", title: "牛顿", markdown: "无关", subjectId: "chemistry", updatedAt: 20 }),
  ];
  assert.deepEqual(
    filterUserNotes(notes, { subjectId: "physics" }).map((n) => n.id),
    ["new", "old"],
  );
  assert.deepEqual(
    filterUserNotes(notes, { query: "牛顿第二定律" }).map((n) => n.id),
    ["new"],
  );
  assert.deepEqual(
    filterUserNotes(notes, { query: "牛顿", subjectId: "physics" }).map((n) => n.id),
    ["new", "old"],
  );
});

test("markdownExcerpt 去掉标题井号，空正文回退空笔记", () => {
  assert.equal(markdownExcerpt("# 标题\n\n第一段内容"), "标题");
  assert.equal(markdownExcerpt("\n\n"), "空笔记");
});

test("relativeTime 一分钟内显示刚刚", () => {
  assert.equal(relativeTime(Date.now() - 12_000), "刚刚");
});
