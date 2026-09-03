import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deriveContentKey,
  deriveExampleKeyFor,
  deriveActiveKeys,
  hasCapability,
  EMPTY_KEY,
} from "@/lib/content/categoryKeys";
import {
  STANDARD_CATEGORIES,
  STANDARD_CATEGORY_ORDER,
  category,
  stubCategory,
} from "@/lib/content-data/category-templates";
import { contentTree } from "@/lib/content-data/manifest";
import type { Category } from "@/lib/types/content";

const detail = category("detail", []);
const textbook = category("textbook", []);
const recording = category("recording", []);
const summary = category("summary", []);
const english: Category = { id: "english", name: "英语", capabilities: ["examples", "quiz"], keyStrategy: "item", items: [] };

test("模板：STANDARD_CATEGORY_ORDER 全部在 STANDARD_CATEGORIES 中且无重复", () => {
  assert.equal(new Set(STANDARD_CATEGORY_ORDER).size, STANDARD_CATEGORY_ORDER.length);
  for (const id of STANDARD_CATEGORY_ORDER) assert.ok(id in STANDARD_CATEGORIES, id);
});

test("category()/stubCategory()：带出模板的 name / capabilities / keyStrategy", () => {
  assert.equal(detail.name, "详解");
  assert.deepEqual([...(detail.capabilities ?? [])].sort(), ["examples", "media", "quiz", "search"]);
  assert.equal(detail.keyStrategy, "section-dot");
  assert.equal(summary.keyStrategy, undefined);
  const stub = stubCategory("kaoqian-moni");
  assert.equal(stub.items[0]?.status, "stub");
  assert.deepEqual(stub.capabilities, []);
  const overridden = category("summary", [], { name: "纪要（自定义）", capabilities: ["search", "quiz"] });
  assert.equal(overridden.name, "纪要（自定义）");
  assert.ok(hasCapability(overridden, "quiz"));
});

test("deriveContentKey：四种策略与历史行为一致", () => {
  assert.deepEqual(deriveContentKey(detail, "1.4"), { chapterId: "ch01", sectionId: "1.4", quizId: "ch01" });
  assert.deepEqual(deriveContentKey(detail, "12.3"), { chapterId: "ch12", sectionId: "12.3", quizId: "ch12" });
  assert.deepEqual(deriveContentKey(detail, "ch03"), EMPTY_KEY, "章级 index 页不推导");
  assert.deepEqual(deriveContentKey(recording, "rec-01"), { chapterId: "recording", sectionId: "rec-01", quizId: "rec-01" });
  assert.deepEqual(deriveContentKey(recording, "rec-100"), { chapterId: "recording", sectionId: "rec-100", quizId: "rec-100" }, "不再限制两位数");
  assert.deepEqual(deriveContentKey(english, "unit-3"), { chapterId: "unit-3", sectionId: "unit-3", quizId: "unit-3" });
  assert.deepEqual(deriveContentKey(textbook, "ch05-2"), { chapterId: "textbook", sectionId: "ch05", quizId: "tb-ch05" });
  assert.deepEqual(deriveContentKey(textbook, "tb-ch05"), { chapterId: "textbook", sectionId: "tb-ch05", quizId: "tb-ch05" });
  assert.deepEqual(deriveContentKey(textbook, "toc"), { chapterId: "textbook", sectionId: "toc", quizId: "" });
  assert.deepEqual(deriveContentKey(summary, "sum-01"), EMPTY_KEY);
  assert.deepEqual(deriveContentKey(undefined, "1.1"), EMPTY_KEY);
});

test("deriveExampleKeyFor / deriveActiveKeys：按 capabilities 开关", () => {
  assert.deepEqual(deriveExampleKeyFor(detail, "1.4"), { chapterId: "ch01", sectionId: "1.4" });
  assert.deepEqual(deriveExampleKeyFor(summary, "sum-01"), { chapterId: "", sectionId: "" });
  assert.deepEqual(deriveActiveKeys(detail, "1.4"), { activeChapterId: "ch01", activeSectionId: "1.4" });
  assert.deepEqual(deriveActiveKeys(recording, "rec-07"), { activeChapterId: "rec-07", activeSectionId: "" }, "录音无 media，sectionId 为空");
  assert.deepEqual(deriveActiveKeys(summary, "sum-01"), { activeChapterId: "", activeSectionId: "" });
  const mediaOnly: Category = { id: "x", name: "x", capabilities: ["media"], keyStrategy: "section-dot", items: [] };
  assert.deepEqual(deriveActiveKeys(mediaOnly, "2.1"), { activeChapterId: "ch02", activeSectionId: "2.1" });
});

test("新增板块场景：只声明 capabilities 即生效，无需改代码", () => {
  const formulaSheet: Category = { id: "formula-sheet", name: "公式速查", capabilities: ["search"], items: [] };
  assert.ok(hasCapability(formulaSheet, "search"));
  assert.equal(hasCapability(formulaSheet, "examples"), false);
  assert.deepEqual(deriveExampleKeyFor(formulaSheet, "sheet-01"), { chapterId: "", sectionId: "" });
  assert.deepEqual(deriveActiveKeys(formulaSheet, "sheet-01"), { activeChapterId: "", activeSectionId: "" });

  const errata: Category = { id: "errata", name: "错题本", capabilities: ["quiz"], keyStrategy: "item", items: [] };
  assert.deepEqual(deriveActiveKeys(errata, "week-03"), { activeChapterId: "week-03", activeSectionId: "" });
});

test("manifest：每个板块的 capabilities 都是合法值；标准板块与模板一致", () => {
  const valid = new Set(["examples", "quiz", "search", "media"]);
  for (const subject of contentTree.subjects) {
    for (const cat of subject.categories) {
      for (const cap of cat.capabilities ?? []) assert.ok(valid.has(cap), `${subject.id}/${cat.id} 非法能力 ${cap}`);
      const tpl = (STANDARD_CATEGORIES as Record<string, { name: string; capabilities: readonly string[] }>)[cat.id];
      if (tpl) {
        assert.equal(cat.name, tpl.name, `${subject.id}/${cat.id} name 与模板不一致`);
        assert.deepEqual([...(cat.capabilities ?? [])].sort(), [...tpl.capabilities].sort(), `${subject.id}/${cat.id} capabilities 与模板不一致`);
      }
    }
  }
});

/**
 * 已知历史缺口：这些 item 的 id 不符合板块策略（如 chemistry/detail 的 ppt-15.1），
 * 迁移前同样推不出 quiz/examples key（parseInt("ppt-15") 为 NaN）。收敛后不再新增此类 id；
 * 若要为它们补齐 Quiz/例题，应把 id 改为 15.1 或为 chemistry/detail 单独声明 keyStrategy。
 */
const KNOWN_KEY_GAPS = new Set([
  "chemistry/detail/ppt-15.1",
  "chemistry/detail/ppt-15.2",
  "chemistry/detail/ppt-15.3",
  "chemistry/detail/ppt-16.1",
  "chemistry/detail/ppt-16.2",
  "chemistry/detail/ppt-17.1",
  "chemistry/detail/ppt-17.2",
  "chemistry/detail/ppt-17.3",
  "chemistry/detail/ppt-18.1",
  "chemistry/detail/ppt-18.2",
]);

test("manifest：现有全部 item 在其板块策略下的推导结果不为「声明了能力却推不出 key」（已知缺口除外）", () => {
  const problems: string[] = [];
  for (const subject of contentTree.subjects) {
    for (const cat of subject.categories) {
      const wantsKey = hasCapability(cat, "quiz") || hasCapability(cat, "examples") || hasCapability(cat, "media");
      if (!wantsKey) continue;
      const walk = (items: Category["items"]) => {
        for (const item of items) {
          if (item.children?.length) {
            walk(item.children);
            continue;
          }
          if (item.status === "stub" || item.id === "toc") continue;
          const key = deriveContentKey(cat, item.id);
          const p = `${subject.id}/${cat.id}/${item.id}`;
          if (!key.sectionId && !KNOWN_KEY_GAPS.has(p)) problems.push(p);
        }
      };
      walk(cat.items);
    }
  }
  assert.deepEqual(problems, [], `以下 item 声明了能力但推不出 key:\n${problems.join("\n")}`);
});
