// 从有机化学智能纪要 docx 中提取纯文本（飞书智能纪要正文）到
// content/chemistry/summary/_raw/{sumId}.txt，供纪要整理子智能体读取。
//
// docx 正文在 word/document.xml。本脚本零依赖：复制为 ASCII 临时 .zip，
// PowerShell 解压，读 document.xml，按 <w:p> 分段、提取 <w:t> 文本。
//
// 用法：node scripts/extract-docx-text.mjs [sum-01]

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const SRC_DIR = "D:\\飞书文档保存\\有机化学课程及录音";
const OUT_ROOT = path.join(process.cwd(), "content", "chemistry", "summary", "_raw");

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

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

function xmlToText(xml) {
  // 段落分隔、制表、换行
  let s = xml
    .replace(/<w:p[ >]/g, "\n<w:p ")
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:br\b[^>]*\/>/g, "\n");
  // 提取所有 <w:t ...>文本</w:t>
  const parts = [];
  let lastWasP = false;
  // 逐字符不现实，用正则按出现顺序处理 <w:p 与 <w:t>
  const tokenRe = /<w:p[ >]|<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  let m;
  while ((m = tokenRe.exec(s)) !== null) {
    if (m[0].startsWith("<w:p")) {
      if (!lastWasP) parts.push("\n");
      lastWasP = true;
    } else {
      parts.push(decodeEntities(m[1]));
      lastWasP = false;
    }
  }
  return parts
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function extractOne(sumId, docxName) {
  const srcDocx = path.join(SRC_DIR, docxName);
  if (!fs.existsSync(srcDocx)) {
    console.log(`[skip] ${sumId}: 源文件不存在`);
    return 0;
  }
  const tmpZip = path.join(os.tmpdir(), `${sumId}_t.zip`);
  const tmpOut = path.join(os.tmpdir(), `${sumId}_t`);
  rmrf(tmpOut);
  fs.copyFileSync(srcDocx, tmpZip);
  try {
    execFileSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", `Expand-Archive -LiteralPath '${tmpZip}' -DestinationPath '${tmpOut}' -Force`],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
  } catch (e) {
    console.log(`[error] ${sumId}: 解压失败 ${e.message}`);
    rmrf(tmpZip);
    return 0;
  }
  const docXml = path.join(tmpOut, "word", "document.xml");
  let len = 0;
  if (fs.existsSync(docXml)) {
    const xml = fs.readFileSync(docXml, "utf8");
    const text = xmlToText(xml);
    fs.mkdirSync(OUT_ROOT, { recursive: true });
    fs.writeFileSync(path.join(OUT_ROOT, `${sumId}.txt`), text, "utf8");
    len = text.length;
  }
  rmrf(tmpZip);
  rmrf(tmpOut);
  console.log(`[ok] ${sumId}: 提取正文 ${len} 字 → summary/_raw/${sumId}.txt`);
  return len;
}

function main() {
  const arg = process.argv[2];
  const ids = arg ? [arg] : Object.keys(SUMMARIES);
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  let total = 0;
  for (const sumId of ids) {
    if (!SUMMARIES[sumId]) { console.log(`[skip] 未知 ${sumId}`); continue; }
    total += extractOne(sumId, SUMMARIES[sumId]);
  }
  console.log(`\n完成：${ids.length} 讲，共 ${total} 字。`);
}

main();
