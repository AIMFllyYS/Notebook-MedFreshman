"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import { directiveComponents } from "@/lib/markdown/directiveComponents";
import { normalizeDirectiveLabels } from "@/lib/markdown/normalizeDirectiveLabels";
import { ContentImage } from "@/components/shared/ContentImage";
import "katex/dist/katex.min.css";

interface QuizMarkdownProps {
  children: string;
  /** 行内渲染：把段落降级为 span，避免选项/题干内出现块级换行。 */
  inline?: boolean;
  className?: string;
}

type MarkdownComponentProps<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & { node?: unknown };

const blockComponents = {
  ...directiveComponents,
  table: ({ node, ...props }: MarkdownComponentProps<"table">) => {
    void node;
    return (
      <div style={{ overflowX: "auto" }}>
        <table {...props} />
      </div>
    );
  },
  img: ContentImage,
} as Partial<Components>;

const inlineComponents = {
  ...directiveComponents,
  p: ({ node, ...props }: MarkdownComponentProps<"p">) => {
    void node;
    return <span {...props} />;
  },
  img: ContentImage,
} as Partial<Components>;

function cleanControlTags(content: string): string {
  return content
    .replace(/<FollowUp>[\s\S]*?<\/FollowUp>/gi, "")
    .replace(/<FollowUp>[\s\S]*$/i, "");
}

/**
 * 题目测试专用的轻量 Markdown + KaTeX 渲染器。
 * 复用全站共享的 remark/rehype 插件（remark-math + rehype-katex + mhchem），
 * 支持 $...$ / $$...$$ 公式与基础 Markdown，但不挂载可视化/工具调用等重型逻辑。
 */
export default function QuizMarkdown({ children, inline, className }: QuizMarkdownProps) {
  const content = normalizeDirectiveLabels(cleanControlTags(children ?? ""));
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
