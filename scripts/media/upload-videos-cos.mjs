// 将 public/media/videos/ 下的所有 MP4 上传到腾讯云 COS。
//
// 前置条件：
//   1. npm i -g cos-nodejs-sdk-v5  或  pnpm add -g cos-nodejs-sdk-v5
//   2. 设置环境变量：
//      COS_SECRET_ID=AKIDxxxxxxxx
//      COS_SECRET_KEY=xxxxxxxx
//      COS_BUCKET=your-bucket-1250000000   (格式: name-appid)
//      COS_REGION=ap-guangzhou
//
// 用法：
//   node scripts/media/upload-videos-cos.mjs              # 上传全部
//   node scripts/media/upload-videos-cos.mjs --dry-run     # 仅预览
//   node scripts/media/upload-videos-cos.mjs --prefix ch01  # 仅上传 ch01 目录
//
// 上传后 COS 路径与本地一致：media/videos/<chapterId>/<id>.mp4
// 设置 NEXT_PUBLIC_VIDEO_CDN_BASE=https://<bucket>.cos.<region>.myqcloud.com 即可在前端使用。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VIDEOS_DIR = path.join(ROOT, "public", "media", "videos");
const DRY_RUN = process.argv.includes("--dry-run");
const PREFIX_ARG = process.argv.find((a) => a.startsWith("--prefix="));
const PREFIX = PREFIX_ARG ? PREFIX_ARG.split("=")[1] : null;

const SECRET_ID = process.env.COS_SECRET_ID;
const SECRET_KEY = process.env.COS_SECRET_KEY;
const BUCKET = process.env.COS_BUCKET;
const REGION = process.env.COS_REGION;

if (!DRY_RUN && (!SECRET_ID || !SECRET_KEY || !BUCKET || !REGION)) {
  console.error("缺少 COS 环境变量。请设置 COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION");
  console.error("或使用 --dry-run 预览。");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.mp4$/i.test(entry.name)) out.push(full);
  }
  return out;
}

if (!fs.existsSync(VIDEOS_DIR)) {
  console.error("找不到视频目录：", VIDEOS_DIR);
  process.exit(1);
}

let mp4s = walk(VIDEOS_DIR);
if (PREFIX) {
  mp4s = mp4s.filter((f) => f.includes(path.sep + PREFIX + path.sep));
}

console.log(`发现 ${mp4s.length} 个 mp4 文件${DRY_RUN ? "（dry-run 模式）" : ""}。`);

if (DRY_RUN) {
  for (const f of mp4s) {
    const key = "media/videos/" + path.relative(VIDEOS_DIR, f).replace(/\\/g, "/");
    const size = (fs.statSync(f).size / 1024 / 1024).toFixed(1);
    console.log(`  [DRY] ${key}  (${size} MB)`);
  }
  const total = mp4s.reduce((s, f) => s + fs.statSync(f).size, 0);
  console.log(`\n总计：${(total / 1024 / 1024).toFixed(1)} MB`);
  process.exit(0);
}

const COS = (await import("cos-nodejs-sdk-v5")).default;
const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
});

async function uploadOne(localPath, key) {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: fs.createReadStream(localPath),
        ContentType: "video/mp4",
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(data);
      },
    );
  });
}

let ok = 0;
let fail = 0;
for (const f of mp4s) {
  const key = "media/videos/" + path.relative(VIDEOS_DIR, f).replace(/\\/g, "/");
  try {
    await uploadOne(f, key);
    ok++;
    console.log(`  ✓ ${key}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${key}: ${e.message}`);
  }
}

console.log(`\n完成：成功 ${ok}、失败 ${fail}。`);
console.log(`\n在 EdgeOne 构建环境变量中设置：`);
console.log(`  NEXT_PUBLIC_VIDEO_CDN_BASE=https://${BUCKET}.cos.${REGION}.myqcloud.com`);
