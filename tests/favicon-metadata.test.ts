import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("站点标签页图标：layout metadata 与静态文件齐全", () => {
  const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
  assert.match(layout, /url:\s*"\/icon\.svg"/);
  assert.match(layout, /url:\s*"\/icon-256\.png"/);
  assert.match(layout, /apple:\s*"\/icon-256\.png"/);

  const manifest = readFileSync(join(root, "app/manifest.ts"), "utf8");
  assert.match(manifest, /src:\s*"\/icon\.svg"/);
  assert.match(manifest, /src:\s*"\/icon-256\.png"/);

  for (const rel of ["app/icon.svg", "public/icon.svg", "public/icon-256.png", "app/favicon.ico", "public/favicon.ico"]) {
    assert.ok(existsSync(join(root, rel)), `${rel} 应存在`);
  }
});
