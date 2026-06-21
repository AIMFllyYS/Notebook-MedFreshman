import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import rehypeRaw from "rehype-raw";
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

// rehype-raw must precede rehype-katex so raw HTML/SVG nodes are parsed
// before KaTeX processes math delimiters.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sharedRehypePlugins: any[] = [
  rehypeRaw,
  [rehypeKatex, { throwOnError: false, strict: false }],
  [rehypeHighlight, { detect: true, ignoreMissing: true }],
];
