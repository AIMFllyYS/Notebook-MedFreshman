#!/usr/bin/env node
/**
 * EdgeOne postbuild 修复 — 在 next build 完成后、EdgeOne 插件 onBuild 钩子执行前，
 * 向 .edgeone/cloud-functions/ssr-node/ 写入空占位文件，
 * 防止插件 unlink 不存在的文件导致构建失败。
 *
 * 背景：EdgeOne 插件将 includeFiles 匹配的文件复制到 cloud-functions 目录，
 * 然后尝试 unlink 已被 Next.js 打包的文件。如果某些文件未被复制
 * （/dev/shm 内存文件系统空间不足或 race condition），
 * unlink 抛出 ENOENT，整个构建失败。
 *
 * 仅在 .edgeone 目录存在时执行（即 EdgeOne 构建环境），本地构建无副作用。
 */
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { join, resolve, relative } from "path";

const ROOT = resolve(import.meta.dirname, "..");

if (!existsSync(join(ROOT, ".edgeone"))) {
  process.exit(0);
}

const TARGET_BASE = join(ROOT, ".edgeone", "cloud-functions", "ssr-node");

// 只为 edgeone.json includeFiles 实际匹配的路径创建占位文件
const INCLUDE_PATTERNS = [
  "content/chapters/**/*.md",
  "content/examples/**/*.md",
  "content/quiz/**/*.json",
  "content/probability/**/*.md",
  "content/chemistry/**/*.md",
  "content/physics/**/*.md",
  "content/maogai/**/*.md",
  "content/modern-history/**/*.md",
  "content/other/**/*.md",
  "content/**/*.html",
];

const EXTENSIONS = new Set([".md", ".json", ".html"]);

function matchesPattern(relPath, pattern) {
  const parts = pattern.split("**");
  if (parts.length !== 2) return false;
  const prefix = parts[0];
  const suffix = parts[1];
  if (!relPath.startsWith(prefix)) return false;
  if (suffix && !relPath.endsWith(suffix)) return false;
  return true;
}

function collectFiles(dir, base = dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      collectFiles(full, base, acc);
    } else if (e.isFile() && EXTENSIONS.has(e.name.slice(e.name.lastIndexOf(".")))) {
      const rel = relative(base, full).replace(/\\/g, "/");
      if (INCLUDE_PATTERNS.some(p => matchesPattern(rel, p))) {
        acc.push(full);
      }
    }
  }
  return acc;
}

const files = collectFiles(join(ROOT, "content"), join(ROOT, "content"));
let created = 0;

for (const src of files) {
  const rel = relative(join(ROOT, "content"), src).replace(/\\/g, "/");
  const dest = join(TARGET_BASE, "content", rel);
  if (!existsSync(dest)) {
    mkdirSync(join(dest, ".."), { recursive: true });
    writeFileSync(dest, "");
    created++;
  }
}

if (created > 0) {
  console.log(`✓ EdgeOne postbuild：创建 ${created} 个占位文件防止 unlink ENOENT`);
} else {
  console.log("✓ EdgeOne postbuild：所有占位文件已存在，无需创建");
}
