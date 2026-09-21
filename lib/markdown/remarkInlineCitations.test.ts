import assert from "node:assert/strict";
import { test } from "node:test";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkInlineCitations from "./remarkInlineCitations.ts";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function walk(node: HastNode, visit: (n: HastNode) => void): void {
  visit(node);
  node.children?.forEach((child) => walk(child, visit));
}

function toHast(markdown: string): HastNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkInlineCitations).use(remarkRehype) as any;
  return processor.runSync(processor.parse(markdown)) as HastNode;
}

function citeRefs(tree: HastNode): HastNode[] {
  const out: HastNode[] = [];
  walk(tree, (node) => {
    if (node.type === "element" && node.tagName === "cite-ref") out.push(node);
  });
  return out;
}

function collectText(tree: HastNode): string {
  const parts: string[] = [];
  walk(tree, (n) => {
    if (n.type === "text" && n.value) parts.push(n.value);
  });
  return parts.join("");
}

test("remarkInlineCitations 把 [1] 与 [1,2] 收成 cite-ref", () => {
  const tree = toHast("核糖体是蛋白质合成的场所[1]。细胞膜[1, 2]。");
  const refs = citeRefs(tree);
  assert.equal(refs.length, 2);
  assert.equal(refs[0]?.properties?.indexes, "1");
  assert.equal(refs[1]?.properties?.indexes, "1,2");
});

test("remarkInlineCitations 把相邻 [1][2] 收成同一张卡", () => {
  const tree = toHast("这句话同时参考了两处[1][2]。下一句只参考一处[3]。");
  const refs = citeRefs(tree);
  assert.equal(refs.length, 2);
  assert.equal(refs[0]?.properties?.indexes, "1,2");
  assert.equal(refs[1]?.properties?.indexes, "3");
});

test("remarkInlineCitations 不改代码块和 Markdown 链接", () => {
  const tree = toHast("看 `[1]` 和 [文档](https://example.edu/a)。");
  assert.equal(citeRefs(tree).length, 0);
  assert.match(collectText(tree), /文档/);
});
