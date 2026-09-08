/**
 * 中国近现代史纲要教材 · 合并前后 PDF + 切分小节脚本
 *
 * 用法：
 *   npx tsx scripts/one-off/split-modern-history-textbook.ts
 *
 * 输入：
 *   scripts/temp/modern-history-textbook/raw/{slug}/full.md  （MinerU 解析产出）
 *
 * 产出：
 *   content/modern-history/textbook/tb-ch{N}-{i}.md          （切分后的小节文件）
 *   public/images/modern-history/textbook/tb-ch{N}/*.jpg     （合并的图片资源）
 *   scripts/temp/modern-history-textbook/split-map.json       （id/title/file 映射）
 */

import fs from "fs";
import path from "path";

const RAW_DIR = path.resolve(process.cwd(), "scripts/temp/modern-history-textbook/raw");
const OUT_DIR = path.resolve(process.cwd(), "content/modern-history/textbook");
const IMG_DIR = path.resolve(process.cwd(), "public/images/modern-history/textbook");
const MAP_PATH = path.resolve(process.cwd(), "scripts/temp/modern-history-textbook/split-map.json");

// 章节定义：章号 → [源 slug 列表]（前后 PDF 顺序合并）
const CHAPTERS: Record<string, string[]> = {
  "ch00": ["ch00"],
  "ch01": ["ch01-front", "ch01-back"],
  "ch02": ["ch02-front", "ch02-back"],
  "ch03": ["ch03"],
  "ch04": ["ch04-front", "ch04-back"],
  "ch05": ["ch05"],
  "ch06": ["ch06-front", "ch06-back"],
  "ch07": ["ch07"],
  "ch08": ["ch08"],
  "ch09": ["ch09-front", "ch09-back"],
  "ch10": ["ch10"],
};

// 输出文件名前缀
const FILE_PREFIX = "tb-";

type Section = {
  chapterId: string;
  index: number;
  id: string;
  title: string;
  body: string;
  memory?: string;
};

function chineseNum(n: number): string {
  const map = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (n <= 10) return map[n];
  if (n === 11) return "十一";
  if (n === 12) return "十二";
  return String(n);
}

function extractMemoryBlock(text: string): { body: string; memory?: string } {
  const lines = text.split("\n");
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^:{3,4}memory\{/.test(lines[i])) {
      start = i;
    } else if (start !== -1 && /^\s*:{3}\s*$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (start === -1) return { body: text };

  const rawMemory = lines.slice(start, end + 1).join("\n");
  const fixedMemory = rawMemory
    .replace(/^:{4}memory\{/, ":::memory{")
    .replace(/^[\s\-]*:{3}\s*$/m, ":::");
  const bodyLines = [
    ...lines.slice(0, start),
    ...lines.slice(end + 1),
  ];
  return { body: bodyLines.join("\n").trimEnd(), memory: fixedMemory };
}

function normalizeHeadings(
  sectionLines: string[],
  sectionLevel: number
): string[] {
  const minInnerLevel = sectionLevel + 1;
  return sectionLines.map((line) => {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (!m) return line;
    const level = m[1].length;
    const title = m[2];
    let effectiveLevel = level;
    if (effectiveLevel <= sectionLevel) {
      effectiveLevel = sectionLevel + 1;
    }
    const newLevel = effectiveLevel - (sectionLevel - 1);
    const hashes = "#".repeat(Math.min(Math.max(newLevel, 1), 6));
    return `${hashes} ${title}`;
  });
}

function mergeChapterContent(slugs: string[]): string {
  const parts: string[] = [];
  for (const slug of slugs) {
    const mdPath = path.join(RAW_DIR, slug, "full.md");
    if (!fs.existsSync(mdPath)) {
      console.warn(`  ⚠ 文件不存在: ${mdPath}`);
      continue;
    }
    const content = fs.readFileSync(mdPath, "utf8").replace(/\r\n/g, "\n").trim();
    parts.push(content);
  }
  return parts.join("\n\n");
}

function copyImages(slugs: string[], chapterId: string): void {
  const destImgDir = path.join(IMG_DIR, `${FILE_PREFIX}${chapterId}`);
  if (!fs.existsSync(destImgDir)) {
    fs.mkdirSync(destImgDir, { recursive: true });
  }
  let count = 0;
  for (const slug of slugs) {
    const srcImgDir = path.join(RAW_DIR, slug, "images");
    if (!fs.existsSync(srcImgDir) || !fs.statSync(srcImgDir).isDirectory()) {
      continue;
    }
    for (const file of fs.readdirSync(srcImgDir)) {
      const srcPath = path.join(srcImgDir, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, path.join(destImgDir, file));
        count++;
      }
    }
  }
  if (count > 0) {
    console.log(`    → ${count} images → ${destImgDir}`);
  }
}

function splitChapter(chapterId: string, slugs: string[]): Section[] {
  const raw = mergeChapterContent(slugs);
  if (!raw) {
    throw new Error(`No content for ${chapterId} from slugs: ${slugs.join(", ")}`);
  }

  const isIntro = chapterId === "ch00";
  // MinerU 解析结果：所有标题都是 H2。
  // 导言混合 "## 一、" 和 "## （二）" 格式；正文统一 "## （一）" 格式。
  const sectionRegex = isIntro
    ? /^(#{2})\s+([一二三四五六七八九十]+、.*|（[一二三四五六七八九十]+）\s*.*)$/gm
    : /^(#{2})\s+(（[一二三四五六七八九十]+）\s*.*)$/gm;
  const sectionLevel = 2;

  const matches: { level: number; title: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRegex.exec(raw)) !== null) {
    matches.push({ level: m[1].length, title: m[2], index: m.index });
  }

  if (matches.length === 0) {
    console.warn(`  ⚠ No sections found in ${chapterId}, trying fallback regex...`);
    // 回退：匹配任何 H2 + 中文编号格式
    const fallbackRegex = /^(#{2})\s+([一二三四五六七八九十]+、.*|（[一二三四五六七八九十]+）\s*.*)$/gm;
    while ((m = fallbackRegex.exec(raw)) !== null) {
      matches.push({ level: m[1].length, title: m[2], index: m.index });
    }
  }

  if (matches.length === 0) {
    throw new Error(`No sections found in ${chapterId} after fallback`);
  }

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : raw.length;
    const chunk = raw.slice(start, end).trim();
    const { body, memory } = extractMemoryBlock(chunk);

    const sectionLines = body.split("\n");
    const titleLine = sectionLines[0];
    const titleMatch = titleLine.match(/^#{1,6}\s+(.*)$/);
    const title = titleMatch ? titleMatch[1] : titleLine;
    const normalizedLines = normalizeHeadings(sectionLines, sectionLevel);
    normalizedLines[0] = `# ${title}`;

    const cleanBody = normalizedLines.join("\n").trim();

    sections.push({
      chapterId,
      index: i + 1,
      id: `${chapterId}-${i + 1}`,
      title,
      body: cleanBody,
      memory,
    });
  }

  return sections;
}

function main() {
  // 确保输出目录存在
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MAP_PATH), { recursive: true });

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`ERROR: RAW_DIR not found: ${RAW_DIR}`);
    console.error("请先执行: npx tsx scripts/one-off/process-modern-history-textbook.ts");
    process.exit(1);
  }

  console.log("=== 中国近现代史纲要教材 · 合并 + 切分 ===");
  console.log(`输入目录: ${RAW_DIR}`);
  console.log(`输出目录: ${OUT_DIR}\n`);

  const allSections: Section[] = [];

  for (const chapterId of Object.keys(CHAPTERS)) {
    const slugs = CHAPTERS[chapterId];
    console.log(`--- ${chapterId} (slugs: ${slugs.join(" + ")}) ---`);

    try {
      const sections = splitChapter(chapterId, slugs);
      allSections.push(...sections);

      // 复制图片
      copyImages(slugs, chapterId);

      // 写入小节文件
      for (const sec of sections) {
        const outPath = path.join(OUT_DIR, `${FILE_PREFIX}${sec.id}.md`);
        let content = sec.body;
        if (sec.memory) {
          content += "\n\n" + sec.memory;
        }
        fs.writeFileSync(outPath, content + "\n", "utf8");
        console.log(`  → ${FILE_PREFIX}${sec.id}.md  (${sec.title})`);
      }
    } catch (e) {
      console.error(`  ✗ ${chapterId}: ${(e as Error).message}`);
    }
  }

  // 写入映射表
  const splitMap = allSections.map((s) => ({
    id: `${FILE_PREFIX}${s.id}`,
    chapterId: s.chapterId,
    index: s.index,
    title: s.title,
    file: `${FILE_PREFIX}${s.id}.md`,
    hasMemory: !!s.memory,
  }));
  fs.writeFileSync(MAP_PATH, JSON.stringify(splitMap, null, 2), "utf8");

  console.log(`\n=== 完成 ===`);
  console.log(`切分 ${allSections.length} 个小节`);
  console.log(`映射表: ${MAP_PATH}`);
  console.log(`输出目录: ${OUT_DIR}\n`);
}

main();
