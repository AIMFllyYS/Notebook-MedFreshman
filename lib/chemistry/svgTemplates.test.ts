import assert from "node:assert/strict";
import { test } from "node:test";
import { CHEM_DRAW_GUIDE } from "./svgTemplates.ts";

test("CHEM_DRAW_GUIDE 非空字符串", () => {
  assert.ok(typeof CHEM_DRAW_GUIDE === "string");
  assert.ok(CHEM_DRAW_GUIDE.length > 100, "指南应有足够内容");
});

test("CHEM_DRAW_GUIDE 包含 SMILES 指引", () => {
  assert.ok(CHEM_DRAW_GUIDE.includes("SMILES"), "应提及 SMILES");
});

test("CHEM_DRAW_GUIDE 包含四种投影式模板", () => {
  assert.ok(CHEM_DRAW_GUIDE.includes("Fischer"), "应含费歇尔投影");
  assert.ok(CHEM_DRAW_GUIDE.includes("Newman"), "应含纽曼投影");
  assert.ok(CHEM_DRAW_GUIDE.includes("Haworth"), "应含哈沃斯投影");
  assert.ok(CHEM_DRAW_GUIDE.includes("Sawhorse"), "应含锯架投影");
});

test("CHEM_DRAW_GUIDE 包含 SVG viewBox 示例", () => {
  assert.ok(CHEM_DRAW_GUIDE.includes("viewBox"), "应含 SVG viewBox 示例");
});

test("CHEM_DRAW_GUIDE 使用 currentColor", () => {
  assert.ok(CHEM_DRAW_GUIDE.includes("currentColor"), "应使用 currentColor 适配主题");
});
