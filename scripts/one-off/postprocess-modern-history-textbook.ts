/**
 * 中国近现代史纲要教材 Markdown 后处理脚本
 *
 * 在 split-modern-history-textbook.ts 之后运行，修复 MinerU 解析常见噪声：
 * 1. 删除章标题残留（## 第N章 xxx）。
 * 2. 优化子标题层级：## 1.xxx → ### 1.xxx，## （1）xxx → #### （1）xxx。
 * 3. 清理连续空行。
 * 4. 修正图片路径为 /images/modern-history/textbook/tb-chXX/ 前缀。
 * 5. 删除过短或含噪声词的标题。
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "modern-history", "textbook");

// 章级主标题（用于识别并删除章标题残留）
const CHAPTER_TITLES: Record<string, string> = {
  "tb-ch00": "导言",
  "tb-ch01": "第一章 进入近代后中华民族的磨难与抗争",
  "tb-ch02": "第二章不同社会力量对国家出路的早期探索",
  "tb-ch03": "第三章 辛亥革命与君主专制制度的终结",
  "tb-ch04": "第四章中国共产党成立和中国革命新局面",
  "tb-ch05": "第五章中国革命的新道路",
  "tb-ch06": "第六章中华民族的抗日战争",
  "tb-ch07": "第七章为建立新中国而奋斗",
  "tb-ch08": "第八章中华人民共和国的成立与中国社会主义建设道路的探索",
  "tb-ch09": "第九章改革开放与中国特色社会主义的开创和发展",
  "tb-ch10": "第十章中国特色社会主义进入新时代",
};

// 噪声词：标题中出现这些则删除
const NOISE_PATTERNS = [
  /^\d+\s*~\s*\d+$/,
  /^\d+\s*\d+$/,
];

function normalizeChinesePunctuation(text: string): string {
  return text
    .replace(/[""]/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function isChapterTitle(line: string, fileId: string): boolean {
  // 匹配 ## 第N章 xxx 或 ## 导言
  const content = line.replace(/^##\s+/, "").trim();
  const chapterTitle = CHAPTER_TITLES[fileId];
  if (!chapterTitle) return false;
  const cleanContent = normalizeChinesePunctuation(content);
  const cleanTitle = normalizeChinesePunctuation(chapterTitle);
  if (cleanContent === cleanTitle) return true;
  if (cleanContent.startsWith(cleanTitle) && cleanContent.length <= cleanTitle.length + 20) return true;
  if (cleanTitle.startsWith(cleanContent) && cleanTitle.length >= cleanContent.length - 6) return true;
  return false;
}

function isNoiseHeading(line: string): boolean {
  const content = line.replace(/^#+\s+/, "").trim();
  if (content.length <= 2 && !/^[一二三四五六七八九十]/.test(content)) {
    return true;
  }
  for (const p of NOISE_PATTERNS) {
    if (p.test(content)) return true;
  }
  return false;
}

function optimizeHeadingLevel(line: string): string {
  // 只处理 ## 开头的标题（H2），H1 保持不变
  const m = line.match(/^(##)\s+(.*)$/);
  if (!m) return line;
  const title = m[2];

  // ## 1.xxx → ### 1.xxx（阿拉伯数字 + 点号，降为 H3；兼容中文无空格格式）
  if (/^\d+\./.test(title)) {
    return `### ${title}`;
  }
  // ## （1）xxx → #### （1）xxx（全角括号 + 阿拉伯数字，降为 H4）
  if (/^（\d+）\s?/.test(title)) {
    return `#### ${title}`;
  }
  // 其他保持 H2
  return line;
}

function fixImagePath(line: string, fileId: string): string {
  // 提取章号：tb-ch01-1 → ch01
  const chapterMatch = fileId.match(/^tb-(ch\d+)/);
  if (!chapterMatch) return line;
  const chapterDir = chapterMatch[1]; // ch01, ch02, ...

  // 修正 ![](images/xxx.jpg) → ![](/images/modern-history/textbook/tb-ch01/xxx.jpg)
  return line.replace(
    /!\[([^\]]*)\]\((?:images?\/)?([^)]+\.(?:jpg|jpeg|png|gif|webp))\)/gi,
    (match, alt, imgName) => {
      // 如果已经是绝对路径 /images/...，不处理
      if (imgName.startsWith("/images/")) return match;
      return `![${alt}](/images/modern-history/textbook/tb-${chapterDir}/${imgName})`;
    }
  );
}

function postprocessFile(filePath: string, fileId: string): void {
  if (!fs.existsSync(filePath)) return;

  let md = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const lines = md.split("\n");
  const outLines: string[] = [];
  let firstH1Seen = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 处理 H1 标题（节标题）
    if (/^#\s+/.test(line)) {
      firstH1Seen = true;
      outLines.push(line);
      continue;
    }

    // 处理 H2 标题
    if (/^##\s+/.test(line)) {
      // 在第一个 H1 之前出现的 H2（章标题残留）删除
      if (!firstH1Seen) {
        continue;
      }
      // 删除章标题残留
      if (isChapterTitle(line, fileId)) {
        continue;
      }
      // 删除噪声标题
      if (isNoiseHeading(line)) {
        continue;
      }
      // 优化子标题层级
      line = optimizeHeadingLevel(line);
    }

    // 修正图片路径
    if (/!\[/.test(line)) {
      line = fixImagePath(line, fileId);
    }

    outLines.push(line);
  }

  md = outLines.join("\n");

  // 清理连续空行（3+ 个换行 → 2 个换行）
  md = md.replace(/\n{3,}/g, "\n\n");

  // 去除首尾空白
  md = md.trim() + "\n";

  fs.writeFileSync(filePath, md, "utf8");
}

function main() {
  console.log("=== 中国近现代史纲要教材 Markdown 后处理 ===\n");

  // 遍历 MD_ROOT 下所有 tb-ch*.md 文件
  const files = fs.readdirSync(MD_ROOT)
    .filter(f => f.startsWith("tb-ch") && f.endsWith(".md"))
    .sort();

  let processed = 0;
  for (const file of files) {
    const filePath = path.join(MD_ROOT, file);
    const fileId = file.replace(/\.md$/, "");
    postprocessFile(filePath, fileId);
    console.log(`  → ${file}`);
    processed++;
  }

  console.log(`\n✓ 后处理完成，共处理 ${processed} 个文件\n`);
}

main();
