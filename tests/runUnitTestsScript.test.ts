import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("run-unit-tests excludes generated desktop/build artifacts", () => {
  const source = readFileSync(join(process.cwd(), "scripts/run-unit-tests.mjs"), "utf8");

  assert.match(source, /"dist-desktop"/);
  assert.match(source, /"dist"/);
  assert.match(source, /SKIP_PATH_PREFIXES/);
  assert.match(source, /shouldSkipDir/);
});

test("vitest excludes generated desktop/build artifacts", () => {
  const source = readFileSync(join(process.cwd(), "vitest.config.ts"), "utf8");

  assert.match(source, /"dist-desktop\/\*\*"/);
  assert.match(source, /"dist\/\*\*"/);
});

test("pnpm workspace allows required desktop build scripts", () => {
  const source = readFileSync(join(process.cwd(), "pnpm-workspace.yaml"), "utf8");

  assert.match(source, /electron-winstaller:\s*true/);
  assert.match(source, /esbuild:\s*true/);
});
