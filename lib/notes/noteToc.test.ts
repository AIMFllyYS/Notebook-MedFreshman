import assert from "node:assert/strict";
import { test } from "node:test";
import { parseNoteToc, slugHeading, stripMdInline } from "./noteToc.ts";

test("parseNoteToc 抽出一到三级标题并去重 slug", () => {
  const items = parseNoteToc(`# 被覆上皮

引言

## 分类

### 单层

## 分类

#### 太深不收录
`);
  assert.deepEqual(
    items.map((item) => ({ level: item.level, title: item.title, id: item.id })),
    [
      { level: 1, title: "被覆上皮", id: "被覆上皮" },
      { level: 2, title: "分类", id: "分类" },
      { level: 3, title: "单层", id: "单层" },
      { level: 2, title: "分类", id: "分类-2" },
    ],
  );
});

test("parseNoteToc 忽略空文档与纯文本", () => {
  assert.deepEqual(parseNoteToc(""), []);
  assert.deepEqual(parseNoteToc("没有标题的一段话"), []);
});

test("stripMdInline 去掉强调与链接", () => {
  assert.equal(stripMdInline("**[肾单位](x)**"), "肾单位");
  assert.equal(slugHeading("Hello World!"), "hello-world");
});
