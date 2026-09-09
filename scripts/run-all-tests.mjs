#!/usr/bin/env node
/**
 * 跨平台跑完两套测试再取最差退出码：node:test（代码单测）+ vitest。
 * 默认排除 tests/content/**（内容校验走 pnpm test:content）。
 * --include-content 时跑全部 *.test.ts。
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: process.cwd() });
  if (result.error) {
    console.error(result.error);
    return 1;
  }
  return result.status ?? 1;
}

const includeContent = process.argv.includes("--include-content");
const unitScript = ["scripts/run-unit-tests.mjs"];
if (!includeContent) unitScript.push("--filter=code");

const vitestCli = require.resolve("vitest/vitest.mjs");
const code1 = run(process.execPath, unitScript);
const code2 = run(process.execPath, [vitestCli, "run", "--passWithNoTests"]);
process.exit(Math.max(code1, code2));
