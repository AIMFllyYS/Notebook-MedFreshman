/**
 * 为毛概教材例题自动填充参考答案要点。
 *
 * 策略：对每个问题，从对应章节正文中按关键词搜索相关段落，
 * 提取最相关的几段作为答案要点。
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");
const EXAMPLE_ROOT = path.join(process.cwd(), "content", "examples", "maogai", "textbook");

function loadChapterText(itemId: string): string {
  const filePath = path.join(MD_ROOT, `${itemId}.md`);
  return fs.readFileSync(filePath, "utf8");
}

function stripMarkdownNoise(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/\$[^$\n]+\$/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/^\s*[-*]\s*/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20 && p.length < 800);
}

function scoreParagraph(p: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (kw.length <= 1) continue;
    const regex = new RegExp(kw, "g");
    const matches = p.match(regex);
    if (matches) {
      score += matches.length * kw.length;
    }
  }
  return score;
}

function extractKeywords(question: string): string[] {
  // 提取问题中的名词性关键词
  return question
    .replace(/[的了吗呢什么如何怎样理解把握认识为何为什么及其主要及其相互关系]/g, " ")
    .split(/[\s，、；：！？.,;:!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

function findRelevantParagraphs(chapterText: string, question: string, topK = 5): string[] {
  const paragraphs = splitParagraphs(stripMarkdownNoise(chapterText));
  const keywords = extractKeywords(question);

  const scored = paragraphs
    .map((p) => ({ text: p, score: scoreParagraph(p, keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((item) => item.text);
}

function fillAnswer(itemId: string, fileName: string, question: string): void {
  const filePath = path.join(EXAMPLE_ROOT, itemId, fileName);
  if (!fs.existsSync(filePath)) return;

  const chapterText = loadChapterText(itemId);
  const paragraphs = findRelevantParagraphs(chapterText, question);

  let answerContent = "";
  if (paragraphs.length > 0) {
    answerContent = paragraphs
      .map((p, i) => `${i + 1}. ${p.replace(/\n/g, " ")}`)
      .join("\n\n");
  } else {
    answerContent = "（请结合教材正文组织答案）";
  }

  const content = `:::example{label=课后思考题：${question}}
**题目**：${question}

**参考答案要点**：

${answerContent}
:::
`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const itemIds = fs
    .readdirSync(EXAMPLE_ROOT)
    .filter((d) => /^ch\d{2}$/.test(d))
    .sort();

  console.log("=== 填充毛概教材例题答案 ===");
  for (const itemId of itemIds) {
    const dir = path.join(EXAMPLE_ROOT, itemId);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
    console.log(`\n${itemId}: ${files.length} 道例题`);
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      const m = content.match(/\*\*题目\*\*：(.+)/);
      if (m) {
        fillAnswer(itemId, file, m[1].trim());
      }
    }
  }
  console.log("\n✓ 答案填充完成\n");
}

main();
