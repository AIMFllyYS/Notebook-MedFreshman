/**
 * Apply or inspect SQL migrations in supabase/migrations/.
 *
 *   pnpm db:migrate            apply pending files
 *   pnpm db:migrate:status     show current version
 *   npx tsx scripts/db-migrate.ts stamp [version…]
 *
 * Talks to the existing Supabase project via Management API
 * (SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF). Does not create projects.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  catalogFromExecutor,
  createEmptyPostgres,
} from "../lib/db/empty-postgres.ts";
import {
  DEFAULT_MIGRATIONS_DIR,
  LIVE_INVENTORY_SQL,
  SCHEMA_MIGRATIONS_TABLE,
  catalogsMatch,
  createManagementApiExecutor,
  diffCatalogs,
  getMigrationStatus,
  liveInventoryFromRow,
  runMigrations,
  stampMigrations,
} from "../lib/db/migrate.ts";

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
    console.warn("warning: .env.local not found");
  }
}

function migrationsDir() {
  return join(ROOT, DEFAULT_MIGRATIONS_DIR);
}

function createExecutor(readOnly = false) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
  if (!accessToken || !projectRef) {
    throw new Error("Need SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF in .env.local");
  }
  return createManagementApiExecutor({ accessToken, projectRef, readOnly });
}

function printStatus(label: string, currentVersion: string | null, applied: { version: string; name: string; checksum: string; applied_at: string }[], pending: { version: string; name: string }[]) {
  console.log(`${label} ${SCHEMA_MIGRATIONS_TABLE}`);
  console.log(`current: ${currentVersion ?? "(none)"}`);
  if (applied.length === 0) console.log("applied: (none)");
  else {
    console.log("applied:");
    for (const row of applied) {
      console.log(`  ${row.version}  ${row.name}  ${row.checksum.slice(0, 12)}  ${row.applied_at}`);
    }
  }
  if (pending.length === 0) console.log("pending: (none)");
  else {
    console.log("pending:");
    for (const file of pending) console.log(`  ${file.version}  ${file.name}`);
  }
}

async function compareEmptyToLive() {
  const liveRows = await createExecutor(true).query(LIVE_INVENTORY_SQL);
  const live = liveInventoryFromRow(liveRows[0] ?? {});
  const empty = await createEmptyPostgres();
  try {
    const first = await runMigrations(empty.executor, migrationsDir());
    const replay = await runMigrations(empty.executor, migrationsDir());
    const status = await getMigrationStatus(empty.executor, migrationsDir());
    const rebuilt = await catalogFromExecutor(empty.executor);
    const diff = diffCatalogs(rebuilt, live);

    console.log(`empty backend: ${empty.backend}`);
    console.log(`empty applied: ${first.applied.join(", ") || "(none)"}`);
    console.log(`empty replay skipped: ${replay.skipped.join(", ") || "(none)"}`);
    console.log(`empty current: ${status.currentVersion ?? "(none)"}`);
    console.log(`compare keys: tables indexes functions triggers policies rlsTables grants`);
    console.log(`empty counts: t=${rebuilt.tables.length} i=${rebuilt.indexes.length} f=${rebuilt.functions.length} tr=${rebuilt.triggers.length} p=${rebuilt.policies.length} rls=${rebuilt.rlsTables.length} g=${rebuilt.grants.length}`);
    console.log(`live counts:  t=${live.tables.length} i=${live.indexes.length} f=${live.functions.length} tr=${live.triggers.length} p=${live.policies.length} rls=${live.rlsTables.length} g=${live.grants.length}`);

    if (diff.noise.length > 0) {
      console.log("hosted noise (whitelisted):");
      for (const item of diff.noise) console.log(`  ${item}`);
    }
    if (catalogsMatch(diff)) {
      console.log("empty catalog equals live catalog (tables/indexes/triggers/policies/rls/grants)");
      return 0;
    }
    if (diff.missing.length > 0) {
      console.error("missing from empty (present on live):");
      for (const item of diff.missing) console.error(`  ${item}`);
    }
    if (diff.extra.length > 0) {
      console.error("extra on empty (absent on live):");
      for (const item of diff.extra) console.error(`  ${item}`);
    }
    return 1;
  } finally {
    await empty.close();
  }
}

async function main() {
  loadEnvLocal();
  const [command = "status", ...rest] = process.argv.slice(2);
  const dir = migrationsDir();

  if (command === "status") {
    const compare = rest.includes("--compare");
    const status = await getMigrationStatus(createExecutor(), dir);
    printStatus("version table:", status.currentVersion, status.applied, status.pending);
    if (compare) {
      const code = await compareEmptyToLive();
      if (code !== 0) process.exitCode = code;
    }
    return;
  }

  if (command === "up") {
    const result = await runMigrations(createExecutor(), dir);
    console.log(`applied: ${result.applied.join(", ") || "(none)"}`);
    console.log(`skipped: ${result.skipped.join(", ") || "(none)"}`);
    const status = await getMigrationStatus(createExecutor(), dir);
    console.log(`current: ${status.currentVersion ?? "(none)"}`);
    return;
  }

  if (command === "stamp") {
    const versions = rest.filter((arg) => !arg.startsWith("--"));
    const stamped = await stampMigrations(createExecutor(), dir, versions.length > 0 ? versions : undefined);
    console.log(`stamped: ${stamped.join(", ") || "(none)"}`);
    return;
  }

  if (command === "compare") {
    const code = await compareEmptyToLive();
    if (code !== 0) process.exitCode = code;
    return;
  }

  console.error("usage: npx tsx scripts/db-migrate.ts <status|up|stamp|compare> [--compare]");
  process.exit(2);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
