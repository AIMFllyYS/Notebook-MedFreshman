#!/usr/bin/env node
/**
 * 讲稿 id 清单生成器。
 *
 * 从 lib/content-data/media.scripts.generated.ts（~388KB 的 id→markdown 大对象）中只提取顶层 key，
 * 写出极小的 lib/content-data/media.scripts.ids.generated.ts。VideoTab 用它判断某视频是否有配套讲稿，
 * 从而无需把 388KB 本体静态打进首屏 chunk / 常驻堆——讲稿正文仅在用户展开时按需 dynamic import。
 *
 * 由 prebuild 自动执行，保证 ids 清单与讲稿本体不漂移。也可手动：node scripts/gen-script-ids.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "lib", "content-data", "media.scripts.generated.ts");
const OUT = join(ROOT, "lib", "content-data", "media.scripts.ids.generated.ts");

let src;
try {
  src = readFileSync(SRC, "utf8");
} catch {
  console.error(`[gen-script-ids] 找不到 ${SRC}，跳过。`);
  process.exit(0);
}

// 顶层 key 形如：  "ch01-KP05-和事件": "..."（两空格缩进 + 引号包裹的 id）。
// 讲稿值为单行 JSON 转义字符串，不含真实换行，故按行匹配安全。
const ids = [];
for (const line of src.split("\n")) {
  const m = /^ {2}"([^"]+)":/.exec(line);
  if (m) ids.push(m[1]);
}

const body = ids.map((id) => `  ${JSON.stringify(id)},`).join("\n");
const out =
  "// [AUTO] 本文件由 scripts/gen-script-ids.mjs 自动生成（prebuild 执行），请勿手动编辑。\n" +
  "// 视频配套讲稿的 id 清单（仅 id，不含正文）。VideoTab 用它判断某视频是否有配套讲稿，\n" +
  "// 从而在不加载 ~388KB 的 media.scripts.generated.ts 本体的前提下决定是否显示「配套讲稿」按钮。\n" +
  "// 讲稿正文仅在用户首次展开时按需 dynamic import。\n" +
  `export const videoScriptIds: string[] = [\n${body}\n];\n`;

writeFileSync(OUT, out, "utf8");
console.log(`[gen-script-ids] 已写入 ${OUT.replace(/\\/g, "/")}（${ids.length} 条讲稿 id）`);
