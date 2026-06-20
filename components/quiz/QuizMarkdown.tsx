"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import "katex/dist/katex.min.css";

interface QuizMarkdownProps {
  children: string;
  /** 行内渲染：把段落降级为 span，避免选项/题干内出现块级换行。 */
  inline?: boolean;
  className?: string;
}

const blockComponents = {
  // 题干内表格可横向滚动
  table: ({ node, ...props }: any) => (
    <div style={{ overflowX: "auto" }}>
      <table {...props} />
    </div>
  ),
};

const inlineComponents = {
  // 行内场景：段落不换行，去掉默认 margin
  p: ({ node, ...props }: any) => <span {...props} />,
};

/**
 * 题目测试专用的轻量 Markdown + KaTeX 渲染器。
 * 复用全站共享的 remark/rehype 插件（remark-math + rehype-katex + mhchem），
 * 支持 $...$ / $$...$$ 公式与基础 Markdown，但不挂载可视化/工具调用等重型逻辑。
 */
export default function QuizMarkdown({ children, inline, className }: QuizMarkdownProps) {
  const content = children ?? "";
  if (inline) {
    return (
      <span className={className}>
        <ReactMarkdown
          remarkPlugins={sharedRemarkPlugins}
          rehypePlugins={sharedRehypePlugins}
          components={inlineComponents}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={sharedRemarkPlugins}
        rehypePlugins={sharedRehypePlugins}
        components={blockComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
