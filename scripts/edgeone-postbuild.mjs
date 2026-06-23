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

const INCLUDE_DIRS = [
  "content",
];

const EXTENSIONS = new Set([".md", ".json", ".html", ".ts", ".tsx", ".js", ".mjs"]);

function collectFiles(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      collectFiles(full, acc);
    } else if (e.isFile() && EXTENSIONS.has(e.name.slice(e.name.lastIndexOf(".")))) {
      acc.push(full);
    }
  }
  return acc;
}

let created = 0;

for (const dir of INCLUDE_DIRS) {
  const srcDir = join(ROOT, dir);
  if (!existsSync(srcDir)) continue;

  const files = collectFiles(srcDir);
  for (const src of files) {
    const rel = relative(join(ROOT, dir), src);
    const dest = join(TARGET_BASE, dir, rel);
    if (!existsSync(dest)) {
      mkdirSync(join(dest, ".."), { recursive: true });
      writeFileSync(dest, "");
      created++;
    }
  }
}

if (created > 0) {
  console.log(`✓ EdgeOne postbuild：创建 ${created} 个占位文件防止 unlink ENOENT`);
} else {
  console.log("✓ EdgeOne postbuild：所有占位文件已存在，无需创建");
}
