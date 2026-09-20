import assert from "node:assert/strict";
import { test } from "node:test";
import { presentation } from "./agent/tools/webSearch/presentation.ts";
import { translate } from "@/lib/i18n";

test("webSearch 设置文案是智谱而不是 Bocha", () => {
  // 设置描述搬进了词典：对中文真相源取值，断言原有口径不变。
  const description = translate("zh", presentation.descriptionKey);
  assert.match(description, /智谱/);
  assert.doesNotMatch(description, /Bocha/i);
});
