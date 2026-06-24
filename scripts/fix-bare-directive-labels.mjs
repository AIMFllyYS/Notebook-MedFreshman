/**
 * 修复「无花括号裸标题」指令：`:::name 标题` → `:::name{label=标题}`。
 * remark-directive 不支持 `:::name 标题` 这种在开始行直接跟标题文本的写法
 * （合法形式是 `:::name{label=标题}` 或 `:::name[标题]`），否则整个 callout 解析失败、
 * 泄漏成裸文本。仅作用于显式传入的文件，按 UTF-8 安全写回。
 *
 * 用法：node scripts/fix-bare-directive-labels.mjs [--write] <file...>
 *   不带 --write 为 dry-run，仅打印将要修改的行。
 */
import { readFileSync, writeFileSync } from "node:fs";

const CALLOUTS = "definition|theorem|example|insight|pitfall|note|tip|derivation";
// 行首 3~4 冒号 + 已知指令名 + 一个或多个空格 + 标题（不以 { 或 [ 开头，排除已带属性/标签的）
const BARE = new RegExp(`^(\\s*:{3,4}(?:${CALLOUTS}))[ \\t]+(?![\\[{])(.+?)\\s*$`);

const write = process.argv.includes("--write");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));

let total = 0;
for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const lines = raw.split("\n");
  let changed = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hasCR = line.endsWith("\r");
    const bare = hasCR ? line.slice(0, -1) : line;
    const m = bare.match(BARE);
    if (!m) continue;
    const fixed = `${m[1]}{label=${m[2]}}` + (hasCR ? "\r" : "");
    console.log(`${file}:${i + 1}\n  - ${bare}\n  + ${m[1]}{label=${m[2]}}`);
    lines[i] = fixed;
    changed++;
  }
  total += changed;
  if (changed && write) {
    writeFileSync(file, lines.join("\n"), "utf8");
    console.log(`  ✓ 写回 ${file}（${changed} 处）`);
  }
}
console.log(`\n${write ? "已修改" : "将修改(dry-run)"} ${total} 处。`);
