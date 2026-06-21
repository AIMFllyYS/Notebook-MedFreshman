"use client";

import { memo, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { sharedRemarkPlugins, sharedRehypePlugins } from "@/lib/markdown/plugins";
import { directiveComponents } from "@/lib/markdown/directiveComponents";
import { normalizeDirectiveLabels } from "@/lib/markdown/normalizeDirectiveLabels";
import CodeBlock from "@/components/shared/CodeBlock";
import { ContentImage } from "@/components/shared/ContentImage";

const components = {
  ...directiveComponents,
  img: ContentImage,
  pre: ({ node, ...props }: any) => <CodeBlock {...props} />,
} as unknown as Components;

function NoteRendererBase({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={sharedRemarkPlugins}
      rehypePlugins={sharedRehypePlugins}
      components={components}
    >
      {normalizeDirectiveLabels(content)}
    </ReactMarkdown>
  );
}

export default memo(NoteRendererBase);
