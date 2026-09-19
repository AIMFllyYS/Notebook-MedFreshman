import assert from "node:assert/strict";
import { test } from "node:test";
import { sliceText } from "./slice.ts";

test("有标题就按标题切：标题进切片标题，正文各归各片", () => {
  const text = [
    "# 上皮组织",
    "",
    "被覆上皮覆盖体表。",
    "",
    "## 单层上皮",
    "",
    "单层扁平、单层立方、单层柱状。",
    "",
    "## 复层上皮",
    "",
    "复层扁平上皮耐磨。",
  ].join("\n");
  const result = sliceText(text, { name: "组胚.md" });
  assert.equal(result.slices.length, 3);
  assert.deepEqual(
    result.slices.map((slice) => slice.title),
    ["上皮组织", "单层上皮", "复层上皮"],
  );
  assert.match(result.slices[1]!.text, /单层扁平/);
  assert.doesNotMatch(result.slices[1]!.text, /复层扁平/);
  assert.match(result.indexMarkdown, /# 组胚\.md · 索引/);
  assert.match(result.indexMarkdown, /\| 2 \| slice-2 · 单层上皮 \|/);
});

test("标题不足两处就按字符窗口切，并留重叠", () => {
  const text = "A".repeat(3000);
  const result = sliceText(text, { sliceChars: 1000, sliceOverlap: 100, maxSliceChars: 1000 });
  assert.equal(result.slices.length, 4);
  // 1000 / 900 / 900 / 200：每片不超过窗口，且相邻片有 100 字重叠
  assert.ok(result.slices.every((slice) => slice.chars <= 1000));
  assert.equal(result.slices[0]!.text.slice(-100), result.slices[1]!.text.slice(0, 100));
});

test("单片超过上限时二次窗口切，标题带序号", () => {
  const body = "B".repeat(5000);
  const text = `# 长节\n\n${body}\n\n## 另一节\n\n短内容`;
  const result = sliceText(text, { name: "大文件.md", sliceChars: 2000, sliceOverlap: 0, maxSliceChars: 2000 });
  const longTitles = result.slices.filter((slice) => slice.title.startsWith("长节")).map((slice) => slice.title);
  assert.deepEqual(longTitles, ["长节 · 1", "长节 · 2", "长节 · 3"]);
  assert.ok(result.slices.every((slice) => slice.chars <= 2000));
});

test("片数封顶：超出的丢掉并在索引里写明", () => {
  const text = "C".repeat(10_000);
  const result = sliceText(text, { maxSlices: 3, sliceChars: 1000, sliceOverlap: 0, maxSliceChars: 1000 });
  assert.equal(result.slices.length, 3);
  assert.equal(result.truncated, true);
  assert.match(result.indexMarkdown, /已达上限/);
});

test("空文本 / 纯空白不产出切片，也不报错", () => {
  assert.deepEqual(sliceText("").slices, []);
  assert.deepEqual(sliceText("   \n\n  ").slices, []);
  assert.equal(sliceText("").charCount, 0);
});

test("CRLF 与空字符先归一化，摘要是首 80 字", () => {
  const result = sliceText("# 标题\r\n\r\n" + "字".repeat(200) + "\u0000", { name: "x.md" });
  assert.equal(result.slices.length, 1);
  assert.equal(result.slices[0]!.summary.length, 81); // 80 字 + 省略号
  assert.doesNotMatch(result.slices[0]!.text, /\u0000/);
});