"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import remarkDirectives from "@/lib/markdown/remarkDirectives";
import { Callout, Derivation, MediaEmbed } from "./directives";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remarkPlugins: any[] = [
  remarkGfm,
  remarkMath,
  remarkDirective,
  remarkDirectives,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rehypePlugins: any[] = [
  [rehypeKatex, { throwOnError: false, strict: false }],
  [rehypeHighlight, { detect: true, ignoreMissing: true }],
];

// 自定义指令元素 -> React 组件
const components = {
  callout: Callout,
  derivation: Derivation,
  mediaembed: MediaEmbed,
} as unknown as Components;

function NoteRendererBase({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

export default memo(NoteRendererBase);
