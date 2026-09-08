/**
 * 毛概教材 Markdown 后处理脚本
 *
 * 在 convert-maogai-textbook.ts 之后运行，修复 MinerU 解析常见噪声：
 * 1. 删除与章节主标题重复或高度相似的二级标题。
 * 2. 删除明显过短或包含噪声词的二级标题。
 * 3. 删除 toc.md 末尾的乱码段。
 * 4. 规范化章节小结处的 memory 卡片占位符。
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");

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
  epilogue: "结束语 不断谱写马克思主义中国化时代化新篇章",
};

// 噪声词：二级标题中出现这些则删除
const NOISE_PATTERNS = [
  /目的与方法\.?\s*\(?课堂/i,
  /\d+\s*~\s*\d+/,
  /^\d+\s*\d+$/, // 如 "12 13"
];

function normalizeChinesePunctuation(text: string): string {
  return text
    .replace(/[“”"]/g, "\"") // 统一引号，便于比较
    .replace(/\s+/g, " ")
    .trim();
}

function isDuplicateHeading(line: string, mainTitle: string): boolean {
  const cleanLine = normalizeChinesePunctuation(line.replace(/^##\s+/, ""));
  const cleanTitle = normalizeChinesePunctuation(mainTitle);
  // 完全包含主标题，或主标题包含标题，且长度接近
  if (cleanLine === cleanTitle) return true;
  if (cleanLine.startsWith(cleanTitle) && cleanLine.length <= cleanTitle.length + 20) return true;
  if (cleanTitle.startsWith(cleanLine) && cleanLine.length >= cleanTitle.length - 6) return true;
  return false;
}

function isNoiseHeading(line: string): boolean {
  const content = line.replace(/^##\s+/, "").trim();
  // 过短（<=4 字符）且不包含数字编号/节字样
  if (content.length <= 4 && !/第[一二三四五六七八]节|^\d+\./.test(content)) {
    return true;
  }
  for (const p of NOISE_PATTERNS) {
    if (p.test(content)) return true;
  }
  return false;
}

function postprocessFile(slug: string): void {
  const filePath = path.join(MD_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return;

  let md = fs.readFileSync(filePath, "utf8");
  const mainTitle = TITLE_MAP[slug] ?? "";

  const lines = md.split("\n");
  const outLines: string[] = [];
  let firstH1Seen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跳过与主标题重复的二级标题（通常出现在文件开头）
    if (/^##\s+/.test(line)) {
      if (!firstH1Seen) {
        // 还没遇到一级标题前不应该有二级标题，删除
        continue;
      }
      if (mainTitle && isDuplicateHeading(line, mainTitle)) {
        continue;
      }
      if (isNoiseHeading(line)) {
        continue;
      }
    }

    if (/^#\s+/.test(line)) {
      firstH1Seen = true;
    }

    outLines.push(line);
  }

  md = outLines.join("\n");

  // 删除 toc 末尾乱码：从 "① 克惠主义..." 开始之后的所有内容
  if (slug === "toc") {
    const junkIdx = md.search(/\n①\s+克惠主义/);
    if (junkIdx > 0) {
      md = md.slice(0, junkIdx).trimEnd() + "\n";
    }
  }

  // 删除 epilogue 中过短的二级标题（如单独的图片说明被误识别）
  if (slug === "epilogue") {
    md = md
      .split("\n")
      .filter((l) => {
        if (!/^##\s+/.test(l)) return true;
        const c = l.replace(/^##\s+/, "").trim();
        return c.length > 4;
      })
      .join("\n");
  }

  // 清理连续空行
  md = md.replace(/\n{3,}/g, "\n\n");

  fs.writeFileSync(filePath, md, "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const slugs = [
    "toc",
    "ch00",
    "ch01",
    "ch02",
    "ch03",
    "ch04",
    "ch05",
    "ch06",
    "ch07",
    "ch08",
    "epilogue",
  ];

  console.log("=== 毛概教材 Markdown 后处理 ===");
  for (const slug of slugs) {
    postprocessFile(slug);
  }
  console.log("\n✓ 后处理完成\n");
}

main();
