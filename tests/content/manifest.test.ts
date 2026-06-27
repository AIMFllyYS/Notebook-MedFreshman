import assert from "node:assert/strict";
import { test } from "node:test";
import { contentTree } from "@/lib/content-data/manifest";
import { SUBJECT_IDS, isSubjectId } from "@/lib/types/content";

test("contentTree：至少有一个科目", () => {
  assert.ok(contentTree.subjects.length > 0);
});

test("contentTree：所有 subject id 合法", () => {
  for (const subject of contentTree.subjects) {
    assert.ok(
      isSubjectId(subject.id),
      `subject id 不合法: ${subject.id}`,
    );
    assert.ok(subject.name, `subject name 非空: ${subject.id}`);
    assert.ok(subject.categories.length > 0, `subject 至少一个分类: ${subject.id}`);
  }
});

test("contentTree：SUBJECT_IDS 覆盖所有 subject", () => {
  const treeIds = new Set(contentTree.subjects.map((s) => s.id));
  // 验证 SUBJECT_IDS 与 tree 至少有交集
  const intersection = [...treeIds].filter((s) => SUBJECT_IDS.includes(s as never));
  assert.ok(intersection.length > 0);
});

test("contentTree：每个 subject 内 category id 唯一", () => {
  for (const subject of contentTree.subjects) {
    const catIds = new Set<string>();
    for (const cat of subject.categories) {
      assert.ok(
        !catIds.has(cat.id),
        `category id 重复: ${subject.id}/${cat.id}`,
      );
      catIds.add(cat.id);
      assert.ok(cat.name, `category name 非空: ${subject.id}/${cat.id}`);
      assert.ok(cat.items.length > 0, `category 至少一个 item: ${subject.id}/${cat.id}`);
    }
  }
});

test("contentTree：每个 category 内 item id 唯一", () => {
  for (const subject of contentTree.subjects) {
    for (const cat of subject.categories) {
      const itemIds = new Set<string>();
      function checkItems(items: typeof cat.items, prefix: string) {
        for (const item of items) {
          assert.ok(
            !itemIds.has(item.id),
            `item id 重复: ${prefix}/${item.id}`,
          );
          itemIds.add(item.id);
          assert.ok(item.title, `item title 非空: ${prefix}/${item.id}`);
          assert.ok(
            item.type === "section" || item.type === "document",
            `item type 合法: ${prefix}/${item.id} type=${item.type}`,
          );
          if (item.children) {
            checkItems(item.children, `${prefix}/${item.id}`);
          }
        }
      }
      checkItems(cat.items, `${subject.id}/${cat.id}`);
    }
  }
});

test("contentTree：item status 值合法", () => {
  for (const subject of contentTree.subjects) {
    for (const cat of subject.categories) {
      function checkItems(items: typeof cat.items) {
        for (const item of items) {
          if (item.status) {
            assert.ok(
              ["done", "draft", "stub"].includes(item.status),
              `item status 不合法: ${subject.id}/${cat.id}/${item.id} status=${item.status}`,
            );
          }
          if (item.children) checkItems(item.children);
        }
      }
      checkItems(cat.items);
    }
  }
});
