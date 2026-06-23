import type { Components } from "react-markdown";
import { directiveComponents } from "@/lib/markdown/directiveComponents";
import CodeBlock from "@/components/shared/CodeBlock";
import { ContentImage } from "@/components/shared/ContentImage";

// 笔记侧的 react-markdown 组件映射，供客户端 NoteRenderer 与服务端 NoteRendererServer
// 共同复用（消除映射重复，遵守 docs/refer/rendering-architecture.md 的「单一来源」约束）。
// 本文件不加 "use client"：它只是一组组件引用的纯对象，可被服务端与客户端组件同时 import；
// 其中的指令组件 / CodeBlock / ContentImage 自身已是 "use client"，从服务端渲染时自动成为水合岛。
export const noteComponents = {
  ...directiveComponents,
  img: ContentImage,
  pre: ({ node, ...props }: any) => <CodeBlock {...props} />,
} as unknown as Components;
