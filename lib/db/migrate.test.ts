import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  BOOTSTRAP_SQL,
  DEFAULT_MIGRATIONS_DIR,
  checksumSql,
  discoverMigrations,
  extractSchemaInventory,
  findNonIdempotentStatements,
  getMigrationStatus,
  inventoryFromMigrations,
  catalogsMatch,
  diffCatalogs,
  emptySchemaInventory,
  missingFromLive,
  parseMigrationFilename,
  runMigrations,
  splitSqlStatements,
  stampMigrations,
  type AppliedMigration,
  type SqlExecutor,
  type SqlRow,
} from "./migrate.ts";

class MemoryExecutor implements SqlExecutor {
  applied: AppliedMigration[] = [];
  calls: string[] = [];

  async query<T extends SqlRow = SqlRow>(sql: string): Promise<T[]> {
    this.calls.push(sql);
    const lower = sql.toLowerCase();
    if (lower.includes("create table if not exists public.schema_migrations")) {
      return [];
    }
    if (/select\s+version,\s+name,\s+checksum/i.test(sql)) {
      return this.applied as unknown as T[];
    }
    const inserts = [...sql.matchAll(
      /insert\s+into\s+public\.schema_migrations\s*\(version,\s*name,\s*checksum\)\s*values\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/gi,
    )];
    for (const m of inserts) {
      this.applied.push({
        version: m[1],
        name: m[2],
        checksum: m[3],
        applied_at: "2026-01-01T00:00:00.000Z",
      });
    }
    return [];
  }
}

function writeMigrations(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "srp-migrate-"));
  for (const [name, sql] of Object.entries(files)) {
    writeFileSync(join(dir, name), sql, "utf8");
  }
  return dir;
}

test("parseMigrationFilename accepts NNNN_name.sql", () => {
  assert.deepEqual(parseMigrationFilename("0001_init.sql"), { version: "0001", name: "init" });
  assert.equal(parseMigrationFilename("readme.md"), null);
  assert.equal(parseMigrationFilename("init.sql"), null);
});

test("splitSqlStatements keeps dollar-quoted function bodies intact", () => {
  const statements = splitSqlStatements(`
    create table t (id int);
    create function f() returns void language plpgsql as $$
    begin
      insert into t values (1);
    end;
    $$;
    grant select on t to anon;
  `);
  assert.equal(statements.length, 3);
  assert.match(statements[1], /insert into t values \(1\)/);
  assert.match(statements[1], /\$\$/);
});

test("checksumSql is stable for the same bytes", () => {
  assert.equal(checksumSql("select 1;\n"), checksumSql("select 1;\n"));
  assert.notEqual(checksumSql("select 1;\n"), checksumSql("select 2;\n"));
});

test("discoverMigrations reads repo baseline in version order", () => {
  const files = discoverMigrations(DEFAULT_MIGRATIONS_DIR);
  assert.ok(files.length >= 2);
  assert.equal(files[0].version, "0001");
  assert.equal(files[0].filename, "0001_init.sql");
  assert.equal(files[0].checksum, checksumSql(files[0].sql));
  assert.equal(files[1].version, "0002");
  assert.equal(files[1].filename, "0002_app_users_no_client_update.sql");
  assert.equal(findNonIdempotentStatements(files[1].sql).length, 0);
  assert.equal(files[2].version, "0003");
  assert.equal(files[2].filename, "0003_sync_documents_document_kind.sql");
  assert.equal(findNonIdempotentStatements(files[2].sql).length, 0);
  assert.match(files[2].sql, /document/);
});

test("0001_init.sql inventory covers tables indexes triggers policies grants", () => {
  const files = discoverMigrations(DEFAULT_MIGRATIONS_DIR);
  const inventory = inventoryFromMigrations(files);
  for (const table of [
    "app_users",
    "quota_grants",
    "usage_ledger",
    "redemption_codes",
    "redemptions",
    "sync_documents",
  ]) {
    assert.ok(inventory.tables.includes(table), table);
    assert.ok(inventory.rlsTables.includes(table), `rls ${table}`);
    assert.ok(inventory.primaryKeys.includes(`${table}_pkey`), `pk ${table}`);
  }
  assert.deepEqual(inventory.functions, ["handle_new_user", "touch_updated_at"]);
  assert.ok(inventory.indexes.includes("quota_grants_user_period_idx"));
  assert.ok(inventory.indexes.includes("usage_ledger_request_idx"));
  assert.ok(inventory.uniqueConstraints.includes("redemption_codes_code_key"));
  assert.ok(inventory.triggers.includes("on_auth_user_created"));
  assert.ok(inventory.policies.includes("sync_documents_all_own"));
  assert.ok(inventory.grants.some((g) => g.includes("grant all on all tables")));
  assert.equal(findNonIdempotentStatements(files[0].sql).length, 0);
});

test("runMigrations applies pending files once and records version", async () => {
  const dir = writeMigrations({
    "0001_a.sql": "create table if not exists public.a (id int);",
    "0002_b.sql": "create table if not exists public.b (id int);",
  });
  const db = new MemoryExecutor();
  const first = await runMigrations(db, dir);
  assert.deepEqual(first, { applied: ["0001", "0002"], skipped: [] });
  assert.equal((await getMigrationStatus(db, dir)).currentVersion, "0002");
  const bodyCalls = db.calls.filter((sql) => /create table if not exists public\.[ab]/i.test(sql));
  assert.equal(bodyCalls.length, 2);

  const second = await runMigrations(db, dir);
  assert.deepEqual(second, { applied: [], skipped: ["0001", "0002"] });
  const bodyCallsAfter = db.calls.filter((sql) => /create table if not exists public\.[ab]/i.test(sql));
  assert.equal(bodyCallsAfter.length, 2, "replay must not re-execute migration bodies");
});

test("runMigrations wraps each file in a transaction with the version insert", async () => {
  const dir = writeMigrations({
    "0001_a.sql": "create table if not exists public.a (id int);",
  });
  const db = new MemoryExecutor();
  await runMigrations(db, dir);
  const apply = db.calls.find((sql) => sql.toLowerCase().includes("create table if not exists public.a"));
  assert.ok(apply);
  assert.match(apply, /^begin;/i);
  assert.match(apply, /insert into public\.schema_migrations/i);
  assert.match(apply, /commit;?\s*$/i);
});

test("runMigrations rejects an edited file after it was applied", async () => {
  const dir = writeMigrations({
    "0001_a.sql": "create table if not exists public.a (id int);",
  });
  const db = new MemoryExecutor();
  await runMigrations(db, dir);
  writeFileSync(join(dir, "0001_a.sql"), "create table if not exists public.a (id int, n int);\n", "utf8");
  await assert.rejects(() => runMigrations(db, dir), /checksum mismatch/);
});

test("stampMigrations records versions without executing bodies", async () => {
  const dir = writeMigrations({
    "0001_a.sql": "create table public.should_not_run (id int);",
  });
  const db = new MemoryExecutor();
  const stamped = await stampMigrations(db, dir, ["0001"]);
  assert.deepEqual(stamped, ["0001"]);
  assert.equal(db.calls.some((sql) => sql.includes("should_not_run")), false);
  const replay = await runMigrations(db, dir);
  assert.deepEqual(replay.skipped, ["0001"]);
});

test("missingFromLive reports only absent catalog objects", () => {
  const expected = extractSchemaInventory(`
    create table if not exists public.app_users (id uuid primary key, code text unique);
    create index if not exists app_users_extra_idx on public.app_users (id);
    create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin return new; end; $$;
    drop trigger if exists app_users_touch on public.app_users;
    create trigger app_users_touch before update on public.app_users for each row execute function public.touch_updated_at();
    alter table public.app_users enable row level security;
    drop policy if exists app_users_select_own on public.app_users;
    create policy app_users_select_own on public.app_users for select to authenticated using (true);
  `);
  const missing = missingFromLive(expected, {
    tables: ["app_users", "schema_migrations"],
    indexes: ["app_users_pkey", "app_users_code_key", "app_users_extra_idx"],
    functions: ["touch_updated_at"],
    triggers: ["app_users_touch"],
    policies: ["app_users_select_own"],
    rlsTables: ["app_users"],
  });
  assert.deepEqual(missing, []);
  assert.ok(missingFromLive(expected, {
    tables: ["schema_migrations"],
    indexes: [],
    functions: [],
    triggers: [],
    policies: [],
    rlsTables: [],
  }).includes("table:app_users"));
});

test("bootstrap SQL is itself idempotent", () => {
  assert.equal(findNonIdempotentStatements(BOOTSTRAP_SQL).length, 0);
});

test("diffCatalogs requires equality and lists hosted noise separately", () => {
  const empty = emptySchemaInventory();
  const rebuilt = {
    ...empty,
    tables: ["app_users", "schema_migrations"],
    indexes: ["app_users_pkey"],
    triggers: ["app_users_touch"],
    policies: ["app_users_select_own"],
    rlsTables: ["app_users"],
    grants: ["table:app_users:SELECT:anon"],
  };
  const live = {
    ...rebuilt,
    tables: ["app_users", "schema_migrations", "supabase_hosted"],
    grants: ["table:app_users:SELECT:anon", "table:app_users:SELECT:authenticated"],
  };
  const unequal = diffCatalogs(rebuilt, live);
  assert.equal(catalogsMatch(unequal), false);
  assert.ok(unequal.missing.includes("tables:supabase_hosted"));
  assert.ok(unequal.extra.includes("tables:schema_migrations") === false);
  assert.ok(unequal.missing.includes("grants:table:app_users:select:authenticated"));

  const allowed = diffCatalogs(rebuilt, live, {
    tables: ["supabase_hosted"],
    indexes: [],
    functions: [],
    triggers: [],
    policies: [],
    rlsTables: [],
    grants: ["table:app_users:SELECT:authenticated"],
  });
  assert.equal(catalogsMatch(allowed), true);
  assert.deepEqual(allowed.noise, [
    "grants:table:app_users:select:authenticated",
    "tables:supabase_hosted",
  ]);
});
