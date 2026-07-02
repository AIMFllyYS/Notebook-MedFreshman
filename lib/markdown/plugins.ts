import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/contrib/mhchem";
import remarkDirectives from "./remarkDirectives";
import remarkCalloutSoftBreaks from "./remarkCalloutSoftBreaks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sharedRemarkPlugins: any[] = [
  remarkGfm,
  remarkMath,
  remarkDirective,
  remarkDirectives,
  remarkCalloutSoftBreaks,
];

// rehype-raw must precede rehype-katex so raw HTML/SVG nodes are parsed
// before KaTeX processes math delimiters.
//
// rehype-highlight 的 detect:true 会让 highlight.js 对每个未标语言的 fence 遍历所有 grammar
// 做自动识别——对概率论/物理这种"整卷 KaTeX 但几乎无代码块"的内容来说是纯浪费。
// 现在改为 detect:false，仅在作者显式写 ```lang 时才高亮；未标语言的 fence 保持原样即可。
// subset 白名单避免加载 hljs 全部 grammar bundle（打包/首屏都受益）。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sharedRehypePlugins: any[] = [
  rehypeRaw,
  [rehypeKatex, { throwOnError: false, strict: false }],
  [
    rehypeHighlight,
    {
      detect: false,
      ignoreMissing: true,
      subset: [
        "python",
        "javascript",
        "typescript",
        "bash",
        "shell",
        "json",
        "html",
        "css",
        "markdown",
      ],
    },
  ],
];
