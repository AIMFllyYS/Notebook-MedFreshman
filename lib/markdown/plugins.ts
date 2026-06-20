import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/contrib/mhchem";
import remarkDirectives from "./remarkDirectives";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sharedRemarkPlugins: any[] = [
  remarkGfm,
  remarkMath,
  remarkDirective,
  remarkDirectives,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sharedRehypePlugins: any[] = [
  [rehypeKatex, { throwOnError: false, strict: false }],
  [rehypeHighlight, { detect: true, ignoreMissing: true }],
];
