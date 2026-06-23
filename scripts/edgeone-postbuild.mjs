#!/usr/bin/env node
/**
 * EdgeOne postbuild 修复 — 在 next build 完成后、EdgeOne 插件 onBuild 钩子执行前，
 * 向 .edgeone/cloud-functions/ssr-node/content/ 写入空占位 .ts 文件，
 * 防止插件 unlink 不存在的文件导致构建失败。
 *
 * 背景：EdgeOne 插件将 content/** 复制到 cloud-functions 目录，然后尝试 unlink
 * 已被 Next.js 打包的 .ts 文件。如果某些文件未被复制（race condition / 空间不足），
 * unlink 抛出 ENOENT，整个构建失败。
 *
 * 仅在 .edgeone 目录存在时执行（即 EdgeOne 构建环境），本地构建无副作用。
 */
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, resolve, relative } from "path";

const ROOT = resolve(import.meta.dirname, "..");

if (!existsSync(join(ROOT, ".edgeone"))) {
  process.exit(0);
}

const TARGET = join(ROOT, ".edgeone", "cloud-functions", "ssr-node", "content");
if (!existsSync(TARGET)) {
  mkdirSync(TARGET, { recursive: true });
}

function collectTsFiles(dir, base = dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTsFiles(full, base, acc);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      acc.push(full);
    }
  }
  return acc;
}

const tsFiles = collectTsFiles(join(ROOT, "content"));
let created = 0;

for (const src of tsFiles) {
  const rel = relative(join(ROOT, "content"), src);
  const dest = join(TARGET, rel);
  if (!existsSync(dest)) {
    mkdirSync(join(dest, ".."), { recursive: true });
    writeFileSync(dest, "");
    created++;
  }
}

if (created > 0) {
  console.log(`✓ EdgeOne postbuild：创建 ${created} 个占位 .ts 文件防止 unlink ENOENT`);
} else {
  console.log("✓ EdgeOne postbuild：所有占位文件已存在，无需创建");
}
