import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(process.cwd(), "content/maogai/textbook");
const OUT_DIR = SRC_DIR;
const MAP_PATH = path.resolve(
  process.cwd(),
  "scripts/temp/maogai-textbook/split-map.json"
);

const CHAPTER_FILES = [
  "ch00",
  "ch01",
  "ch02",
  "ch03",
  "ch04",
  "ch05",
  "ch06",
  "ch07",
  "ch08",
];

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

function splitChapter(chapterId: string): Section[] {
  const srcPath = path.join(SRC_DIR, `${chapterId}.md`);
  const raw = fs.readFileSync(srcPath, "utf8").replace(/\r\n/g, "\n");

  const isIntro = chapterId === "ch00";
  const sectionRegex = isIntro
    ? /^(#{3})\s+([一二三四五六七八九十]+、.*)$/gm
    : /^(#{2})\s+(第[一二三四五六七八九十]+节\s+.*)$/gm;
  const sectionLevel = isIntro ? 3 : 2;

  const matches: { level: number; title: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRegex.exec(raw)) !== null) {
    matches.push({ level: m[1].length, title: m[2], index: m.index });
  }

  if (matches.length === 0) {
    throw new Error(`No sections found in ${chapterId}.md`);
  }

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : raw.length;
    const chunk = raw.slice(start, end).trim();
    const { body, memory } = extractMemoryBlock(chunk);

    const sectionLines = body.split("\n");
    // Replace section heading title line with clean title, then normalize inner headings.
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
  const allSections: Section[] = [];
  for (const chapterId of CHAPTER_FILES) {
    const sections = splitChapter(chapterId);
    allSections.push(...sections);

    for (const sec of sections) {
      const outPath = path.join(OUT_DIR, `${sec.id}.md`);
      let content = sec.body;
      if (sec.memory) {
        content += "\n\n" + sec.memory;
      }
      fs.writeFileSync(outPath, content + "\n", "utf8");
    }
  }

  const splitMap = allSections.map((s) => ({
    id: s.id,
    chapterId: s.chapterId,
    index: s.index,
    title: s.title,
    file: `${s.id}.md`,
    hasMemory: !!s.memory,
  }));
  fs.mkdirSync(path.dirname(MAP_PATH), { recursive: true });
  fs.writeFileSync(MAP_PATH, JSON.stringify(splitMap, null, 2), "utf8");

  console.log(`Split ${allSections.length} sections.`);
  console.log(`Map written to ${MAP_PATH}`);
}

main();
