/**
 * 毛概教材 raw markdown → 项目格式转换脚本
 *
 * 用法：
 *   npx tsx scripts/convert-maogai-textbook.ts
 *
 * 输入：
 *   scripts/temp/maogai-textbook/raw/{slug}/full.md
 *   scripts/temp/maogai-textbook/raw/{slug}/images/*
 *
 * 产出：
 *   content/maogai/textbook/{slug}.md
 *   public/images/maogai/textbook/{slug}/*
 */

import * as fs from "node:fs";
import * as path from "node:path";

const RAW_ROOT = path.join(process.cwd(), "scripts", "temp", "maogai-textbook", "raw");
const OUT_MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");
const OUT_IMG_ROOT = path.join(process.cwd(), "public", "images", "maogai", "textbook");

const TITLE_MAP: Record<string, string> = {
  toc: "目录",
  ch00: "导论 马克思主义中国化时代化的历史进程与理论成果",
  ch01: "第一章 毛泽东思想及其历史地位",
  ch02: "第二章 新民主主义革命理论",
  ch03: "第三章 社会主义改造理论",
  ch04: "第四章 社会主义建设道路初步探索的理论成果",
  ch05: "第五章 中国特色社会主义理论体系的形成发展",
  ch06: "第六章 邓小平理论",
  ch07: "第七章 “三个代表”重要思想",
  ch08: "第八章 科学发展观",
  epilogue: "后记与结语",
};

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 规范化 Markdown：
 * 1. 统一换行符为 LF。
 * 2. 移除页眉页脚类噪声行（如纯数字页码、重复书名）。
 * 3. 修正图片相对路径指向 public 目录。
 * 4. 确保章节主标题存在。
 * 5. 统一小节标题层级。
 */
function normalizeMarkdown(slug: string, md: string): string {
  const title = TITLE_MAP[slug] ?? slug;

  // 统一换行
  let out = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 图片路径：MinerU 原始路径通常为 images/xxx.png
  out = out.replace(
    /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
    `![$1](/images/maogai/textbook/${slug}/$2)`,
  );

  // 移除孤立的页码行（单独一行纯数字，前后都是空行）
  out = out.replace(/\n\n\s*\d+\s*\n\n/g, "\n\n");

  // 如果正文没有以 # 开头的一级标题，则在开头插入章节标题
  const firstHash = out.trimStart().indexOf("#");
  const hasTopLevelTitle = firstHash === 0 || (firstHash > 0 && out.trimStart().slice(0, firstHash).trim() === "");
  if (!hasTopLevelTitle || !/^#\s+/.test(out.trimStart().split("\n")[0])) {
    out = `# ${title}\n\n${out}`;
  } else {
    // 如果已有标题，确保它匹配我们期望的章节名
    const lines = out.split("\n");
    const firstLine = lines[0];
    const match = firstLine.match(/^#\s+(.*)$/);
    if (match && !match[1].includes(title.replace(/^第[一二三四五六七八]章\s+/, "").slice(0, 8))) {
      // 若标题与预期严重不符，替换为规范标题
      lines[0] = `# ${title}`;
      out = lines.join("\n");
    }
  }

  // 标题降级规范化：保证只有一条 #，内部节用 ##，目用 ###
  // 仅简单处理：把除了首行之外的 `# ` 替换为 `## `，若出现 `## ` 则保持
  const lines = out.split("\n");
  let seenFirstH1 = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^#\s+/.test(lines[i])) {
      if (!seenFirstH1) {
        seenFirstH1 = true;
      } else {
        lines[i] = lines[i].replace(/^#\s+/, "## ");
      }
    }
  }
  out = lines.join("\n");

  // 尾部追加本章小结占位（转换脚本只加框架，内容由人工或后续步骤填充）
  if (!slug.startsWith("toc") && slug !== "epilogue") {
    const summaryHeader = "\n\n## 本章小结\n\n";
    if (!out.includes("## 本章小结")) {
      out += summaryHeader;
      out += ":::memory{label=本章核心要点}\n";
      out += "- [ ] （请根据教材内容补充本章核心要点）\n";
      out += ":::\n";
    }
  }

  return out;
}

function convertSlug(slug: string): void {
  const rawDir = path.join(RAW_ROOT, slug);
  const rawMdPath = path.join(rawDir, "full.md");

  if (!fs.existsSync(rawMdPath)) {
    console.warn(`⚠ 跳过 ${slug}: ${rawMdPath} 不存在`);
    return;
  }

  console.log(`\n处理 ${slug}...`);

  // 读取并规范化 markdown
  const rawMd = fs.readFileSync(rawMdPath, "utf8");
  const normalizedMd = normalizeMarkdown(slug, rawMd);

  // 写出 markdown
  ensureDir(OUT_MD_ROOT);
  const outMdPath = path.join(OUT_MD_ROOT, `${slug}.md`);
  fs.writeFileSync(outMdPath, normalizedMd, "utf8");
  console.log(`  → ${outMdPath}`);

  // 迁移图片
  const rawImagesDir = path.join(rawDir, "images");
  if (fs.existsSync(rawImagesDir)) {
    const outImagesDir = path.join(OUT_IMG_ROOT, slug);
    copyDirRecursive(rawImagesDir, outImagesDir);
    const count = fs.readdirSync(outImagesDir).length;
    console.log(`  → ${count} images → ${outImagesDir}`);
  }
}

function main() {
  if (!fs.existsSync(RAW_ROOT)) {
    console.error(`ERROR: Raw directory not found: ${RAW_ROOT}`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(RAW_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .sort((a, b) => {
      // 按 toc, ch00, ch01, ..., ch08, epilogue 排序
      const order = ["toc", "ch00", "ch01", "ch02", "ch03", "ch04", "ch05", "ch06", "ch07", "ch08", "epilogue"];
      return order.indexOf(a) - order.indexOf(b);
    });

  if (slugs.length === 0) {
    console.error("ERROR: No raw markdown directories found");
    process.exit(1);
  }

  console.log(`=== 毛概教材 Markdown 转换 ===`);
  console.log(`发现 ${slugs.length} 个章节原始文件`);

  for (const slug of slugs) {
    convertSlug(slug);
  }

  console.log("\n✓ 转换完成");
  console.log(`Markdown: ${OUT_MD_ROOT}`);
  console.log(`Images: ${OUT_IMG_ROOT}\n`);
}

main();
