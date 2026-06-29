#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "content", "examples", "physics", "recording");
const BAD_CONTROL_NAMES = new Map([
  [0x0b, "U+000B vertical tab"],
  [0x0c, "U+000C form feed"],
  [0x0d, "U+000D stray carriage return"],
]);

const BARE_LATEX_MACROS = [
  "frac",
  "dfrac",
  "sqrt",
  "mathrm",
  "text",
  "times",
  "theta",
  "varphi",
  "omega",
  "Delta",
  "rho",
  "eta",
  "pi",
  "sin",
  "cos",
  "tan",
  "approx",
  "cdot",
  "propto",
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function contextOf(text, index) {
  return text
    .slice(Math.max(0, index - 24), Math.min(text.length, index + 48))
    .replace(/\r/g, "<CR>")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "<TAB>")
    .replace(/\v/g, "<VT>")
    .replace(/\f/g, "<FF>");
}

function mathRanges(text) {
  const ranges = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\" && i + 1 < text.length) {
      i += 2;
      continue;
    }
    if (text.startsWith("$$", i)) {
      const end = text.indexOf("$$", i + 2);
      if (end === -1) break;
      ranges.push([i + 2, end]);
      i = end + 2;
      continue;
    }
    if (text[i] === "$") {
      const end = text.indexOf("$", i + 1);
      if (end === -1) break;
      ranges.push([i + 1, end]);
      i = end + 1;
      continue;
    }
    i++;
  }
  return ranges;
}

function checkFile(file) {
  const text = readFileSync(file, "utf8");
  const issues = [];

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isBadControl = code === 0x0b || code === 0x0c || (code === 0x0d && text[i + 1] !== "\n");
    if (isBadControl) {
      issues.push({
        line: lineOf(text, i),
        message: `${BAD_CONTROL_NAMES.get(code)}，疑似 LaTeX 反斜杠被 JS 字符串转义吞掉`,
        context: contextOf(text, i),
      });
    }
  }

  for (const [start, end] of mathRanges(text)) {
    const math = text.slice(start, end);
    for (const macro of BARE_LATEX_MACROS) {
      const pattern = new RegExp(`(^|[^\\\\A-Za-z])${macro}(?=\\b|\\{|_)`, "g");
      let match;
      while ((match = pattern.exec(math)) !== null) {
        const macroIndex = start + match.index + match[1].length;
        issues.push({
          line: lineOf(text, macroIndex),
          message: `数学环境内疑似裸 LaTeX 宏 "${macro}"，应写作 "\\${macro}"`,
          context: contextOf(text, macroIndex),
        });
      }
    }
  }

  return issues;
}

const violations = [];
for (const file of walk(ROOT)) {
  const issues = checkFile(file);
  if (issues.length > 0) {
    violations.push({ file, issues });
  }
}

if (violations.length > 0) {
  console.error(`[check-recording-example-latex-escapes] 发现 ${violations.length} 个录音例题文件存在公式转义问题：`);
  for (const { file, issues } of violations) {
    console.error(`- ${relative(process.cwd(), file).replace(/\\/g, "/")}`);
    for (const issue of issues.slice(0, 8)) {
      console.error(`  line ${issue.line}: ${issue.message}`);
      console.error(`    ${issue.context}`);
    }
    if (issues.length > 8) console.error(`  ... 另有 ${issues.length - 8} 处`);
  }
  process.exit(1);
}

console.log("[check-recording-example-latex-escapes] OK：录音例题中未发现 LaTeX 转义损坏。");

