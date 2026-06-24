/**
 * 修复「数学公式内的 HTML 实体」：作者/提取管线把 `<` `>` `&` 误写成 `&lt;` `&gt;` `&amp;`，
 * KaTeX 不识别 HTML 实体 → 线上渲染成红字错误。本脚本仅在 remark-math 解析出的
 * math / inlineMath 节点跨度内做替换（正文与代码块原样不动），并在替换后用真实 KaTeX
 * 复编译每条公式，报告仍编译失败者（需人工处理，如缺 cases 环境）。
 *
 * 用法：node scripts/fix-math-entities.mjs [--write] [dir|file]
 *   默认 dry-run，扫描 content/（排除 _raw）。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";
import katex from "katex";
import "katex/contrib/mhchem";

const require = createRequire(import.meta.url);
const rmRequire = createRequire(require.resolve("react-markdown"));
const { unified } = await import(pathToFileURL(rmRequire.resolve("unified")).href);
const remarkParse = (await import(pathToFileURL(rmRequire.resolve("remark-parse")).href)).default;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath);

const ENTITY_RE = /&lt;|&gt;|&amp;/g;
const ENTITY_MAP = { "&lt;": "<", "&gt;": ">", "&amp;": "&" };

const write = process.argv.includes("--write");
const posArg = process.argv.slice(2).find((a) => !a.startsWith("--"));

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    if (name === "_raw") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (extname(p) === ".md") acc.push(p);
  }
  return acc;
}
const base = posArg ? join(ROOT, posArg) : join(ROOT, "content");
const targets = statSync(base).isFile() ? [base] : walk(base, []).sort();

let filesChanged = 0;
let spansFixed = 0;
const stillBroken = [];

for (const file of targets) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const raw = readFileSync(file, "utf8");
  const tree = processor.parse(raw);

  // 收集需要修改的 math 跨度（按 offset 倒序，保证 splice 不失效）
  const edits = [];
  visit(tree, (node) => {
    if (node.type !== "math" && node.type !== "inlineMath") return;
    if (!ENTITY_RE.test(node.value)) return;
    ENTITY_RE.lastIndex = 0;
    const s = node.position?.start?.offset;
    const e = node.position?.end?.offset;
    if (s == null || e == null) return;
    edits.push({ s, e, display: node.type === "math" });
  });
  if (!edits.length) continue;

  edits.sort((a, b) => b.s - a.s);
  let out = raw;
  for (const { s, e } of edits) {
    const span = out.slice(s, e);
    const cleaned = span.replace(ENTITY_RE, (m) => ENTITY_MAP[m]);
    out = out.slice(0, s) + cleaned + out.slice(e);
    spansFixed++;
  }

  // 复编译校验
  const tree2 = processor.parse(out);
  visit(tree2, (node) => {
    if (node.type !== "math" && node.type !== "inlineMath") return;
    try {
      katex.renderToString(node.value, {
        displayMode: node.type === "math",
        throwOnError: true,
        strict: false,
        trust: true,
      });
    } catch (err) {
      stillBroken.push(`${rel} L${node.position?.start?.line}: ${err.message.split("\n")[0]}  «${node.value.replace(/\s+/g, " ").slice(0, 70)}»`);
    }
  });

  filesChanged++;
  console.log(`${write ? "✓ 写回" : "将修改"} ${rel}（${edits.length} 段公式）`);
  if (write) writeFileSync(file, out, "utf8");
}

console.log(`\n${write ? "已修改" : "dry-run"}：${filesChanged} 文件，${spansFixed} 段公式。`);
if (stillBroken.length) {
  console.log(`\n⚠ 替换后仍编译失败 ${stillBroken.length} 条（需人工处理）：`);
  for (const b of stillBroken) console.log("  " + b);
}
