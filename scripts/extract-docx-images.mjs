// 从有机化学智能纪要 docx 中提取内嵌图片到 public/images/chemistry/{sumId}/
//
// docx 本质是 zip，图片位于 word/media/。本脚本零依赖：
// 把每个 docx 复制为 ASCII 临时 .zip（避开中文路径传给 PowerShell），
// 用 PowerShell Expand-Archive 解压，再把 word/media/* 复制到输出目录。
//
// 用法：
//   node scripts/extract-docx-images.mjs            # 处理全部
//   node scripts/extract-docx-images.mjs sum-01     # 只处理某一讲（测试用）
//
// 输出：public/images/chemistry/{sumId}/{sumId}-img{N}{ext}
//       并在结尾打印「sumId → 图片清单」供纪要子智能体定位。

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const SRC_DIR = "D:\\飞书文档保存\\有机化学课程及录音";
const OUT_ROOT = path.join(process.cwd(), "public", "images", "chemistry");

// sumId → 源 docx 文件名（与 content/organic-chemistry-detail.ts 的 organicChemistrySummaries 保持一致；第15讲无 docx）
const SUMMARIES = {
  "sum-01": "有机化学-第一节-绪论 2026年3月2日 (1).docx",
  "sum-02": "智能纪要：有机化学-第二节-绪论结束兼初步有机命名 2026年3月4日.docx",
  "sum-03": "智能纪要：有机化学-第三节-命名 2026年3月9日.docx",
  "sum-04": "智能纪要：有机化学-第四节-分子间作用力 2026年3月11日.docx",
  "sum-05": "智能纪要：有机化学-第五节-烷烃01 2026年3月16日.docx",
  "sum-06": "智能纪要：有机化学-第六节 2026年3月18日.docx",
  "sum-07": "智能纪要：有机化学-第七节 2026年3月23日.docx",
  "sum-08": "智能纪要：有机化学-第8节 2026年3月25日.docx",
  "sum-09": "智能纪要：有机化学-第九节 2026年3月30日.docx",
  "sum-10": "智能纪要：有机化学-第10节 2026年4月1日.docx",
  "sum-11": "智能纪要：有机化学-第11节 2026年4月8日.docx",
  "sum-12": "智能纪要：有机化学-第12节 2026年4月13日.docx",
  "sum-13": "智能纪要：有机化学第13节多章节知识点讲解 2026年4月15日.docx",
  "sum-14": "智能纪要：有机化学第14节卤代烃亲核取代反应分析 2026年4月20日.docx",
  "sum-16": "智能纪要：有机化学-第16节 2026年4月27日.docx",
  "sum-17": "智能纪要：有机化学-第17节 2026年4月29日.docx",
  "sum-18": "智能纪要：有机化学-第19节 2026年5月6日.docx",
  "sum-19": "智能纪要：有机化学第21节 2026年5月13日.docx",
  "sum-20": "智能纪要：有机化学第25节最后一节 2026年6月1日.docx",
};

// 自然排序（image1, image2, …, image10）
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function extractOne(sumId, docxName) {
  const srcDocx = path.join(SRC_DIR, docxName);
  if (!fs.existsSync(srcDocx)) {
    console.log(`[skip] ${sumId}: 源文件不存在 ${docxName}`);
    return { sumId, count: 0, images: [] };
  }

  const tmpZip = path.join(os.tmpdir(), `${sumId}.zip`);
  const tmpOut = path.join(os.tmpdir(), `${sumId}_x`);
  rmrf(tmpOut);
  fs.copyFileSync(srcDocx, tmpZip); // 中文路径由 Node 处理；PowerShell 只见 ASCII 临时路径

  try {
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Expand-Archive -LiteralPath '${tmpZip}' -DestinationPath '${tmpOut}' -Force`,
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
  } catch (e) {
    console.log(`[error] ${sumId}: 解压失败 — ${e.message}`);
    rmrf(tmpZip);
    return { sumId, count: 0, images: [] };
  }

  const mediaDir = path.join(tmpOut, "word", "media");
  const images = [];
  if (fs.existsSync(mediaDir)) {
    const files = fs.readdirSync(mediaDir).sort(naturalSort);
    const outDir = path.join(OUT_ROOT, sumId);
    rmrf(outDir);
    fs.mkdirSync(outDir, { recursive: true });
    let n = 1;
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      // 只保留位图/矢量图，跳过 emf/wmf 等不可在 web 直接显示的格式（如有需要可后续转换）
      if (![".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".webp"].includes(ext)) continue;
      const outName = `${sumId}-img${n}${ext}`;
      fs.copyFileSync(path.join(mediaDir, f), path.join(outDir, outName));
      images.push(`/images/chemistry/${sumId}/${outName}`);
      n++;
    }
  }

  rmrf(tmpZip);
  rmrf(tmpOut);
  console.log(`[ok] ${sumId}: 提取 ${images.length} 张图片 → public/images/chemistry/${sumId}/`);
  return { sumId, count: images.length, images };
}

function main() {
  const arg = process.argv[2];
  const ids = arg ? [arg] : Object.keys(SUMMARIES);
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  const report = [];
  for (const sumId of ids) {
    const docxName = SUMMARIES[sumId];
    if (!docxName) {
      console.log(`[skip] 未知 sumId: ${sumId}`);
      continue;
    }
    report.push(extractOne(sumId, docxName));
  }

  console.log("\n================ 图片清单 ================");
  for (const r of report) {
    console.log(`\n## ${r.sumId} (${r.count} 张)`);
    r.images.forEach((img, i) => console.log(`  ${i + 1}. ${img}`));
  }
  const total = report.reduce((s, r) => s + r.count, 0);
  console.log(`\n总计：${report.length} 讲，${total} 张图片。`);
}

main();
