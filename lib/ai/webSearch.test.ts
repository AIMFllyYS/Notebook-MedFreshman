import assert from "node:assert/strict";
import { test } from "node:test";
import { presentation } from "./agent/tools/webSearch/presentation.ts";

test("webSearch 设置文案是智谱而不是 Bocha", () => {
  assert.match(presentation.description, /智谱/);
  assert.doesNotMatch(presentation.description, /Bocha/i);
});
