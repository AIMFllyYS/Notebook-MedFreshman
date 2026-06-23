#!/usr/bin/env node
/**
 * 媒体同步守卫 — 校验 media.*.generated.ts 中所有视频 src 对应的文件
 * 在 public/ 下实际存在，防止 stale 条目导致海报 404 和播放器引用空视频。
 *
 * 背景：render.py 生成 media.generated.ts 时扫描磁盘已有 mp4，但如果视频
 * 文件被删除后未重新运行 render.py，清单中会残留指向不存在文件的条目。
 * videoPoster() 从 src 推导海报路径，视频不存在 → 海报也不存在 → 404。
 *
 * 用法：node scripts/check-media-sync.mjs   （prebuild 自动执行）
 * 退出码：0 全部同步；1 存在 stale 条目。
 */
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const GENERATED_FILES = [
  "content/media.generated.ts",
  "content/media.physics.generated.ts",
  "content/media.chemistry.generated.ts",
];

const missing = [];
let total = 0;

for (const rel of GENERATED_FILES) {
  const abs = join(ROOT, rel);
  let text;
  try {
    text = readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  const srcRe = /"src":\s*"([^"]+)"/g;
  let m;
  while ((m = srcRe.exec(text)) !== null) {
    total++;
    const src = m[1];
    const filePath = join(ROOT, "public", src);
    if (!existsSync(filePath)) {
      missing.push({ generatedFile: rel, src });
    }
  }
}

if (missing.length) {
  console.error(`\n✗ 媒体同步守卫：${missing.length} 个视频文件缺失（共 ${total} 条，扫描 ${GENERATED_FILES.length} 个清单）：`);
  for (const v of missing) {
    console.error(`   - ${v.generatedFile}: ${v.src}`);
  }
  console.error(`\n  这些条目指向不存在的视频文件，会导致海报 404 和播放器引用空视频。`);
  console.error(`  请重新运行 "python manim/render.py"（不带 --chapter）以重新扫描磁盘并更新清单，`);
  console.error(`  或手动从 generated.ts 中删除 stale 条目。\n`);
  process.exit(1);
}
console.log(`✓ 媒体同步守卫：${total} 个视频条目文件均存在（扫描 ${GENERATED_FILES.length} 个清单）。`);
