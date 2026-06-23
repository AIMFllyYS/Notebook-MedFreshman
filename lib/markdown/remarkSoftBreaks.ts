import { visit } from "unist-util-visit";

/**
 * 把"软换行"（段内单个 \n）转换为硬换行 <br>，贴合聊天/输入框的"所见即所得换行"。
 *
 * 仅用于聊天体文本（用户输入、思考过程、交互演示的「生成依据」prompt），不进入笔记/助手
 * 正文的共享渲染管线 —— 笔记按标准 Markdown 语义（段内单换行折叠为空格）排版，二者不能混用。
 *
 * 只改写 text 节点：行内公式(inlineMath)、代码(code/inlineCode)、数学块(math)在 mdast 里是
 * 独立节点类型，不会被波及；remark-gfm 已处理的行尾硬换行(两空格/反斜杠)在此之前已成为 break 节点。
 */

interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
}

export default function remarkSoftBreaks() {
  return (tree: unknown) => {
    visit(
      tree as never,
      (node: MdastNode, index: number | null, parent: MdastNode | null) => {
        if (node.type !== "text" || parent == null || index == null) return;
        const value = node.value;
        if (typeof value !== "string" || !value.includes("\n")) return;

        const segments = value.split("\n");
        const replacement: MdastNode[] = [];
        segments.forEach((seg, i) => {
          if (i > 0) replacement.push({ type: "break" });
          if (seg) replacement.push({ type: "text", value: seg });
        });

        parent.children!.splice(index, 1, ...replacement);
        // 让 visit 跳过刚插入的节点，避免重复访问
        return index + replacement.length;
      },
    );
  };
}
