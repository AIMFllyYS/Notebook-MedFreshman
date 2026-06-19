// 为 public/media/videos 下的每个 mp4 抽取一帧静态封面（poster），
// 输出到 public/media/posters 下、保持相同子路径、扩展名改 .jpg。
//
// 约定（与前端 derivePoster 对应，渲染安全、无需改动自动生成的 media.generated.ts）：
//   /media/videos/<rel>.mp4  →  /media/posters/<rel>.jpg
//
// 用法：node scripts/gen-posters.mjs [--force]
// 依赖：系统 ffmpeg 在 PATH 中。
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VIDEOS_DIR = path.join(ROOT, "public", "media", "videos");
const POSTERS_DIR = path.join(ROOT, "public", "media", "posters");
const FORCE = process.argv.includes("--force");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.mp4$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function genOne(mp4, seek) {
  const rel = path.relative(VIDEOS_DIR, mp4).replace(/\.mp4$/i, ".jpg");
  const outFile = path.join(POSTERS_DIR, rel);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  // 在 -i 之前 -ss 做快速 seek；抽 1 帧，缩放到宽 480（高自适应、保持偶数），jpg 质量 5。
  execFileSync(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-ss", String(seek),
      "-i", mp4,
      "-frames:v", "1",
      "-vf", "scale=480:-2",
      "-q:v", "5",
      outFile,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  return outFile;
}

if (!fs.existsSync(VIDEOS_DIR)) {
  console.error("找不到视频目录：", VIDEOS_DIR);
  process.exit(1);
}

const mp4s = walk(VIDEOS_DIR);
console.log(`发现 ${mp4s.length} 个 mp4，开始生成封面…`);
let made = 0, skipped = 0, failed = 0;

for (const mp4 of mp4s) {
  const rel = path.relative(VIDEOS_DIR, mp4).replace(/\.mp4$/i, ".jpg");
  const outFile = path.join(POSTERS_DIR, rel);
  if (!FORCE && fs.existsSync(outFile)) { skipped++; continue; }
  try {
    // 优先取第 1 秒（避开纯黑开场）；若产物为空/失败则回退到第 0 帧。
    genOne(mp4, 1.0);
    if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 256) genOne(mp4, 0);
    made++;
  } catch {
    try { genOne(mp4, 0); made++; }
    catch (e2) { failed++; console.warn("失败：", rel, String(e2).slice(0, 120)); }
  }
}

console.log(`完成：生成 ${made}、跳过 ${skipped}、失败 ${failed}。输出目录 ${POSTERS_DIR}`);
