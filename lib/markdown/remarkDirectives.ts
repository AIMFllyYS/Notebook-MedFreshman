import { visit } from "unist-util-visit";

/**
 * 把 remark-directive 解析出的容器/叶子指令，转换为渲染器可识别的自定义元素：
 *   :::definition / theorem / example / insight / pitfall / note  -> <callout kind=...>
 *   :::derivation{title=...}                                       -> <derivation>
 *   ::video{id=...} / ::interactive{id=...}                        -> <mediaembed kind=... id=...>
 *
 * 用法（笔记作者）：
 *   :::theorem{label=全概率公式}
 *   设 $B_1,\dots,B_n$ 为样本空间的一个划分……
 *   :::
 *
 *   ::video{id=ch01-1.4-classical}
 *   ::interactive{id=ch01-1.2-venn}
 */
const CALLOUTS = new Set([
  "definition",
  "theorem",
  "example",
  "insight",
  "pitfall",
  "note",
]);

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined>;
  data?: Record<string, unknown>;
}

export default function remarkDirectives() {
  return (tree: unknown) => {
    visit(tree as never, (node: DirectiveNode) => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }
      const name = node.name;
      const attrs = node.attributes ?? {};
      const data = (node.data ??= {});

      if (node.type === "containerDirective" && CALLOUTS.has(name)) {
        data.hName = "callout";
        data.hProperties = { kind: name, label: attrs.label ?? attrs.title ?? "" };
        return;
      }
      if (node.type === "containerDirective" && name === "derivation") {
        data.hName = "derivation";
        data.hProperties = { label: attrs.label ?? attrs.title ?? "推导过程" };
        return;
      }
      if (name === "video" || name === "interactive") {
        data.hName = "mediaembed";
        data.hProperties = { kind: name, eid: attrs.id ?? "" };
        return;
      }
    });
  };
}
