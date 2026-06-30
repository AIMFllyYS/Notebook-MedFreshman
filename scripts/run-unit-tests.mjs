#!/usr/bin/env node
/**
 * 跨平台 node:test 运行器：发现所有 *.test.ts（不含 *.test.tsx）并用 tsx 执行。
 * tsx 读取 tsconfig.json 的 paths，因此 @/* 别名在 node:test 中同样生效。
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "build",
  "dist",
  "dist-desktop",
  ".codex",
  ".agents",
  "manim",
]);

const SKIP_PATH_PREFIXES = [
  "docs/refer/dist",
];

function shouldSkipDir(path) {
  const normalized = relative(".", path).replace(/\\/g, "/");
  const name = normalized.split("/").pop();
  return SKIP_DIRS.has(name) || SKIP_PATH_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function findTestFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const next = join(dir, entry.name);
      if (shouldSkipDir(next)) continue;
      findTestFiles(next, out);
    } else if (
      entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      out.push(relative(".", join(dir, entry.name)).replace(/\\/g, "/"));
    }
  }
  return out;
}

const files = findTestFiles(".");
if (files.length === 0) {
  console.log("No .test.ts files found.");
  process.exit(0);
}

console.log(`Running ${files.length} test file(s):\n  ${files.join("\n  ")}\n`);

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...files],
  { stdio: "inherit", cwd: process.cwd() },
);

process.exit(result.status ?? 1);
