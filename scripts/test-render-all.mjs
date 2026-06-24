/**
 * 全量渲染测试：把 content/ 下每个 Markdown 文件喂进与生产一致的解析管线，
 * 精确编译每条 KaTeX 公式（throwOnError:true，与线上 throwOnError:false 互补——
 * 线上会把错误公式静默渲染成红字，本脚本则把它们一一抓出），并校验每个指令：
 *   - 指令名是否在已知集合（callout/derivation/video/interactive/figure/plot/canvas）
 *   - video/interactive 叶子指令是否带 id
 *   - 是否有解析失败、泄漏成字面文本的 ::: 指令开头
 *
 * 解析管线复用 react-markdown 同款依赖：unified + remark-parse/gfm/math/directive，
 * 并先经真实 normalizeDirectiveLabels 归一（与 page.tsx / NoteRenderer 一致）。
 *
 * 运行：node scripts/test-render-all.mjs            （扫描 content/**）
 *      node scripts/test-render-all.mjs <dir|file>  （限定范围）
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import katex from "katex";
import "katex/contrib/mhchem";
import normalizeDirectiveLabels from "../lib/markdown/normalizeDirectiveLabels.ts";

// unified / remark-parse 是 react-markdown 的传递依赖，pnpm 不提升到顶层 node_modules，
// 故从 react-markdown 的解析作用域里取，复用与生产完全一致的解析器实现。
const require = createRequire(import.meta.url);
const rmRequire = createRequire(require.resolve("react-markdown"));
const { unified } = await import(pathToFileURL(rmRequire.resolve("unified")).href);
const remarkParse = (await import(pathToFileURL(rmRequire.resolve("remark-parse")).href)).default;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// 已知指令名（与 lib/markdown/remarkDirectives.ts + calloutTypes.ts 保持一致）
const CALLOUTS = new Set([
  "definition", "theorem", "example", "insight", "pitfall", "note", "tip",
]);
const KNOWN_CONTAINER = new Set([...CALLOUTS, "derivation", "canvas"]);
const KNOWN_LEAF = new Set(["video", "interactive", "figure", "plot"]);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective);

// _raw 是 docx/PPT 提取的源料中转目录，从不经 loader 渲染给用户；默认排除。
// 传 --include-raw 可纳入扫描。
const INCLUDE_RAW = process.argv.includes("--include-raw");

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    if (!INCLUDE_RAW && name === "_raw") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (extname(p) === ".md") acc.push(p);
  }
  return acc;
}

function collectTargets(arg) {
  const base = arg ? join(ROOT, arg) : join(ROOT, "content");
  const st = statSync(base);
  if (st.isFile()) return [base];
  return walk(base, []);
}

const posArg = process.argv.slice(2).find((a) => !a.startsWith("--"));
const targets = collectTargets(posArg).sort();

let filesWithIssues = 0;
let katexErrors = 0;
let directiveIssues = 0;
let leakIssues = 0;
const report = [];

for (const file of targets) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch (e) {
    report.push(`✗ ${rel}\n    无法读取: ${e.message}`);
    filesWithIssues++;
    continue;
  }

  const src = normalizeDirectiveLabels(raw);
  let tree;
  try {
    tree = processor.runSync(processor.parse(src));
  } catch (e) {
    report.push(`✗ ${rel}\n    解析崩溃: ${e.message}`);
    filesWithIssues++;
    continue;
  }

  const issues = [];

  // 1) KaTeX 全量编译
  visit(tree, (node) => {
    if (node.type !== "math" && node.type !== "inlineMath") return;
    const displayMode = node.type === "math";
    try {
      katex.renderToString(node.value, {
        displayMode,
        throwOnError: true,
        strict: false,
        trust: true,
      });
    } catch (e) {
      const line = node.position?.start?.line ?? "?";
      const snippet = node.value.replace(/\s+/g, " ").slice(0, 80);
      issues.push(`    [KaTeX L${line}] ${e.message.split("\n")[0]}  «${snippet}»`);
      katexErrors++;
    }
  });

  // 2) 指令名/属性健全性
  visit(tree, (node) => {
    if (
      node.type !== "containerDirective" &&
      node.type !== "leafDirective" &&
      node.type !== "textDirective"
    ) {
      return;
    }
    const line = node.position?.start?.line ?? "?";
    const name = node.name;
    if (node.type === "containerDirective") {
      if (!KNOWN_CONTAINER.has(name)) {
        issues.push(`    [指令 L${line}] 未知容器指令 ":::${name}"（不会被任何组件渲染）`);
        directiveIssues++;
      }
    } else {
      // leaf / text directive
      if (!KNOWN_LEAF.has(name)) {
        issues.push(`    [指令 L${line}] 未知指令 ":${name}"（不会被任何组件渲染）`);
        directiveIssues++;
      } else if ((name === "video" || name === "interactive") && !(node.attributes && node.attributes.id)) {
        issues.push(`    [指令 L${line}] :${name} 缺少 id 属性`);
        directiveIssues++;
      }
    }
  });

  // 3) 泄漏的 ::: 字面文本（指令开头解析失败 → 落入普通文本）
  visit(tree, (node) => {
    if (node.type !== "text") return;
    const m = node.value.match(/(^|\n)\s*(:{3,}[A-Za-z])/);
    if (m) {
      const line = node.position?.start?.line ?? "?";
      const snippet = node.value.replace(/\s+/g, " ").trim().slice(0, 80);
      issues.push(`    [泄漏 L~${line}] 字面 ":::"，疑似指令未解析 «${snippet}»`);
      leakIssues++;
    }
  });

  if (issues.length) {
    filesWithIssues++;
    report.push(`✗ ${rel}\n${issues.join("\n")}`);
  }
}

console.log(report.join("\n\n"));
console.log("\n" + "=".repeat(60));
console.log(`扫描文件: ${targets.length}`);
console.log(`有问题文件: ${filesWithIssues}`);
console.log(`  KaTeX 编译错误: ${katexErrors}`);
console.log(`  指令问题: ${directiveIssues}`);
console.log(`  ::: 泄漏: ${leakIssues}`);
process.exit(filesWithIssues > 0 ? 1 : 0);
