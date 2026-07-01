import { visit, SKIP } from "unist-util-visit";
import { CALLOUTS } from "./calloutTypes";

/**
 * 把 remark-directive 解析出的容器/叶子指令，转换为渲染器可识别的自定义元素：
 *   :::definition / theorem / example / insight / pitfall / note / tip  -> <callout kind=...>
 *   :::callout{kind=note|insight|tip|... label=...}                    -> <callout kind=...>（SOP 08 试卷写法）
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

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined>;
  data?: Record<string, unknown>;
  children?: unknown[];
}

export default function remarkDirectives() {
  return (tree: unknown) => {
    visit(
      tree as never,
      (node: DirectiveNode, index: number | undefined, parent: { children: unknown[] } | undefined) => {
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

      // 记忆卡指令需要在 CALLOUTS 之前匹配，因为 memory 也在 CALLOUT_TYPES 中
      // 用于样式元数据，但渲染走独立组件。
      if (node.type === "containerDirective" && name === "memory") {
        data.hName = "memorycard";
        data.hProperties = {
          kind: "memory",
          label: attrs.label ?? attrs.title ?? "记忆卡",
          mode: attrs.mode ?? "",
        };
        return;
      }
      // SOP 08 试卷录入写法：:::callout{kind=note label="题目"}（kind 指定样式类型）
      if (node.type === "containerDirective" && name === "callout") {
        const kind = attrs.kind && CALLOUTS.has(attrs.kind) ? attrs.kind : "note";
        data.hName = "callout";
        data.hProperties = { kind, label: attrs.label ?? attrs.title ?? "" };
        return;
      }
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
      if (name === "figure") {
        data.hName = "figuremedia";
        data.hProperties = {
          src: attrs.src ?? "",
          alt: attrs.alt ?? "",
          caption: attrs.caption ?? attrs.label ?? "",
        };
        return;
      }
      if (name === "plot") {
        data.hName = "functionplot";
        data.hProperties = {
          fn: attrs.fn ?? "",
          xmin: attrs.xmin ?? "",
          xmax: attrs.xmax ?? "",
          ymin: attrs.ymin ?? "",
          ymax: attrs.ymax ?? "",
          color: attrs.color ?? "",
          label: attrs.label ?? "",
          xlabel: attrs.xlabel ?? "",
          ylabel: attrs.ylabel ?? "",
          width: attrs.width ?? "",
          height: attrs.height ?? "",
          samples: attrs.samples ?? "",
        };
        return;
      }
      if (node.type === "containerDirective" && name === "canvas") {
        data.hName = "svgcanvas";
        data.hProperties = {
          width: attrs.width ?? "",
          height: attrs.height ?? "",
          xmin: attrs.xmin ?? "",
          xmax: attrs.xmax ?? "",
          ymin: attrs.ymin ?? "",
          ymax: attrs.ymax ?? "",
          xlabel: attrs.xlabel ?? "",
          ylabel: attrs.ylabel ?? "",
          grid: attrs.grid ?? "",
          axes: attrs.axes ?? "",
        };
        return;
      }

      // 兜底：未被任何处理器识别的「文本指令」(:name)。本项目不使用文本指令，
      // 而 remark-directive 会把散文里的「词:Word」(如 "Nd:YAG"、比值 "3:X") 误解析成
      // textDirective，未识别就会被 mdast-util-to-hast 静默丢弃 → 吞掉冒号后的文字。
      // 这里把它还原成字面文本 ":name"（保留其内联子节点，如有 [label]），既修复笔记，
      // 也兜底 AI 对话输出。容器/叶子指令为块级、与散文冲突概率低，暂不在此处理。
      if (node.type === "textDirective" && parent && typeof index === "number") {
        const tail = Array.isArray(node.children) ? node.children : [];
        parent.children.splice(index, 1, { type: "text", value: ":" + name }, ...tail);
        return [SKIP, index];
      }
    },
    );
  };
}
