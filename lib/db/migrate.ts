import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_MIGRATIONS_DIR = "supabase/migrations";
export const SCHEMA_MIGRATIONS_TABLE = "public.schema_migrations";

const FILE_RE = /^(\d{4})_([a-z0-9_]+)\.sql$/i;

export const BOOTSTRAP_SQL = `
create table if not exists public.schema_migrations (
  version    text primary key,
  name       text not null,
  checksum   text not null,
  applied_at timestamptz not null default now()
);

alter table public.schema_migrations enable row level security;

revoke all on table public.schema_migrations from anon, authenticated;
grant select, insert, update, delete on table public.schema_migrations to postgres, service_role;
`.trim();

export type SqlRow = Record<string, unknown>;

export interface SqlExecutor {
  query<T extends SqlRow = SqlRow>(sql: string): Promise<T[]>;
}

export interface MigrationFile {
  version: string;
  name: string;
  filename: string;
  path: string;
  sql: string;
  checksum: string;
}

export interface AppliedMigration {
  version: string;
  name: string;
  checksum: string;
  applied_at: string;
}

export interface SchemaInventory {
  tables: string[];
  indexes: string[];
  uniqueConstraints: string[];
  primaryKeys: string[];
  functions: string[];
  triggers: string[];
  policies: string[];
  rlsTables: string[];
  grants: string[];
}

export interface MigrationStatus {
  currentVersion: string | null;
  applied: AppliedMigration[];
  pending: MigrationFile[];
}

export interface RunMigrationsResult {
  applied: string[];
  skipped: string[];
}

const SELECT_APPLIED_SQL = `
select version, name, checksum, applied_at::text as applied_at
from public.schema_migrations
order by version
`.trim();

export function checksumSql(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export function parseMigrationFilename(filename: string): { version: string; name: string } | null {
  const m = filename.match(FILE_RE);
  if (!m) return null;
  return { version: m[1], name: m[2] };
}

export function splitSqlStatements(sql: string): string[] {
  const out: string[] = [];
  let current = "";
  let i = 0;
  let inSingle = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag: string | null = null;

  while (i < sql.length) {
    const c = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += c;
      if (c === "\n") inLineComment = false;
      i += 1;
      continue;
    }
    if (inBlockComment) {
      current += c;
      if (c === "*" && next === "/") {
        current += next;
        i += 2;
        inBlockComment = false;
        continue;
      }
      i += 1;
      continue;
    }
    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        current += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += c;
      i += 1;
      continue;
    }
    if (inSingle) {
      current += c;
      if (c === "'" && next === "'") {
        current += next;
        i += 2;
        continue;
      }
      if (c === "'") inSingle = false;
      i += 1;
      continue;
    }
    if (c === "-" && next === "-") {
      inLineComment = true;
      current += c;
      i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      inBlockComment = true;
      current += c;
      i += 1;
      continue;
    }
    if (c === "'") {
      inSingle = true;
      current += c;
      i += 1;
      continue;
    }
    if (c === "$") {
      const tag = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (tag) {
        dollarTag = tag[0];
        current += tag[0];
        i += tag[0].length;
        continue;
      }
    }
    if (c === ";") {
      const stmt = current.trim();
      if (stmt) out.push(stmt);
      current = "";
      i += 1;
      continue;
    }
    current += c;
    i += 1;
  }
  const tail = current.trim();
  if (tail) out.push(tail);
  return out;
}

function stripSqlComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function discoverMigrations(dir: string): MigrationFile[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const files: MigrationFile[] = [];
  for (const filename of names) {
    const parsed = parseMigrationFilename(filename);
    if (!parsed) continue;
    const path = join(dir, filename);
    const sql = readFileSync(path, "utf8");
    files.push({
      version: parsed.version,
      name: parsed.name,
      filename,
      path,
      sql,
      checksum: checksumSql(sql),
    });
  }
  return files.sort((a, b) => a.version.localeCompare(b.version) || a.name.localeCompare(b.name));
}

function quoteIdentName(raw: string): string {
  return raw.replace(/^"|"$/g, "").toLowerCase();
}

function tableBase(name: string): string {
  return name.replace(/^public\./, "");
}

export function extractSchemaInventory(sql: string): SchemaInventory {
  const tables = new Set<string>();
  const indexes = new Set<string>();
  const uniqueConstraints = new Set<string>();
  const primaryKeys = new Set<string>();
  const functions = new Set<string>();
  const triggers = new Set<string>();
  const policies = new Set<string>();
  const rlsTables = new Set<string>();
  const grants = new Set<string>();

  for (const raw of splitSqlStatements(sql)) {
    const s = stripSqlComments(raw);
    const lower = s.toLowerCase();

    const table = lower.match(/^create\s+table\s+(?:if\s+not\s+exists\s+)?(?:only\s+)?(?:public\.)?([a-z0-9_]+)/);
    if (table) {
      tables.add(table[1]);
      primaryKeys.add(`${table[1]}_pkey`);
      const uniqueCols = [...s.matchAll(/\bunique\s*\(([^)]+)\)/gi)];
      for (const u of uniqueCols) {
        const cols = u[1].split(",").map((c) => c.trim().split(/\s+/)[0].replace(/"/g, "").toLowerCase());
        uniqueConstraints.add(`${table[1]}_${cols.join("_")}_key`);
      }
      const inlineUnique = [...s.matchAll(/(?:^|[,(])\s*([a-z0-9_]+)\s+[^,()]+?\bunique\b/gi)];
      for (const u of inlineUnique) {
        uniqueConstraints.add(`${table[1]}_${u[1].toLowerCase()}_key`);
      }
    }

    const idx = lower.match(/^create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?([a-z0-9_]+)/);
    if (idx) indexes.add(idx[1]);

    const fn = lower.match(/^create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-z0-9_]+)/);
    if (fn) functions.add(fn[1]);

    const trig = lower.match(/^create\s+trigger\s+([a-z0-9_]+)/);
    if (trig) triggers.add(trig[1]);

    const pol = lower.match(/^create\s+policy\s+([a-z0-9_]+)/);
    if (pol) policies.add(pol[1]);

    const rls = lower.match(/^alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-z0-9_]+)\s+enable\s+row\s+level\s+security/);
    if (rls) rlsTables.add(rls[1]);

    if (lower.startsWith("grant ") || lower.startsWith("alter default privileges")) {
      grants.add(lower.replace(/\s+/g, " "));
    }
  }

  return {
    tables: [...tables].sort(),
    indexes: [...indexes].sort(),
    uniqueConstraints: [...uniqueConstraints].sort(),
    primaryKeys: [...primaryKeys].sort(),
    functions: [...functions].sort(),
    triggers: [...triggers].sort(),
    policies: [...policies].sort(),
    rlsTables: [...rlsTables].sort(),
    grants: [...grants].sort(),
  };
}

function mergeInventories(parts: SchemaInventory[]): SchemaInventory {
  const merge = (key: keyof SchemaInventory) =>
    [...new Set(parts.flatMap((p) => p[key]))].sort();
  return {
    tables: merge("tables"),
    indexes: merge("indexes"),
    uniqueConstraints: merge("uniqueConstraints"),
    primaryKeys: merge("primaryKeys"),
    functions: merge("functions"),
    triggers: merge("triggers"),
    policies: merge("policies"),
    rlsTables: merge("rlsTables"),
    grants: merge("grants"),
  };
}

export function inventoryFromMigrations(files: MigrationFile[]): SchemaInventory {
  return mergeInventories(files.map((f) => extractSchemaInventory(f.sql)));
}

export function findNonIdempotentStatements(sql: string): string[] {
  const issues: string[] = [];
  const droppedTriggers = new Set<string>();
  const droppedPolicies = new Set<string>();

  for (const raw of splitSqlStatements(sql)) {
    const s = stripSqlComments(raw);
    const lower = s.toLowerCase();

    const dropTrig = lower.match(/^drop\s+trigger\s+if\s+exists\s+([a-z0-9_]+)/);
    if (dropTrig) droppedTriggers.add(dropTrig[1]);
    const dropPol = lower.match(/^drop\s+policy\s+if\s+exists\s+([a-z0-9_]+)/);
    if (dropPol) droppedPolicies.add(dropPol[1]);

    if (/^create\s+table\s+(?!if\s+not\s+exists\b)/i.test(s)) {
      issues.push(`CREATE TABLE without IF NOT EXISTS: ${s.slice(0, 72)}`);
    }
    if (/^create\s+(?:unique\s+)?index\s+(?!if\s+not\s+exists\b)/i.test(s)) {
      issues.push(`CREATE INDEX without IF NOT EXISTS: ${s.slice(0, 72)}`);
    }
    if (/^create\s+extension\s+(?!if\s+not\s+exists\b)/i.test(s)) {
      issues.push(`CREATE EXTENSION without IF NOT EXISTS: ${s.slice(0, 72)}`);
    }
    if (/^create\s+function\b/i.test(s) && !/^create\s+or\s+replace\s+function\b/i.test(s)) {
      issues.push(`CREATE FUNCTION without OR REPLACE: ${s.slice(0, 72)}`);
    }
    if (/^create\s+trigger\s+/i.test(s)) {
      const name = s.match(/^create\s+trigger\s+([a-z0-9_]+)/i)?.[1]?.toLowerCase();
      if (!name || !droppedTriggers.has(name)) {
        issues.push(`CREATE TRIGGER without DROP IF EXISTS: ${s.slice(0, 72)}`);
      }
    }
    if (/^create\s+policy\s+/i.test(s)) {
      const name = s.match(/^create\s+policy\s+([a-z0-9_]+)/i)?.[1]?.toLowerCase();
      if (!name || !droppedPolicies.has(name)) {
        issues.push(`CREATE POLICY without DROP IF EXISTS: ${s.slice(0, 72)}`);
      }
    }
  }
  return issues;
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function asApplied(row: SqlRow): AppliedMigration {
  return {
    version: String(row.version ?? ""),
    name: String(row.name ?? ""),
    checksum: String(row.checksum ?? ""),
    applied_at: String(row.applied_at ?? ""),
  };
}

async function ensureMigrationsTable(executor: SqlExecutor): Promise<void> {
  await executor.query(BOOTSTRAP_SQL);
}

async function listAppliedMigrations(executor: SqlExecutor): Promise<AppliedMigration[]> {
  const rows = await executor.query(SELECT_APPLIED_SQL);
  return rows.map(asApplied);
}

export async function getMigrationStatus(
  executor: SqlExecutor,
  dir = DEFAULT_MIGRATIONS_DIR,
): Promise<MigrationStatus> {
  await ensureMigrationsTable(executor);
  const applied = await listAppliedMigrations(executor);
  const appliedVersions = new Set(applied.map((row) => row.version));
  const files = discoverMigrations(dir);
  const pending = files.filter((file) => !appliedVersions.has(file.version));
  const currentVersion = applied.length > 0 ? applied[applied.length - 1].version : null;
  return { currentVersion, applied, pending };
}

function assertChecksums(applied: AppliedMigration[], files: MigrationFile[]): void {
  const byVersion = new Map(files.map((file) => [file.version, file]));
  for (const row of applied) {
    const file = byVersion.get(row.version);
    if (file && file.checksum !== row.checksum) {
      throw new Error(
        `Migration ${row.version} checksum mismatch (applied ${row.checksum.slice(0, 12)}…, file ${file.checksum.slice(0, 12)}…). Add a new file instead of editing an applied migration.`,
      );
    }
  }
}

export async function runMigrations(
  executor: SqlExecutor,
  dir = DEFAULT_MIGRATIONS_DIR,
): Promise<RunMigrationsResult> {
  await ensureMigrationsTable(executor);
  const applied = await listAppliedMigrations(executor);
  const files = discoverMigrations(dir);
  assertChecksums(applied, files);

  const appliedVersions = new Set(applied.map((row) => row.version));
  const result: RunMigrationsResult = { applied: [], skipped: [] };

  for (const file of files) {
    if (appliedVersions.has(file.version)) {
      result.skipped.push(file.version);
      continue;
    }
    const wrapped = [
      "begin",
      file.sql.trim().replace(/;\s*$/, ""),
      `insert into public.schema_migrations (version, name, checksum) values (${sqlLiteral(file.version)}, ${sqlLiteral(file.name)}, ${sqlLiteral(file.checksum)})`,
      "commit",
    ].join(";\n") + ";";
    await executor.query(wrapped);
    result.applied.push(file.version);
  }
  // 0001 grants ALL on every public table. Re-lock the version table so an
  // empty rebuild matches live (where bootstrap ran after the baseline).
  await ensureMigrationsTable(executor);
  return result;
}

export async function stampMigrations(
  executor: SqlExecutor,
  dir = DEFAULT_MIGRATIONS_DIR,
  versions?: string[],
): Promise<string[]> {
  await ensureMigrationsTable(executor);
  const applied = await listAppliedMigrations(executor);
  const files = discoverMigrations(dir);
  assertChecksums(applied, files);
  const appliedVersions = new Set(applied.map((row) => row.version));
  const want = versions ? new Set(versions) : null;
  const stamped: string[] = [];

  for (const file of files) {
    if (appliedVersions.has(file.version)) continue;
    if (want && !want.has(file.version)) continue;
    await executor.query(
      `insert into public.schema_migrations (version, name, checksum) values (${sqlLiteral(file.version)}, ${sqlLiteral(file.name)}, ${sqlLiteral(file.checksum)})`,
    );
    stamped.push(file.version);
  }
  return stamped;
}

export const LIVE_INVENTORY_SQL = `
with tables as (
  select json_agg(table_name order by table_name) as tables
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
),
indexes as (
  select json_agg(indexname order by indexname) as indexes
  from pg_indexes
  where schemaname = 'public'
),
policies as (
  select json_agg(policyname order by policyname) as policies
  from pg_policies
  where schemaname = 'public'
),
funcs as (
  select json_agg(proname order by proname) as functions
  from (
    select distinct p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (
        select 1
        from pg_depend d
        join pg_extension e on e.oid = d.refobjid
        where d.classid = 'pg_proc'::regclass
          and d.objid = p.oid
          and d.deptype = 'e'
      )
  ) f
),
trigs as (
  select json_agg(t.tgname order by t.tgname) as triggers
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where not t.tgisinternal
    and (
      n.nspname = 'public'
      or (n.nspname = 'auth' and t.tgname = 'on_auth_user_created')
    )
),
rls as (
  select json_agg(c.relname order by c.relname) as rls_tables
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
),
grants as (
  select json_agg(grant_key order by grant_key) as grants
  from (
    select distinct format('table:%s:%s:%s', c.relname, x.privilege_type, r.rolname) as grant_key
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join lateral aclexplode(coalesce(c.relacl, '{}'::aclitem[])) x
    join pg_roles r on r.oid = x.grantee
    where n.nspname = 'public'
      and c.relkind = 'r'
      and r.rolname in ('anon', 'authenticated', 'service_role')
      and x.privilege_type <> 'MAINTAIN'
    union
    select distinct format('schema:%s:%s:%s', n.nspname, x.privilege_type, r.rolname)
    from pg_namespace n
    cross join lateral aclexplode(coalesce(n.nspacl, '{}'::aclitem[])) x
    join pg_roles r on r.oid = x.grantee
    where n.nspname = 'public'
      and r.rolname in ('anon', 'authenticated', 'service_role')
      and x.privilege_type <> 'MAINTAIN'
    union
    select distinct format('function:%s:%s:%s', p.proname, x.privilege_type, r.rolname)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    cross join lateral aclexplode(coalesce(p.proacl, '{}'::aclitem[])) x
    join pg_roles r on r.oid = x.grantee
    where n.nspname = 'public'
      and p.prokind = 'f'
      and r.rolname in ('anon', 'authenticated', 'service_role')
      and x.privilege_type <> 'MAINTAIN'
      and not exists (
        select 1
        from pg_depend d
        join pg_extension e on e.oid = d.refobjid
        where d.classid = 'pg_proc'::regclass
          and d.objid = p.oid
          and d.deptype = 'e'
      )
  ) g
)
select
  coalesce((select tables from tables), '[]'::json) as tables,
  coalesce((select indexes from indexes), '[]'::json) as indexes,
  coalesce((select policies from policies), '[]'::json) as policies,
  coalesce((select functions from funcs), '[]'::json) as functions,
  coalesce((select triggers from trigs), '[]'::json) as triggers,
  coalesce((select rls_tables from rls), '[]'::json) as rls_tables,
  coalesce((select grants from grants), '[]'::json) as grants
`.trim();

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).sort();
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String).sort();
    } catch {
      return [];
    }
  }
  return [];
}

export const CATALOG_COMPARE_KEYS = [
  "tables",
  "indexes",
  "functions",
  "triggers",
  "policies",
  "rlsTables",
  "grants",
] as const;

export type CatalogCompareKey = (typeof CATALOG_COMPARE_KEYS)[number];

/**
 * Live-only objects that an empty rebuild cannot reproduce.
 * Keep this list explicit — an empty whitelist means catalogs must match exactly.
 *
 * schema CREATE for service_role is granted by Supabase on project create,
 * not by supabase/migrations/0001_init.sql (that file only GRANTs USAGE).
 */
export const HOSTED_CATALOG_NOISE: Record<CatalogCompareKey, string[]> = {
  tables: [],
  indexes: [],
  functions: [],
  triggers: [],
  policies: [],
  rlsTables: [],
  grants: ["schema:public:CREATE:service_role"],
};

export interface CatalogDiff {
  missing: string[];
  extra: string[];
  noise: string[];
}

export function emptySchemaInventory(): SchemaInventory {
  return {
    tables: [],
    indexes: [],
    uniqueConstraints: [],
    primaryKeys: [],
    functions: [],
    triggers: [],
    policies: [],
    rlsTables: [],
    grants: [],
  };
}

export function liveInventoryFromRow(row: SqlRow): SchemaInventory {
  return {
    ...emptySchemaInventory(),
    tables: asStringList(row.tables),
    indexes: asStringList(row.indexes),
    functions: asStringList(row.functions),
    triggers: asStringList(row.triggers),
    policies: asStringList(row.policies),
    rlsTables: asStringList(row.rls_tables),
    grants: asStringList(row.grants),
  };
}

export function diffCatalogs(
  actual: SchemaInventory,
  expected: SchemaInventory,
  noise: Record<CatalogCompareKey, string[]> = HOSTED_CATALOG_NOISE,
): CatalogDiff {
  const missing: string[] = [];
  const extra: string[] = [];
  const noiseHits: string[] = [];

  for (const key of CATALOG_COMPARE_KEYS) {
    const noiseSet = new Set(noise[key].map(quoteIdentName));
    const actualSet = new Set(actual[key].map(quoteIdentName));
    const expectedSet = new Set(expected[key].map(quoteIdentName));

    for (const item of expectedSet) {
      if (actualSet.has(item)) continue;
      if (noiseSet.has(item)) {
        noiseHits.push(`${key}:${item}`);
        continue;
      }
      missing.push(`${key}:${item}`);
    }
    for (const item of actualSet) {
      if (expectedSet.has(item)) continue;
      extra.push(`${key}:${item}`);
    }
  }

  return { missing, extra, noise: noiseHits.sort() };
}

export function catalogsMatch(diff: CatalogDiff): boolean {
  return diff.missing.length === 0 && diff.extra.length === 0;
}

export function missingFromLive(
  expected: SchemaInventory,
  live: Pick<SchemaInventory, "tables" | "indexes" | "functions" | "triggers" | "policies" | "rlsTables">,
): string[] {
  const missing: string[] = [];
  const check = (label: string, want: string[], have: string[]) => {
    const set = new Set(have.map(quoteIdentName));
    for (const item of want) {
      if (label === "index") {
        if (!set.has(item) && !set.has(`${tableBase(item)}`)) missing.push(`${label}:${item}`);
        continue;
      }
      if (!set.has(item)) missing.push(`${label}:${item}`);
    }
  };
  check("table", expected.tables, live.tables);
  check("index", [...expected.indexes, ...expected.uniqueConstraints, ...expected.primaryKeys], live.indexes);
  check("function", expected.functions, live.functions);
  check("trigger", expected.triggers, live.triggers);
  check("policy", expected.policies, live.policies);
  check("rls", expected.rlsTables, live.rlsTables);
  return missing;
}

export function createManagementApiExecutor(opts: {
  accessToken: string;
  projectRef: string;
  readOnly?: boolean;
}): SqlExecutor {
  const path = opts.readOnly ? "database/query/read-only" : "database/query";
  const url = `https://api.supabase.com/v1/projects/${opts.projectRef}/${path}`;
  return {
    async query<T extends SqlRow = SqlRow>(sql: string): Promise<T[]> {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      let body: unknown = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      if (!res.ok) {
        const message =
          body && typeof body === "object" && body !== null && "message" in body
            ? String((body as { message: unknown }).message)
            : text.slice(0, 400);
        throw new Error(`Supabase SQL ${res.status}: ${message}`);
      }
      if (Array.isArray(body)) return body as T[];
      if (body && typeof body === "object" && Array.isArray((body as { rows?: unknown }).rows)) {
        return (body as { rows: T[] }).rows;
      }
      return [];
    },
  };
}
