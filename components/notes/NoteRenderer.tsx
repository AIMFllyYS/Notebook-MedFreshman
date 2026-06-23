"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import { normalizeDirectiveLabels } from "@/lib/markdown/normalizeDirectiveLabels";
import { noteComponents } from "@/lib/markdown/noteComponents";

// 客户端笔记渲染器：用于流式内容（AI 划词解释气泡 Message.tsx）、视频讲稿（VideoTab）、
// 例题（ExampleTab）等「内容在客户端才确定」的场景。静态正文已改走服务端 NoteRendererServer。
// 这些场景内容未预归一，故此处保留 normalizeDirectiveLabels。
function NoteRendererBase({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={sharedRemarkPlugins}
      rehypePlugins={sharedRehypePlugins}
      components={noteComponents}
    >
      {normalizeDirectiveLabels(content)}
    </ReactMarkdown>
  );
}

export default memo(NoteRendererBase);
