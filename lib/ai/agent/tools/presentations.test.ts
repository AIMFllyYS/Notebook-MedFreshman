import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
import { TOOL_PRESENTATION, TOGGLEABLE_TOOLS, getToolPresentation } from "@/lib/ai/agent/tools/presentations";
import { translate } from "@/lib/i18n";

/** key 被写错时 translate 会原样返回 key（开发环境另有一条 warn），这里就按这个信号判缺失。 */
function resolve(locale: "zh" | "en", key: string): string {
  const value = translate(locale, key);
  assert.notEqual(value, key, `${locale} 词典缺少 ${key}`);
  return value;
}

test("TOOL_PRESENTATION keys match STUDY_TOOL_NAMES and every dictionary key resolves", () => {
  assert.deepEqual(Object.keys(TOOL_PRESENTATION).sort(), [...STUDY_TOOL_NAMES].sort());
  for (const name of STUDY_TOOL_NAMES) {
    const p = getToolPresentation(name);
    assert.ok(p, name);
    // 展示元数据只存 key；中英两侧都要能取到词。
    for (const key of [p.labelKey, p.settingsLabelKey, p.descriptionKey]) {
      assert.ok(key.trim().length > 0, name);
      assert.match(key, /^trace\.tool\./, `${name} 的展示文案必须落在 trace.tool 命名空间`);
      resolve("zh", key);
      resolve("en", key);
    }
  }
  const description = resolve("zh", TOOL_PRESENTATION.writeDocument.descriptionKey);
  assert.doesNotMatch(description, /Word|LaTeX|PDF/);
  assert.match(description, /Markdown/);
});

test("TOGGLEABLE_TOOLS 只暴露 key，且都来自各自工具的展示元数据", () => {
  assert.ok(TOGGLEABLE_TOOLS.length > 0);
  for (const tool of TOGGLEABLE_TOOLS) {
    assert.equal(tool.labelKey, TOOL_PRESENTATION[tool.name].settingsLabelKey, tool.name);
    assert.equal(tool.descriptionKey, TOOL_PRESENTATION[tool.name].descriptionKey, tool.name);
    assert.equal(TOOL_PRESENTATION[tool.name].toggleable, true, tool.name);
    resolve("zh", tool.labelKey);
    resolve("en", tool.descriptionKey);
  }
});
