"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import { normalizeDirectiveLabels } from "@/lib/markdown/normalizeDirectiveLabels";
import { ContentImage } from "@/components/shared/ContentImage";
import "katex/dist/katex.min.css";

export interface QuizMarkdownBaseProps {
  children: string;
  /** 行内渲染：把段落降级为 span，避免选项/题干内出现块级换行。 */
  inline?: boolean;
  className?: string;
  /** 额外 react-markdown 组件。本模块不 import 指令 registry，以免与 MemoryCard 成环。 */
  components?: Partial<Components>;
}

type MarkdownComponentProps<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & { node?: unknown };

function cleanControlTags(content: string): string {
  return content
    .replace(/<FollowUp>[\s\S]*?<\/FollowUp>/gi, "")
    .replace(/<FollowUp>[\s\S]*$/i, "");
}

const leafBlockComponents: Partial<Components> = {
  table: ({ node, ...props }: MarkdownComponentProps<"table">) => {
    void node;
    return (
      <div style={{ overflowX: "auto" }}>
        <table {...props} />
      </div>
    );
  },
  img: ContentImage,
};

const leafInlineComponents: Partial<Components> = {
  p: ({ node, ...props }: MarkdownComponentProps<"p">) => {
    void node;
    return <span {...props} />;
  },
  img: ContentImage,
};

export function composeQuizMarkdownComponents(
  extra: Partial<Components>,
  inline: boolean,
): Partial<Components> {
  return {
    ...extra,
    ...(inline ? leafInlineComponents : leafBlockComponents),
  };
}

/**
 * QuizMarkdown 的叶子渲染器：KaTeX + table/img/p，不挂指令 registry。
 * MemoryCard 必须 import 本文件而不是 QuizMarkdown，否则会与 registry 成环。
 */
export default function QuizMarkdownBase({
  children,
  inline,
  className,
  components,
}: QuizMarkdownBaseProps) {
  const content = normalizeDirectiveLabels(cleanControlTags(children ?? ""));
  const resolved =
    components ?? (inline ? leafInlineComponents : leafBlockComponents);

  if (inline) {
    return (
      <span className={className}>
        <ReactMarkdown
          remarkPlugins={sharedRemarkPlugins}
          rehypePlugins={sharedRehypePlugins}
          components={resolved}
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
        components={resolved}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
