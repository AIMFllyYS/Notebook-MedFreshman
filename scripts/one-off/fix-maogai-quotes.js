const fs = require("fs");
const path = require("path");

const quizDir = path.join(__dirname, "../content/quiz/maogai");
const files = fs.readdirSync(quizDir).filter((f) => f.endsWith(".json"));

function fixValue(value) {
  // Remove spurious backslashes before Chinese quotes
  value = value.replace(/\\“/g, "“").replace(/\\”/g, "”");
  // Replace internal straight quote pairs (not preceded by a backslash) with Chinese quotes
  value = value.replace(/(?<!\\)"([^"]*)"/g, "“$1”");
  return value;
}

function fixLine(line) {
  // Key-value: "key": "value"
  const kvMatch = line.match(/"([^"]+)":\s*"/);
  if (kvMatch) {
    const valueStart = kvMatch.index + kvMatch[0].length; // index of value content (after opening quote)
    const rest = line.slice(valueStart);
    const endQuote = rest.lastIndexOf('"');
    if (endQuote !== -1) {
      const value = rest.slice(0, endQuote); // value content without surrounding quotes
      return line.slice(0, valueStart) + fixValue(value) + line.slice(valueStart + endQuote);
    }
  }
  // Array item: "value",
  const trimmed = line.trimStart();
  if (trimmed.startsWith('"') && !line.includes('":"') && !line.includes('": ')) {
    const firstQuote = line.indexOf('"');
    const lastQuote = line.lastIndexOf('"');
    if (lastQuote > firstQuote) {
      return line.slice(0, firstQuote + 1) + fixValue(line.slice(firstQuote + 1, lastQuote)) + line.slice(lastQuote);
    }
  }
  return line;
}

let okCount = 0;
let badCount = 0;

for (const file of files) {
  const filePath = path.join(quizDir, file);
  const text = fs.readFileSync(filePath, "utf8");
  const fixed = text.split("\n").map(fixLine).join("\n");
  try {
    JSON.parse(fixed);
    fs.writeFileSync(filePath, fixed, "utf8");
    console.log("OK", file);
    okCount++;
  } catch (e) {
    console.log("BAD", file, e.message);
    // debug: print problematic line
    const lines = fixed.split("\n");
    const m = e.message.match(/line (\d+) column (\d+)/);
    if (m && lines[parseInt(m[1]) - 1]) {
      console.log("  line:", JSON.stringify(lines[parseInt(m[1]) - 1]));
    }
    badCount++;
  }
}

console.log(`\nFixed ${okCount} files, ${badCount} files still bad.`);
