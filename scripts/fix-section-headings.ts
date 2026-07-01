/**
 * 修复毛概教材 Markdown 的节/目标题层级。
 *
 * 规则：
 *   - ## 第一节 / ## 第二节  保持
 *   - ## 一、 / ## 二、       降级为 ###
 *   - ### 1. / ### 2.        降级为 ####
 *   - 删除孤立的单字/短词标题（通常是噪声）
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");

function fixFile(slug: string): void {
  const filePath = path.join(MD_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return;

  const md = fs.readFileSync(filePath, "utf8");
  const lines = md.split("\n");
  let firstH1Seen = false;

  const out = lines.map((line) => {
    if (/^#\s+/.test(line)) {
      firstH1Seen = true;
      return line;
    }

    if (!firstH1Seen) return line;

    // 删除明显噪声的短标题（非节目标题且 <=3 字符）
    if (/^##\s+/.test(line)) {
      const content = line.replace(/^##\s+/, "").trim();
      if (content.length <= 3 && !/^第[一二三四五六七八九十]+节/.test(content)) {
        return "";
      }
      // "一、" "二、" 等降级为 ###
      if (/^[一二三四五六七八九十]+、/.test(content)) {
        return `### ${content}`;
      }
    }

    if (/^###\s+/.test(line)) {
      const content = line.replace(/^###\s+/, "").trim();
      // "1." "2." 等降级为 ####
      if (/^\d+\.\s*/.test(content)) {
        return `#### ${content}`;
      }
    }

    return line;
  });

  fs.writeFileSync(filePath, out.join("\n").replace(/\n{3,}/g, "\n\n"), "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const files = fs.readdirSync(MD_ROOT).filter((f) => f.endsWith(".md"));
  console.log("=== 修复节/目标题层级 ===");
  for (const f of files) {
    fixFile(f.replace(/\.md$/, ""));
  }
  console.log("\n✓ 完成\n");
}

main();
