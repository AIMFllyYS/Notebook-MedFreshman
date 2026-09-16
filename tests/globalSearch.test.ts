import assert from "node:assert/strict";
import { test } from "node:test";
import type { ContentTree } from "@/lib/types/content";
import { contentTree } from "@/lib/content-data/manifest";
import {
  buildGlobalSearchIndex,
  chapterHitsFromIndex,
  isIndexableContentItem,
  listBodySearchShards,
  matchBodyText,
  matchFlashcard,
  matchUserNote,
  mergeBodyHits,
  searchGlobalIndex,
  stripForSearch,
} from "@/lib/search/globalSearch";

const fixtureTree: ContentTree = {
  subjects: [
    {
      id: "probability",
      name: "概率论",
      icon: "Calculator",
      categories: [
        {
          id: "detail",
          name: "详解",
          items: [
            {
              id: "1.1",
              title: "随机试验与样本空间",
              type: "document",
              status: "done",
              summary: "样本空间和事件的基础概念",
            },
            {
              id: "1.2",
              title: "条件概率",
              type: "document",
              status: "done",
              children: [
                {
                  id: "1.2.1",
                  title: "贝叶斯公式",
                  type: "document",
                  status: "done",
                  summary: "全概率公式与贝叶斯推断",
                },
              ],
            },
            {
              id: "toc",
              title: "目录",
              type: "document",
              status: "done",
            },
            {
              id: "draft",
              title: "未完成稿",
              type: "document",
              status: "stub",
            },
          ],
        },
        {
          id: "gongshi",
          name: "公式",
          items: [
            {
              id: "gongshi",
              title: "概率论公式",
              type: "document",
              status: "done",
              renderType: "html",
            },
          ],
        },
        {
          id: "recording",
          name: "课上录音",
          items: [
            {
              id: "lesson-1",
              title: "第1节 · 分组",
              type: "document",
              navigationOnly: true,
              children: [
                {
                  id: "note-html",
                  title: "课堂笔记",
                  type: "document",
                  status: "done",
                  renderType: "html",
                },
                {
                  id: "min-1",
                  title: "课堂纪要",
                  type: "document",
                  status: "done",
                  summary: "纪要摘要",
                  renderType: "markdown",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "histology",
      name: "组织学与胚胎学",
      icon: "Layers",
      categories: [
        {
          id: "textbook",
          name: "教材",
          items: [
            {
              id: "ch02-4",
              title: "一、被覆上皮",
              type: "document",
              status: "done",
              summary: "上皮分类",
            },
          ],
        },
      ],
    },
  ],
};

test("buildGlobalSearchIndex flattens nested content routes with hrefs", () => {
  const index = buildGlobalSearchIndex(fixtureTree);

  assert.deepEqual(index.map((entry) => entry.href), [
    "/probability/detail/1.1",
    "/probability/detail/1.2",
    "/probability/detail/1.2.1",
    "/probability/recording/min-1",
    "/histology/textbook/ch02-4",
  ]);
  assert.equal(index[2]?.breadcrumbs, "概率论 / 详解 / 条件概率");
});

test("buildGlobalSearchIndex 排除 HTML / 组件 / 导航节点 / stub / toc", () => {
  const index = buildGlobalSearchIndex(fixtureTree);
  const ids = index.map((entry) => entry.itemId);
  assert.ok(!ids.includes("gongshi"));
  assert.ok(!ids.includes("note-html"));
  assert.ok(!ids.includes("lesson-1"));
  assert.ok(!ids.includes("toc"));
  assert.ok(!ids.includes("draft"));
  assert.ok(ids.includes("min-1"));
});

test("真实内容树也不把公式窗 / 课堂 HTML 笔记编进索引", () => {
  const index = buildGlobalSearchIndex(contentTree);
  assert.ok(!index.some((entry) => entry.itemId === "gongshi"));
  assert.ok(!index.some((entry) => entry.itemId === "exam-source"));
  assert.ok(!index.some((entry) => entry.itemId === "schedule"));
  assert.ok(!index.some((entry) => entry.itemId.startsWith("note-rec-")));
  assert.ok(
    index.some((entry) => entry.itemId.startsWith("min-rec-") || entry.title.includes("课堂纪要")),
    "课堂纪要（markdown）应进索引",
  );
});

test("searchGlobalIndex prioritizes exact title matches and caps result count", () => {
  const index = buildGlobalSearchIndex(fixtureTree);
  const results = searchGlobalIndex(index, "贝叶斯", 1);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.id, "probability:detail:1.2.1");
});

test("searchGlobalIndex matches route id and summary text", () => {
  const index = buildGlobalSearchIndex(fixtureTree);

  assert.equal(searchGlobalIndex(index, "1.1")[0]?.title, "随机试验与样本空间");
  assert.equal(searchGlobalIndex(index, "推断")[0]?.title, "贝叶斯公式");
});

test("跨科目标题索引同时包含大一与大二条目", () => {
  const index = buildGlobalSearchIndex(fixtureTree);
  const bayes = searchGlobalIndex(index, "贝叶斯");
  const epithelium = searchGlobalIndex(index, "被覆上皮");
  assert.equal(bayes[0]?.subjectId, "probability");
  assert.equal(epithelium[0]?.subjectId, "histology");
});

test("matchBodyText 命中正文片段，不把纯标题当正文命中", () => {
  const index = buildGlobalSearchIndex(fixtureTree);
  const bayes = index.find((entry) => entry.itemId === "1.2.1");
  assert.ok(bayes);
  assert.equal(matchBodyText(bayes, "这里完全没有那个词", "贝叶斯"), null);
  const hit = matchBodyText(bayes, "当结果已经发生，由果溯因要用贝叶斯公式。", "由果溯因");
  assert.ok(hit);
  assert.equal(hit.kind, "body");
  assert.match(hit.snippet, /由果溯因/);
});

test("matchUserNote 能搜标题和正文", () => {
  const titleHit = matchUserNote(
    { id: "n1", title: "核糖体笔记", markdown: "只是一段无关文字", subjectId: "cell-biology" },
    "核糖体",
  );
  const bodyHit = matchUserNote(
    { id: "n2", title: "随手记", markdown: "核糖体是合成蛋白质的场所", subjectId: null },
    "合成蛋白质",
  );
  assert.ok(titleHit);
  assert.equal(titleHit.kind, "note");
  assert.ok(bodyHit);
  assert.match(bodyHit.snippet, /合成蛋白质/);
  assert.equal(bodyHit.breadcrumbs, "未归档");
});

test("matchFlashcard 能搜正反面和原文", () => {
  const hit = matchFlashcard(
    {
      id: "c1",
      front: "什么是泊松分布？",
      back: "描述单位时间稀有事件次数",
      originalText: "课堂划词：泊松",
      sourceLabel: "概率论 / 详解 / 2.3",
      subjectId: "probability",
    },
    "稀有事件",
  );
  assert.ok(hit);
  assert.equal(hit.kind, "flashcard");
  assert.match(hit.snippet, /稀有事件/);
});

test("stripForSearch 剥掉 HTML 标签，避免按标记误搜", () => {
  assert.equal(stripForSearch("<div class='x'>被覆上皮</div>"), "被覆上皮");
});

test("isIndexableContentItem 拒绝 html / component", () => {
  assert.equal(isIndexableContentItem({ id: "a", renderType: "html" }), false);
  assert.equal(isIndexableContentItem({ id: "b", renderType: "component" }), false);
  assert.equal(isIndexableContentItem({ id: "c", renderType: "markdown" }), true);
});

test("listBodySearchShards 当前学年科目排在前面", () => {
  const shards = listBodySearchShards(fixtureTree, "sophomore-1");
  assert.equal(shards[0], "histology");
  assert.ok(shards.includes("probability"));
});

test("mergeBodyHits 章节先出、正文片段后补同一条", () => {
  const chapters = chapterHitsFromIndex(buildGlobalSearchIndex(fixtureTree), "贝叶斯", 8);
  const body = matchBodyText(
    buildGlobalSearchIndex(fixtureTree).find((entry) => entry.itemId === "1.2.1")!,
    "由果溯因的贝叶斯写法",
    "由果溯因",
  );
  assert.ok(body);
  const merged = mergeBodyHits(chapters, [body], 8);
  const bayes = merged.find((hit) => hit.itemId === "1.2.1");
  assert.ok(bayes);
  assert.match(bayes.snippet, /由果溯因/);
});
