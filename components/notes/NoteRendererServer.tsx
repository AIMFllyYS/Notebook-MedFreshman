import { MarkdownAsync } from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import { noteComponents } from "@/lib/markdown/noteComponents";

/**
 * 服务端正文渲染器（React Server Component）。
 *
 * 在服务端 / 构建期把笔记正文 Markdown → HTML（含 KaTeX 公式、代码高亮），浏览器只接收
 * 渲染结果，不再在客户端逐次解析整篇 markdown —— 消除「切换章节」时的主线程阻塞。
 * 视频 / 绘图 / 复制按钮等交互指令（均为 "use client" 组件）会作为水合岛保留，功能不丢。
 *
 * 约束：`content` 必须由调用方（page.tsx）预先经 normalizeDirectiveLabels 归一一次，
 * 本组件不再重复归一（与客户端 NoteRenderer 的职责划分见 docs/refer/rendering-architecture.md）。
 */
export default async function NoteRendererServer({ content }: { content: string }) {
  return (
    <MarkdownAsync
      remarkPlugins={sharedRemarkPlugins}
      rehypePlugins={sharedRehypePlugins}
      components={noteComponents}
    >
      {content}
    </MarkdownAsync>
  );
}
