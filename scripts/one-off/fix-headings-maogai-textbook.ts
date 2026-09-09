/**
 * 修复毛概教材 Markdown 标题层级：
 * - 把短于 12 字符且非“第 X 节”的二级标题降级为三级标题（通常是知识框/专栏标题）。
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
    if (firstH1Seen && /^##\s+/.test(line)) {
      const content = line.replace(/^##\s+/, "").trim();
      // 保留“第 X 节”和“第 X 章”作为二级标题
      if (/^第[一二三四五六七八九十]+节/.test(content) || content.length > 12) {
        return line;
      }
      // 其他较短的二级标题降级
      return `### ${content}`;
    }
    return line;
  });

  fs.writeFileSync(filePath, out.join("\n"), "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const files = fs.readdirSync(MD_ROOT).filter((f) => f.endsWith(".md"));
  console.log("=== 修复标题层级 ===");
  for (const f of files) {
    fixFile(f.replace(/\.md$/, ""));
  }
  console.log("\n✓ 完成\n");
}

main();
