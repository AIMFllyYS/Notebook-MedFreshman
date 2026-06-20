"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import { directiveComponents } from "@/lib/markdown/directiveComponents";
import CodeBlock from "@/components/shared/CodeBlock";

const components = {
  ...directiveComponents,
  img: ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />
  ),
  pre: ({ node, ...props }: any) => <CodeBlock {...props} />,
} as unknown as Components;

function NoteRendererBase({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={sharedRemarkPlugins}
      rehypePlugins={sharedRehypePlugins}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

export default memo(NoteRendererBase);
