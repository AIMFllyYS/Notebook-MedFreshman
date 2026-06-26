// 守卫：拦截会压坏 KaTeX 拉伸 svg（根号/箭头/宽帽/向量）的危险 CSS 规则。
//
// 背景：`.prose-notes`/`.chat-prose` 容器同时托管 KaTeX 内部 svg。任何
// `.prose-notes svg { height: ... }` 之类裸元素规则会以相等特异性覆盖 KaTeX 自带的
// `.katex svg{height:inherit}`，把 viewBox 数百:1 的箭头压成 ~0.04px → 公式损坏。
// 详见 docs/refer/rendering-architecture.md §8。
//
// 规则：在 app/styles/*.css 中，若某选择器同时含 `.prose-notes`/`.chat-prose` 与裸
// `svg`/`path`，且声明体设置了 height/margin，又未通过 `.katex` 豁免 → 报错退出。

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const STYLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "styles");

const PROSE = /\.(prose-notes|chat-prose)\b/;
const BARE_EL = /(^|[\s>+~(,])(svg|path)(\s*[,{:]|\s+[.#:[])/; // 裸 svg/path（非 .katex svg）
const GEOM = /(^|[\s;{])(height|margin)\s*:/;

const violations = [];

for (const file of readdirSync(STYLES_DIR).filter((f) => f.endsWith(".css"))) {
  const css = readFileSync(join(STYLES_DIR, file), "utf8");
  // 粗分规则块：selector { body }
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css)) !== null) {
    const selector = m[1].trim();
    const body = m[2];
    if (!PROSE.test(selector)) continue;
    if (selector.includes(".katex")) continue; // KaTeX 内部允许（且需要）
    if (!BARE_EL.test(selector)) continue;
    if (!GEOM.test(body)) continue;
    violations.push(`${file}: ${selector.replace(/\s+/g, " ")} { ${body.trim().slice(0, 60)}… }`);
  }
}

if (violations.length) {
  console.error(
    "\n[check-prose-svg-rules] 发现会压坏 KaTeX 公式 svg 的危险规则：\n" +
      violations.map((v) => "  - " + v).join("\n") +
      "\n\n请改用 <img>/canvas 作用域，或用 `.katex` 豁免。见 rendering-architecture.md §8。\n",
  );
  process.exit(1);
}

console.log("[check-prose-svg-rules] OK：无危险的裸 svg/path 几何规则。");
