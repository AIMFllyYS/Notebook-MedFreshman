"use client";

import type { Components } from "react-markdown";
import { directiveComponents } from "@/components/shared/directives/registry";
import QuizMarkdownBase, {
  composeQuizMarkdownComponents,
} from "@/components/quiz/QuizMarkdownBase";

interface QuizMarkdownProps {
  children: string;
  /** 行内渲染：把段落降级为 span，避免选项/题干内出现块级换行。 */
  inline?: boolean;
  className?: string;
}

/** 导出供求值顺序回归测试读取；渲染只把它们交给 ReactMarkdown。 */
export const blockComponents: Partial<Components> = composeQuizMarkdownComponents(
  directiveComponents,
  false,
);

/** 导出供求值顺序回归测试读取；渲染只把它们交给 ReactMarkdown。 */
export const inlineComponents: Partial<Components> = composeQuizMarkdownComponents(
  directiveComponents,
  true,
);

/**
 * 题目测试专用的轻量 Markdown + KaTeX 渲染器。
 * 复用全站共享的 remark/rehype 插件（remark-math + rehype-katex + mhchem），
 * 支持 $...$ / $$...$$ 公式与基础 Markdown，但不挂载可视化/工具调用等重型逻辑。
 */
export default function QuizMarkdown({ children, inline, className }: QuizMarkdownProps) {
  return (
    <QuizMarkdownBase
      inline={inline}
      className={className}
      components={inline ? inlineComponents : blockComponents}
    >
      {children}
    </QuizMarkdownBase>
  );
}
