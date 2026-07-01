import fs from "fs";
import path from "path";

const DIR = path.resolve(process.cwd(), "content/maogai/textbook");

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

let errors = 0;
for (const file of files) {
  const content = fs.readFileSync(path.join(DIR, file), "utf8");
  const bad = content.match(/^:{4,}[a-zA-Z][\w-]*\{/gm) || [];
  if (bad.length > 0) {
    console.error(`❌ ${file}: 发现 ${bad.length} 处四冒号指令`);
    errors++;
  }
  const unclosed = content.match(/^:{3,4}memory\{/gm);
  const closed = content.match(/^\s*:?-{0,1}:{3}\s*$/gm);
  if (unclosed && (!closed || unclosed.length > closed.length)) {
    console.error(`❌ ${file}: memory 卡片可能未闭合`);
    errors++;
  }
}

if (errors === 0) {
  console.log(`✅ ${files.length} 个文件语法检查通过`);
} else {
  process.exit(1);
}
