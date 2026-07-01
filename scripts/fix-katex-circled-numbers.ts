/**
 * 把教材中 $^{①}$ 这类 KaTeX 不支持的圆圈数字上标，
 * 替换为 HTML <sup>①</sup>，消除构建警告并保证正确渲染。
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MD_ROOT = path.join(process.cwd(), "content", "maogai", "textbook");

function fixFile(slug: string): void {
  const filePath = path.join(MD_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return;

  let md = fs.readFileSync(filePath, "utf8");
  md = md.replace(/\$\^\{①\}\$/g, "<sup>①</sup>");
  md = md.replace(/\$\^\{②\}\$/g, "<sup>②</sup>");
  md = md.replace(/\$\^\{③\}\$/g, "<sup>③</sup>");
  md = md.replace(/\$\^\{④\}\$/g, "<sup>④</sup>");

  fs.writeFileSync(filePath, md, "utf8");
  console.log(`  → ${filePath}`);
}

function main() {
  const files = fs.readdirSync(MD_ROOT).filter((f) => f.endsWith(".md"));
  console.log("=== 修复 KaTeX 圆圈数字上标 ===");
  for (const f of files) {
    fixFile(f.replace(/\.md$/, ""));
  }
  console.log("\n✓ 完成\n");
}

main();
