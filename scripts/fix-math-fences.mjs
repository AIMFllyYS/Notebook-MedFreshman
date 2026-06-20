import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve('content');

function findMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function fixLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return [line];

  const leadingWs = line.match(/^\s*/)[0];

  // Already a standalone $$ fence — leave as-is
  if (trimmed === '$$') return [line];

  // Pattern 1: Single-line $$content$$
  if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
    const inner = trimmed.slice(2, -2);
    if (!inner.includes('$$')) {
      return [leadingWs + '$$', leadingWs + inner.trim(), leadingWs + '$$'];
    }
  }

  // Pattern 2: Opening fence with content after $$ on same line
  // e.g. $$\begin{aligned}
  if (trimmed.startsWith('$$') && !trimmed.endsWith('$$')) {
    const rest = trimmed.slice(2).trim();
    if (rest) {
      return [leadingWs + '$$', leadingWs + rest];
    }
  }

  // Pattern 3: Closing fence with content before $$ on same line
  // e.g. \end{aligned}$$
  if (trimmed.endsWith('$$') && !trimmed.startsWith('$$')) {
    const before = trimmed.slice(0, -2).trim();
    if (before) {
      return [leadingWs + before, leadingWs + '$$'];
    }
  }

  return [line];
}

function fixContent(content) {
  const lines = content.split('\n');
  const result = [];
  for (const line of lines) {
    result.push(...fixLine(line));
  }
  return result.join('\n');
}

const files = findMdFiles(CONTENT_DIR);
let totalChanged = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf-8');
  const fixed = fixContent(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed, 'utf-8');
    const origLines = original.split('\n').length;
    const newLines = fixed.split('\n').length;
    console.log(`Fixed: ${path.relative('.', file)} (${origLines} → ${newLines} lines, +${newLines - origLines})`);
    totalChanged++;
  }
}

console.log(`\nDone. ${totalChanged} file(s) changed out of ${files.length} total.`);
