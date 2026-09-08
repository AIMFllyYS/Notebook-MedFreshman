import assert from "node:assert/strict";
import { test } from "node:test";
import { contentTree, getCategory } from "@/lib/content-data";
import { readContentMarkdown } from "@/lib/content/loader";
import { subjectsOfYear } from "@/lib/content-data/subjects.registry";
import {
  filterSubjectsByYear,
  academicYearOfSubject,
} from "@/lib/constants/academic-year";
import { STANDARD_CATEGORY_ORDER } from "@/lib/content-data/category-templates";
import type { ContentItem } from "@/lib/types/content";

function walkLeaves(items: ContentItem[]): ContentItem[] {
  const out: ContentItem[] = [];
  for (const item of items) {
    if (item.children?.length) out.push(...walkLeaves(item.children));
    else out.push(item);
  }
  return out;
}

test("大二上包含医学英语与医学统计学，大一下排除", () => {
  const sophIds = subjectsOfYear("sophomore-1").map((s) => s.id);
  assert.ok(sophIds.includes("medical-english"));
  assert.ok(sophIds.includes("medical-statistics"));
  assert.equal(academicYearOfSubject("medical-english"), "sophomore-1");
  assert.equal(academicYearOfSubject("medical-statistics"), "sophomore-1");

  const soph = filterSubjectsByYear(contentTree.subjects, "sophomore-1");
  const names = soph.map((s) => s.name);
  assert.ok(names.includes("医学英语"));
  assert.ok(names.includes("医学统计学"));

  const fresh = filterSubjectsByYear(contentTree.subjects, "freshman-2");
  const freshIds = new Set(fresh.map((s) => s.id));
  assert.equal(freshIds.has("medical-english"), false);
  assert.equal(freshIds.has("medical-statistics"), false);
});

test("新课使用标准六板块顺序", () => {
  for (const id of ["medical-english", "medical-statistics"] as const) {
    const subject = contentTree.subjects.find((s) => s.id === id);
    assert.ok(subject, `missing ${id}`);
    assert.deepEqual(subject!.categories.map((c) => c.id), [...STANDARD_CATEGORY_ORDER]);
  }
});

test("医学英语至少一篇非 stub 叶子含记忆卡（内容落地后）", () => {
  const cat = getCategory("medical-english", "textbook");
  assert.ok(cat);
  const leaves = walkLeaves(cat!.items).filter((item) => item.status === "done");
  assert.ok(leaves.length > 0, "医学英语教材应有 done 叶子");
  let found = false;
  for (const item of leaves) {
    const md = readContentMarkdown("medical-english", "textbook", item.id);
    assert.ok(md && md.trim(), `medical-english/textbook/${item.id} 应非空`);
    assert.ok(/^#\s+/m.test(md!), `${item.id} 应有标题`);
    if (md!.includes(":::memory")) found = true;
  }
  assert.ok(found, "至少一篇医学英语正文含 :::memory");
});

test("生化 / 系解 / 组胚至少各有一个非 stub 的详解或考前模拟或实战演练叶子", () => {
  const extras = ["detail", "kaoqian-moni", "shizhan-yanlian"] as const;
  for (const id of ["biochemistry", "anatomy", "histology"] as const) {
    let done = 0;
    for (const catId of extras) {
      const cat = getCategory(id, catId);
      if (!cat) continue;
      done += walkLeaves(cat.items).filter((item) => item.status === "done").length;
    }
    assert.ok(done > 0, `${id} 详解/考前模拟/实战演练应有非 stub 叶子`);
  }
});
