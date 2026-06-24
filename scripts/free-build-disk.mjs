// Reclaims build-container disk BEFORE EdgeOne's opennext plugin copies
// .next/standalone -> .edgeone/cloud-functions/ssr-node (the step that ENOSPCs).
//
// Runs as the last thing inside `pnpm run build`, i.e. after `next build` has
// finished but before the plugin assembles+duplicates .next/standalone. It removes
// paths that neither the standalone assembly, the copy step, nor the runtime need:
//   - .next/cache : Turbopack's fresh build cache. MEASURED to be the bulk of the
//                   1.4GB .next dir; never needed post-build. This is the big one.
//   - .git        : cloned git history (~109MB; EdgeOne shallow-clones, so small).
//   - docs/       : transcripts/PDFs/tarball, build-irrelevant (~42MB).
//   - content/_raw: original source PDFs/docx, already excluded from tracing.
// It also LOGS each path's size first, which answers the key open question:
// was the clone full (.git ~900MB) or shallow (.git tiny)?
//
// SAFETY: only acts inside the EdgeOne build tmpfs (cwd under /dev/shm). On any
// local machine (Windows dev, or a Linux checkout outside /dev/shm) it is a
// pure no-op, so it can NEVER delete your real .git. Force-disable with
// EDGEONE_FREE_DISK=0. Deletion uses fs.rmSync (no shell) to avoid injection.
import { execFileSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";

const cwd = process.cwd().replace(/\\/g, "/");
const inEdgeOneBuild = process.platform === "linux" && cwd.includes("/dev/shm");

if (process.env.EDGEONE_FREE_DISK === "0" || !inEdgeOneBuild) {
  console.log(
    `[free-build-disk] skip — not in EdgeOne build tmpfs (cwd=${cwd}, platform=${process.platform}). No files touched.`
  );
  process.exit(0);
}

// Hardcoded targets only — never derived from input. Order: biggest/safest first.
const targets = [".next/cache", ".git", "docs", "content/_raw"];

function sizeOf(path) {
  try {
    // execFileSync: no shell, args passed directly — path is hardcoded regardless.
    return execFileSync("du", ["-sh", path], { encoding: "utf8" }).split("\t")[0].trim();
  } catch {
    return "?";
  }
}

console.log("[free-build-disk] EdgeOne build tmpfs detected — reclaiming disk before standalone copy.");
for (const t of targets) {
  if (!existsSync(t)) {
    console.log(`[free-build-disk]   ${t}: absent, skipped`);
    continue;
  }
  const before = sizeOf(t);
  try {
    rmSync(t, { recursive: true, force: true });
    console.log(`[free-build-disk]   removed ${t} (was ${before})`);
  } catch (e) {
    console.log(`[free-build-disk]   FAILED to remove ${t} (${before}): ${e.message}`);
  }
}
console.log("[free-build-disk] done.");
