/**
 * 把 scripts/git-hooks/pre-commit 装到 .git/hooks。已有第三方 hook 则不覆盖。
 */
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gitPath = join(root, ".git");
const hookSrc = join(root, "scripts/git-hooks/pre-commit");

function resolveGitDir() {
  if (!existsSync(gitPath)) return null;
  try {
    const stat = readFileSync(gitPath, "utf8");
    const match = stat.match(/^gitdir:\s*(.+)$/m);
    if (match) {
      const dir = match[1].trim();
      return isAbsolute(dir) ? dir : join(root, dir);
    }
  } catch {
    // .git is a directory
  }
  return gitPath;
}

const gitDir = resolveGitDir();
if (!gitDir || !existsSync(hookSrc)) {
  console.log("secret-scan: skip hook install (no .git or hook source)");
  process.exit(0);
}

const hookDest = join(gitDir, "hooks/pre-commit");
if (existsSync(hookDest)) {
  const current = readFileSync(hookDest, "utf8");
  if (!current.includes("check-secrets")) {
    console.warn("secret-scan: existing pre-commit hook left untouched");
    process.exit(0);
  }
}

mkdirSync(join(gitDir, "hooks"), { recursive: true });
copyFileSync(hookSrc, hookDest);
try {
  chmodSync(hookDest, 0o755);
} catch {
  // Windows may ignore chmod
}
console.log("secret-scan: installed .git/hooks/pre-commit");
