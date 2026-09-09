import assert from "node:assert/strict";
import { test } from "node:test";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import remarkDirectives from "./remarkDirectives.ts";

const run = (tree: unknown) => {
  remarkDirectives()(tree);
  return tree as {
    children: Array<{
      type: string;
      name?: string;
      data?: { hName?: string; hProperties?: Record<string, string> };
      children?: unknown[];
    }>;
  };
};

function makeContainer(name: string, attrs: Record<string, string> = {}) {
  return {
    type: "containerDirective",
    name,
    attributes: attrs,
    data: {},
    children: [],
  };
}

function makeLeaf(name: string, attrs: Record<string, string> = {}) {
  return {
    type: "leafDirective",
    name,
    attributes: attrs,
    data: {},
  };
}

function makeText(name: string) {
  return {
    type: "textDirective",
    name,
    attributes: {},
    data: {},
    children: [],
  };
}

test("containerDirective :::callout{kind=...} 转为 <callout>（SOP 08 试卷写法）", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("callout", { kind: "note", label: "题目" })],
  });
  const node = tree.children[0];
  assert.equal(node.data?.hName, "callout");
  assert.equal(node.data?.hProperties?.kind, "note");
  assert.equal(node.data?.hProperties?.label, "题目");
});

test(":::callout 无 kind 时回退 note", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("callout", { label: "解析" })],
  });
  assert.equal(tree.children[0].data?.hProperties?.kind, "note");
});

test(":::callout 非法 kind 时回退 note", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("callout", { kind: "unknown", label: "题" })],
  });
  assert.equal(tree.children[0].data?.hProperties?.kind, "note");
});

test("containerDirective callout 类型转为 <callout>", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("theorem", { label: "全概率公式" })],
  });
  const node = tree.children[0];
  assert.equal(node.data?.hName, "callout");
  assert.equal(node.data?.hProperties?.kind, "theorem");
  assert.equal(node.data?.hProperties?.label, "全概率公式");
});

test("callout 无 label 时 label 回退空串", () => {
  const tree = run({ type: "root", children: [makeContainer("note")] });
  assert.equal(tree.children[0].data?.hProperties?.label, "");
});

test("callout label 回退 title 属性", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("example", { title: "例题" })],
  });
  assert.equal(tree.children[0].data?.hProperties?.label, "例题");
});

test("derivation 转为 <derivation>", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("derivation", { label: "推导" })],
  });
  assert.equal(tree.children[0].data?.hName, "derivation");
  assert.equal(tree.children[0].data?.hProperties?.label, "推导");
});

test("derivation 无 label 时回退「推导过程」", () => {
  const tree = run({ type: "root", children: [makeContainer("derivation")] });
  assert.equal(tree.children[0].data?.hProperties?.label, "推导过程");
});

test("video 叶子指令转为 <mediaembed>", () => {
  const tree = run({
    type: "root",
    children: [makeLeaf("video", { id: "ch01-1.4" })],
  });
  const node = tree.children[0];
  assert.equal(node.data?.hName, "mediaembed");
  assert.equal(node.data?.hProperties?.kind, "video");
  assert.equal(node.data?.hProperties?.eid, "ch01-1.4");
});

test("interactive 叶子指令转为 <mediaembed>", () => {
  const tree = run({
    type: "root",
    children: [makeLeaf("interactive", { id: "ch01-1.2" })],
  });
  assert.equal(tree.children[0].data?.hProperties?.kind, "interactive");
});

test("figure 叶子指令转为 <figuremedia>", () => {
  const tree = run({
    type: "root",
    children: [makeLeaf("figure", { src: "/img.png", alt: "图", caption: "说明" })],
  });
  const node = tree.children[0];
  assert.equal(node.data?.hName, "figuremedia");
  assert.equal(node.data?.hProperties?.src, "/img.png");
  assert.equal(node.data?.hProperties?.alt, "图");
  assert.equal(node.data?.hProperties?.caption, "说明");
});

test("plot 叶子指令转为 <functionplot>", () => {
  const tree = run({
    type: "root",
    children: [makeLeaf("plot", { fn: "x^2", xmin: "-1", xmax: "1" })],
  });
  const node = tree.children[0];
  assert.equal(node.data?.hName, "functionplot");
  assert.equal(node.data?.hProperties?.fn, "x^2");
  assert.equal(node.data?.hProperties?.xmin, "-1");
  assert.equal(node.data?.hProperties?.xmax, "1");
});

test("canvas 容器指令转为 <svgcanvas>", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("canvas", { width: "400", height: "300" })],
  });
  assert.equal(tree.children[0].data?.hName, "svgcanvas");
  assert.equal(tree.children[0].data?.hProperties?.width, "400");
});

test("未识别的 textDirective 还原为字面文本 :name", () => {
  const tree = run({
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [makeText("Nd"), { type: "text", value: ":YAG" }],
      },
    ],
  });
  const para = tree.children[0] as { children: unknown[] };
  // textDirective 被替换为 { type: "text", value: ":Nd" }
  assert.equal((para.children[0] as { type: string; value: string }).type, "text");
  assert.equal((para.children[0] as { type: string; value: string }).value, ":Nd");
});

test("memory 容器指令转为 <memorycard>", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("memory", { label: "本章核心要点" })],
  });
  assert.equal(tree.children[0].data?.hName, "memorycard");
  assert.equal(tree.children[0].data?.hProperties?.label, "本章核心要点");
});

test("memory 透传 mode，无 file 时不写 raw", () => {
  const tree = run({
    type: "root",
    children: [makeContainer("memory", { label: "氨基酸等电点", mode: "cloze" })],
  });
  assert.equal(tree.children[0].data?.hProperties?.mode, "cloze");
  assert.equal(tree.children[0].data?.hProperties?.raw, undefined);
});

function parseWithFile(src: string) {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkDirectives);
  const tree = processor.parse(src);
  return processor.runSync(tree, { value: src }) as unknown as {
    children: Array<{
      type: string;
      name?: string;
      data?: { hName?: string; hProperties?: Record<string, string> };
    }>;
  };
}

function memoryProps(src: string) {
  const tree = parseWithFile(src);
  const node = tree.children.find((c) => c.data?.hName === "memorycard");
  assert.ok(node, `未找到 memorycard：${JSON.stringify(tree.children.map((c) => c.data?.hName))}`);
  return node.data!.hProperties!;
}

test("remark 把 memory 容器内原文写入 raw（含 ** / 清单 / $）", () => {
  const props = memoryProps(
    ':::memory{label="氨基酸等电点" mode="cloze"}\n净电荷为零时的 **pH** 与 $\\mathrm{pI}$\n- [ ] 要点\n:::',
  );
  assert.equal(props.mode, "cloze");
  assert.match(props.raw ?? "", /\*\*pH\*\*/);
  assert.match(props.raw ?? "", /\$\\mathrm\{pI\}\$/);
  assert.match(props.raw ?? "", /- \[ \] 要点/);
});

test("memory 正文超过 8KB 时不写 raw，退回 extract 兜底", () => {
  const huge = `${"x".repeat(8200)}`;
  const props = memoryProps(`:::memory{label="过大"}\n${huge}\n:::`);
  assert.equal(props.raw, undefined);
});

test("非指令节点不受影响", () => {
  const tree = run({
    type: "root",
    children: [{ type: "paragraph", children: [{ type: "text", value: "普通文本" }] }],
  });
  assert.equal(tree.children[0].type, "paragraph");
  assert.equal(tree.children[0].data, undefined);
});
