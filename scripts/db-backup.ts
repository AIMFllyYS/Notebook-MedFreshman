/**
 * Logical dump + Free-plan usage watermark.
 *
 *   pnpm db:backup          dump via Management API, write encrypted file
 *   pnpm db:backup:usage    print one JSON usage record
 *
 * Reads .env.local. Never prints table contents or redemption codes.
 * Restore against the live project is not offered.
 */
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  dumpLogicalFromManagementApi,
  resolveBackupEnv,
  rowCountsOf,
  writeEncryptedDump,
} from "../lib/db/backup.ts";
import {
  buildUsageRecord,
  fetchProjectUsage,
  formatUsageRecord,
  formatUsageSummary,
} from "../lib/db/usageAlert.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (process.env[k] == null) process.env[k] = v;
    }
  } catch {
    // CI supplies env via secrets.
  }
}

function recordSource(): string {
  if (process.env.BACKUP_SOURCE?.trim()) return process.env.BACKUP_SOURCE.trim();
  if (process.env.GITHUB_ACTIONS === "true") return "github-actions";
  return "cli";
}

async function runDump() {
  const env = resolveBackupEnv();
  const dump = await dumpLogicalFromManagementApi({
    accessToken: env.accessToken,
    projectRef: env.projectRef,
  });
  const meta = writeEncryptedDump(dump, env.encryptionKey, join(ROOT, env.backupDir));
  const record = {
    ok: true,
    action: "dump",
    path: meta.path,
    ciphertextBytes: meta.ciphertextBytes,
    rowCounts: rowCountsOf(dump),
    dumpedAt: dump.dumpedAt,
    projectRef: dump.projectRef,
    cipher: "aes-256-gcm",
    outsideSupabase: true,
    source: recordSource(),
  };
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

async function runUsage() {
  const env = resolveBackupEnv();
  const snapshot = await fetchProjectUsage({
    accessToken: env.accessToken,
    projectRef: env.projectRef,
  });
  const record = buildUsageRecord(snapshot, { source: recordSource() });
  process.stdout.write(formatUsageRecord(record));
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) appendFileSync(summary, formatUsageSummary(record), "utf8");
  if (record.alert) process.exitCode = 2;
}

async function main() {
  loadEnvLocal();
  const command = process.argv[2] ?? "dump";
  if (command === "dump") {
    await runDump();
    return;
  }
  if (command === "usage") {
    await runUsage();
    return;
  }
  console.error("usage: npx tsx scripts/db-backup.ts <dump|usage>");
  process.exit(2);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
