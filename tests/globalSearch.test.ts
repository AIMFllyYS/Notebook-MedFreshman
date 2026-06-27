import assert from "node:assert/strict";
import { test } from "node:test";
import type { ContentTree } from "@/lib/types/content";
import { buildGlobalSearchIndex, searchGlobalIndex } from "@/lib/search/globalSearch";

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
  ]);
  assert.equal(index[2]?.breadcrumbs, "概率论 / 详解 / 条件概率");
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
