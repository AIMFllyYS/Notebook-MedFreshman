import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_MIGRATIONS_DIR,
  LIVE_INVENTORY_SQL,
  getMigrationStatus,
  liveInventoryFromRow,
  runMigrations,
  type MigrationStatus,
  type RunMigrationsResult,
  type SchemaInventory,
  type SqlExecutor,
  type SqlRow,
} from "./migrate.ts";

export const EMPTY_DB_BACKEND = "pglite";

const HERE = dirname(fileURLToPath(import.meta.url));
export const LIVE_CATALOG_SNAPSHOT_PATH = join(HERE, "fixtures", "live-catalog.snapshot.json");

export interface LiveCatalogSnapshotFile {
  source: string;
  projectRef: string;
  capturedAt: string;
  catalog: SchemaInventory;
}

/**
 * Minimal Supabase surface so 0001_init.sql can run on an empty Postgres:
 * app roles, auth.users, and auth.uid() referenced by RLS policies.
 */
export const SUPABASE_AUTH_STUB_SQL = `
do $roles$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end
$roles$;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select null::uuid;
$$;
`.trim();

export function createPgliteExecutor(db: PGlite): SqlExecutor {
  return {
    async query<T extends SqlRow = SqlRow>(sql: string): Promise<T[]> {
      const batches = await db.exec(sql);
      const last = batches.at(-1);
      return (last?.rows ?? []) as T[];
    },
  };
}

export async function createEmptyPostgres(): Promise<{
  backend: typeof EMPTY_DB_BACKEND;
  executor: SqlExecutor;
  close: () => Promise<void>;
}> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_AUTH_STUB_SQL);
  return {
    backend: EMPTY_DB_BACKEND,
    executor: createPgliteExecutor(db),
    close: () => db.close(),
  };
}

export async function catalogFromExecutor(executor: SqlExecutor): Promise<SchemaInventory> {
  const rows = await executor.query(LIVE_INVENTORY_SQL);
  return liveInventoryFromRow(rows[0] ?? {});
}

export async function migrateEmptyDatabase(dir = DEFAULT_MIGRATIONS_DIR): Promise<{
  backend: typeof EMPTY_DB_BACKEND;
  applied: string[];
  skipped: string[];
  currentVersion: string | null;
  catalog: SchemaInventory;
  replay: RunMigrationsResult;
  status: MigrationStatus;
}> {
  const empty = await createEmptyPostgres();
  try {
    const applied = await runMigrations(empty.executor, dir);
    const replay = await runMigrations(empty.executor, dir);
    const status = await getMigrationStatus(empty.executor, dir);
    const catalog = await catalogFromExecutor(empty.executor);
    return {
      backend: empty.backend,
      applied: applied.applied,
      skipped: applied.skipped,
      currentVersion: status.currentVersion,
      catalog,
      replay,
      status,
    };
  } finally {
    await empty.close();
  }
}

export function loadLiveCatalogSnapshot(path = LIVE_CATALOG_SNAPSHOT_PATH): LiveCatalogSnapshotFile {
  return JSON.parse(readFileSync(path, "utf8")) as LiveCatalogSnapshotFile;
}
