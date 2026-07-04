// 一次性脚本：从 Downloads/纲要 的3个docx提取纯文本到 tmp/gangyao/
// 用法：node scripts/content/extract-gangyao-docx.mjs

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const SRC_DIR = "C:\\Users\\AIMFl\\Downloads\\纲要";
const OUT_DIR = path.join(process.cwd(), "tmp", "gangyao");

const FILES = [
  "claude-试卷_三套押题卷_打印版.docx",
  "claude-答案解析与知识点回顾.docx",
  "perplexity-中国近现代史纲要押题冲刺卷合集（三套含答案）.docx",
];

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
  let s = xml
    .replace(/<w:p[ >]/g, "\n<w:p ")
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:br\b[^>]*\/>/g, "\n");
  const parts = [];
  let lastWasP = false;
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

function extractOne(docxName) {
  const srcDocx = path.join(SRC_DIR, docxName);
  if (!fs.existsSync(srcDocx)) {
    console.log(`[skip] 源文件不存在: ${docxName}`);
    return;
  }
  const baseName = docxName.replace(/\.docx$/, "");
  const tmpZip = path.join(os.tmpdir(), `${baseName}_t.zip`);
  const tmpOut = path.join(os.tmpdir(), `${baseName}_t`);
  rmrf(tmpOut);
  fs.copyFileSync(srcDocx, tmpZip);
  try {
    execFileSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", `Expand-Archive -LiteralPath '${tmpZip}' -DestinationPath '${tmpOut}' -Force`],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
  } catch (e) {
    console.log(`[error] 解压失败 ${docxName}: ${e.message}`);
    rmrf(tmpZip);
    return;
  }
  const docXml = path.join(tmpOut, "word", "document.xml");
  if (fs.existsSync(docXml)) {
    const xml = fs.readFileSync(docXml, "utf8");
    const text = xmlToText(xml);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const outPath = path.join(OUT_DIR, `${baseName}.txt`);
    fs.writeFileSync(outPath, text, "utf8");
    console.log(`[ok] ${docxName}: ${text.length} 字 → ${outPath}`);
  }
  rmrf(tmpZip);
  rmrf(tmpOut);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const f of FILES) {
    extractOne(f);
  }
  console.log("\n完成。");
}

main();
