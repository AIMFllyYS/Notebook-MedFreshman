import assert from "node:assert/strict";
import { test } from "node:test";
import { parseJsonArrayQuestions, parsePipeSeparatedQuestions } from "./followUps.ts";

test("parsePipeSeparatedQuestions：清编号、换行，最多三问", () => {
  assert.deepEqual(
    parsePipeSeparatedQuestions("1. 什么是线粒体？\n2) 内膜有什么酶\n3、怎么记"),
    ["什么是线粒体？", "内膜有什么酶", "怎么记"],
  );
  assert.deepEqual(parsePipeSeparatedQuestions("只有一问"), ["只有一问"]);
  assert.equal(parsePipeSeparatedQuestions("a|b|c|d").length, 3);
});

test("parseJsonArrayQuestions：从正文里抽出 JSON 数组", () => {
  assert.deepEqual(parseJsonArrayQuestions('前话 ["甲","乙","丙"] 后话'), ["甲", "乙", "丙"]);
  assert.deepEqual(parseJsonArrayQuestions("没有方括号"), []);
  assert.deepEqual(parseJsonArrayQuestions("[not json"), []);
});
