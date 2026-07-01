/**
 * 清理毛概教材 Markdown 中的孤立短词噪声行。
 *
 * 删除同时满足以下条件的行：
 * 1. 内容长度 <= 6 个字符（去除标点后 <= 4 个字符）
 * 2. 不是 Markdown 标题、列表、引用
 * 3. 上下行均为空行或同为噪声行
 * 4. 不是数字页码
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");

function isNoiseLine(line: string, prev: string | undefined, next: string | undefined): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // 保留标题、列表、引用、代码
  if (/^#{1,6}\s+/.test(trimmed)) return false;
  if (/^[-*+]>?\s+/.test(trimmed)) return false;
  if (/^>\s+/.test(trimmed)) return false;
  if (/^```/.test(trimmed)) return false;

  // 去除标点后的有效内容长度
  const effective = trimmed.replace(/[\s，。、；：！？.,;:!?""''（）()\[\]【】]/g, "");
  if (effective.length > 4) return false;

  // 上下行至少有一个为空
  const prevEmpty = !prev || prev.trim() === "";
  const nextEmpty = !next || next.trim() === "";
  if (!prevEmpty && !nextEmpty) return false;

  // 排除纯数字页码
  if (/^\d+$/.test(trimmed)) return false;

  return true;
}

function cleanupFile(slug: string): void {
  const filePath = path.join(MD_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isNoiseLine(line, lines[i - 1], lines[i + 1])) {
      continue;
    }
    out.push(line);
  }

  fs.writeFileSync(filePath, out.join("\n").replace(/\n{3,}/g, "\n\n"), "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const files = fs.readdirSync(MD_ROOT).filter((f) => f.endsWith(".md"));
  console.log("=== 清理孤立噪声行 ===");
  for (const f of files) {
    cleanupFile(f.replace(/\.md$/, ""));
  }
  console.log("\n✓ 完成\n");
}

main();
