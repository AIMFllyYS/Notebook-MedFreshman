#!/usr/bin/env node
/**
 * 内容编码守卫 — 校验所有内容/提示词 Markdown 均为合法 UTF-8。
 *
 * 背景：本仓在 Windows 上开发，控制台默认 GBK(cp936)。若子智能体或脚本把
 * 中文内容经未强制 UTF-8 的管道写盘，三字节汉字的尾字节会被替换为 `?`(0x3F)，
 * 产生非法 UTF-8 → 前端渲染出现「乱码 + 块结构坍塌（:::/$$ 围栏未闭合而层层堆叠）」。
 * 详见 docs/refer/rendering-architecture.md。此脚本在 build 前拦截该类损坏。
 *
 * 用法：node scripts/check-content-encoding.mjs   （prebuild 自动执行）
 * 退出码：0 全部合法；1 存在非法 UTF-8 文件。
 */
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const ROOTS = ["content", "lib/ai/prompts"];
const EXTS = [".md", ".mdx"];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.some((e) => name.endsWith(e))) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

const decoder = new TextDecoder("utf-8", { fatal: true });
const bad = [];
let total = 0;
for (const root of ROOTS) {
  for (const f of walk(root)) {
    total++;
    const buf = readFileSync(f);
    try {
      decoder.decode(buf);
    } catch (e) {
      bad.push({ f, reason: e.message });
    }
  }
}

if (bad.length) {
  console.error(`\n✗ 内容编码守卫：发现 ${bad.length} 个非法 UTF-8 文件（共扫描 ${total} 个）：`);
  for (const { f, reason } of bad) console.error(`   - ${f}  (${reason})`);
  console.error(`\n  这些文件很可能在 Windows GBK 管道下损坏。请用 git 恢复未损坏版本，`);
  console.error(`  或用 Write/Edit 工具（保证 UTF-8）重写，切勿经 PowerShell/控制台重定向写盘。\n`);
  process.exit(1);
}
console.log(`✓ 内容编码守卫：${total} 个 Markdown 文件均为合法 UTF-8。`);
