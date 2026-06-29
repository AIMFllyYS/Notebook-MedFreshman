import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const EXAMPLE_ROOT = join(process.cwd(), "content", "examples", "physics", "recording");

function findMarkdownFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findMarkdownFiles(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function badControlCharacters(text: string): string[] {
  const hits: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 0x0b || code === 0x0c || (code === 0x0d && text[i + 1] !== "\n")) {
      const line = text.slice(0, i).split(/\n/).length;
      hits.push(`line ${line}: U+${code.toString(16).toUpperCase().padStart(4, "0")}`);
    }
  }
  return hits;
}

test("physics recording examples do not contain LaTeX escape control characters", () => {
  const violations: string[] = [];

  for (const file of findMarkdownFiles(EXAMPLE_ROOT)) {
    const text = readFileSync(file, "utf8");
    const bad = badControlCharacters(text);
    if (bad.length > 0) {
      violations.push(`${file.replace(process.cwd() + "\\", "")}: ${bad.slice(0, 5).join(", ")}`);
    }
  }

  assert.deepEqual(violations, []);
});

