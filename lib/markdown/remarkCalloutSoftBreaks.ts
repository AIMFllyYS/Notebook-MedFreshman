import { visit } from "unist-util-visit";

/**
 * 限定作用域的软换行插件：仅对 `:::callout{...}` 卡片内部生效。
 *
 * 背景：共享渲染管线（sharedRemarkPlugins）按标准 Markdown 语义排版，段内单换行被
 * 折叠为空格。这导致题目卡片内用单换行分隔的 ABCD 选项堆在一行。全局启用
 * remarkSoftBreaks 会破坏笔记正文段落排版，故此处只在 callout 容器子树内把 text 节点
 * 的单换行转换为 break 节点，精准修复题目/解析/知识延伸等卡片的换行，零回归。
 *
 * 只改写 text 节点：行内公式(inlineMath)、代码(code/inlineCode)、数学块(math)在 mdast
 * 里是独立节点类型，不会被波及；remark-gfm 已处理的行尾硬换行(两空格/反斜杠)在此之前
 * 已成为 break 节点。
 *
 * 触发范围：type === "containerDirective" 且 name === "callout"（即 :::callout{...} 写法，
 * 含 kind=note/insight/tip/memory/... 等所有 callout 变体）。
 */

interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
  name?: string;
}

export default function remarkCalloutSoftBreaks() {
  return (tree: unknown) => {
    visit(tree as never, "containerDirective", (node: MdastNode) => {
      if (node.name !== "callout") return;
      // 在 callout 子树内，把 text 节点的单换行拆成 text + break
      visit(
        node as never,
        "text",
        (textNode: MdastNode, index: number | null, parent: MdastNode | null) => {
          if (index == null || parent == null || parent.children == null) return;
          const value = textNode.value;
          if (typeof value !== "string" || !value.includes("\n")) return;

          const segments = value.split("\n");
          const replacement: MdastNode[] = [];
          segments.forEach((seg, i) => {
            if (i > 0) replacement.push({ type: "break" });
            if (seg) replacement.push({ type: "text", value: seg });
          });

          parent.children.splice(index, 1, ...replacement);
          // 让 visit 跳过刚插入的节点，避免重复访问
          return [undefined, index + replacement.length];
        },
      );
    });
  };
}
