/**
 * 从毛概教材各章末尾提取课后思考题，生成例题文件。
 *
 * 用法：
 *   npx tsx scripts/generate-maogai-examples.ts
 *
 * 输入：
 *   content/maogai/textbook/ch{NN}.md
 *
 * 产出：
 *   content/examples/maogai/textbook/ch{NN}/ex{NN}.md
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");
const EXAMPLE_ROOT = path.join(process.cwd(), "content", "examples", "maogai", "textbook");

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function extractQuestions(md: string): string[] {
  const questions: string[] = [];
  const lines = md.split("\n");
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s+(.+)[?？]$/);
    if (m) {
      questions.push(m[2].trim());
    }
  }
  return questions;
}

function sanitizeFileName(q: string, idx: number): string {
  // 取前 20 个字符作为文件名，避免过长
  const short = q
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 30)
    .replace(/^_+|_+$/g, "");
  return `ex${String(idx + 1).padStart(2, "0")}_${short}`;
}

function generateExampleFile(itemId: string, idx: number, question: string): void {
  const outDir = path.join(EXAMPLE_ROOT, itemId);
  ensureDir(outDir);

  const fileName = sanitizeFileName(question, idx);
  const filePath = path.join(outDir, `${fileName}.md`);

  const content = `:::example{label=课后思考题 ${idx + 1}：${question}}
**题目**：${question}

**参考答案要点**：

（请结合教材正文，从以下角度组织答案）
:::
`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const files = fs
    .readdirSync(MD_ROOT)
    .filter((f) => /^ch\d{2}\.md$/.test(f))
    .sort();

  console.log("=== 生成毛概教材例题 ===");
  for (const file of files) {
    const itemId = file.replace(/\.md$/, "");
    const md = fs.readFileSync(path.join(MD_ROOT, file), "utf8");
    const questions = extractQuestions(md);
    console.log(`\n${itemId}: 发现 ${questions.length} 道课后思考题`);
    for (let i = 0; i < questions.length; i++) {
      generateExampleFile(itemId, i, questions[i]);
    }
  }
  console.log("\n✓ 例题框架生成完成\n");
}

main();
