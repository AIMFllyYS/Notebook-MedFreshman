import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeSearchQuery } from "./queryNormalize.ts";

test("normalizeSearchQuery：剥掉「什么是」", () => {
  assert.equal(normalizeSearchQuery("什么是核糖体"), "核糖体");
  assert.equal(normalizeSearchQuery("核糖体是什么"), "核糖体");
  assert.equal(normalizeSearchQuery("什么叫被覆上皮？"), "被覆上皮");
});

test("normalizeSearchQuery：剥掉讲解套话", () => {
  assert.equal(normalizeSearchQuery("请讲解一下内膜系统"), "内膜系统");
  assert.equal(normalizeSearchQuery("帮我介绍肝小叶"), "肝小叶");
  assert.equal(normalizeSearchQuery("解释一下解剖学姿势"), "解剖学姿势");
});

test("normalizeSearchQuery：专业短语保持不变", () => {
  assert.equal(normalizeSearchQuery("蛋白质的一级结构"), "蛋白质的一级结构");
  assert.equal(normalizeSearchQuery("核磁共振"), "核磁共振");
  assert.equal(normalizeSearchQuery("氨基酸"), "氨基酸");
});

test("normalizeSearchQuery：空串与纯标点", () => {
  assert.equal(normalizeSearchQuery(""), "");
  assert.equal(normalizeSearchQuery("   "), "");
  assert.equal(normalizeSearchQuery("什么是"), "什么是");
});
