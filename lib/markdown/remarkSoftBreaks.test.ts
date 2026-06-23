import assert from "node:assert/strict";
import { test } from "node:test";
import remarkSoftBreaks from "./remarkSoftBreaks.ts";

// 直接对最小 mdast 运行 transformer，验证软换行改写逻辑（不依赖完整 remark 管线）。
const run = (tree: unknown) => {
  remarkSoftBreaks()(tree);
  return tree as { children: { children: { type: string; value?: string }[] }[] };
};

const para = (...children: { type: string; value?: string }[]) => ({
  type: "root",
  children: [{ type: "paragraph", children }],
});

test("段内单换行 \\n 转为 break 节点", () => {
  const tree = run(para({ type: "text", value: "line1\nline2" }));
  assert.deepEqual(tree.children[0].children, [
    { type: "text", value: "line1" },
    { type: "break" },
    { type: "text", value: "line2" },
  ]);
});

test("多处换行全部转换", () => {
  const tree = run(para({ type: "text", value: "a\nb\nc" }));
  assert.deepEqual(tree.children[0].children, [
    { type: "text", value: "a" },
    { type: "break" },
    { type: "text", value: "b" },
    { type: "break" },
    { type: "text", value: "c" },
  ]);
});

test("无换行的 text 节点保持不变", () => {
  const tree = run(para({ type: "text", value: "no breaks here" }));
  assert.deepEqual(tree.children[0].children, [
    { type: "text", value: "no breaks here" },
  ]);
});

test("非 text 节点（行内代码）即使含 \\n 也不被拆分", () => {
  const tree = run(para({ type: "inlineCode", value: "x\ny" }));
  assert.deepEqual(tree.children[0].children, [
    { type: "inlineCode", value: "x\ny" },
  ]);
});

test("行首换行不产生空 text 节点", () => {
  const tree = run(para({ type: "text", value: "\ntail" }));
  assert.deepEqual(tree.children[0].children, [
    { type: "break" },
    { type: "text", value: "tail" },
  ]);
});
