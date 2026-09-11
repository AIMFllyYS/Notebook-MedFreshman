/**
 * Logical dump / restore for the membership tables that Free-plan
 * Supabase does not back up. No SUPABASE_DB_URL: export goes through
 * the Management API SQL endpoint, then AES-256-GCM encryption.
 *
 * Restore is for fixture / empty Postgres only. The CLI refuses a live
 * target so a bad run cannot wipe production.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createManagementApiExecutor, type SqlExecutor, type SqlRow } from "./migrate.ts";
import { isDailyCron } from "./keepalive.ts";

export const DEFAULT_BACKUP_PROJECT_REF = "jlahwwnjbhqfnsicdjsx";

/** Daily at 21:41 UTC. Offset from keepalive (20:17) so the two jobs do not overlap. */
export const BACKUP_CRON = "41 21 * * *";
export const BACKUP_WORKFLOW_PATH = ".github/workflows/supabase-backup.yml";

export const BACKUP_KIND = "studyreview-logical-dump";
export const BACKUP_VERSION = 1;
export const BACKUP_MAGIC = "SRP1";
export const BACKUP_CIPHER = "aes-256-gcm";
export const BACKUP_KEY_LEN = 32;
export const BACKUP_SALT_LEN = 16;
export const BACKUP_IV_LEN = 12;
export const BACKUP_TAG_LEN = 16;

export const CRITICAL_BACKUP_TABLES = [
  "auth.users",
  "public.app_users",
  "public.quota_grants",
  "public.usage_ledger",
  "public.redemption_codes",
  "public.redemptions",
] as const;

export interface LogicalDump {
  version: typeof BACKUP_VERSION;
  kind: typeof BACKUP_KIND;
  projectRef: string;
  dumpedAt: string;
  tables: Record<string, SqlRow[]>;
}

export interface RestoreResult {
  restored: Record<string, number>;
}

export interface BackupFileMeta {
  path: string;
  ciphertextBytes: number;
  rowCounts: Record<string, number>;
  dumpedAt: string;
  projectRef: string;
}

export function backupIsDailyCron(expr: string): boolean {
  return isDailyCron(expr);
}

export function dumpTableSql(qualified: string): string {
  if (!/^[a-z_]+\.[a-z_]+$/.test(qualified)) {
    throw new Error(`Refusing to dump unqualified or unsafe table name: ${qualified}`);
  }
  return `select coalesce(json_agg(to_json(t)), '[]'::json) as rows from (select * from ${qualified} order by 1) t`;
}

export function tableColumnsSql(schema: string, table: string): string {
  if (!/^[a-z_]+$/.test(schema) || !/^[a-z_]+$/.test(table)) {
    throw new Error(`Unsafe schema/table: ${schema}.${table}`);
  }
  return `
select column_name
from information_schema.columns
where table_schema = '${schema}' and table_name = '${table}'
order by ordinal_position
`.trim();
}

export function parseDumpRows(body: unknown): SqlRow[] {
  const row = Array.isArray(body) ? body[0] : body;
  if (!row || typeof row !== "object") return [];
  const raw = (row as { rows?: unknown }).rows;
  if (Array.isArray(raw)) return raw as SqlRow[];
  if (typeof raw === "string") {
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SqlRow[]) : [];
  }
  return [];
}

export function emptyLogicalDump(opts: {
  projectRef: string;
  dumpedAt: string;
}): LogicalDump {
  const tables: Record<string, SqlRow[]> = {};
  for (const name of CRITICAL_BACKUP_TABLES) tables[name] = [];
  return {
    version: BACKUP_VERSION,
    kind: BACKUP_KIND,
    projectRef: opts.projectRef,
    dumpedAt: opts.dumpedAt,
    tables,
  };
}

export function rowCountsOf(dump: LogicalDump): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const name of CRITICAL_BACKUP_TABLES) {
    counts[name] = dump.tables[name]?.length ?? 0;
  }
  return counts;
}

export function assertCriticalTables(dump: LogicalDump): void {
  if (dump.kind !== BACKUP_KIND || dump.version !== BACKUP_VERSION) {
    throw new Error("Not a StudyReview logical dump");
  }
  for (const name of CRITICAL_BACKUP_TABLES) {
    if (!Array.isArray(dump.tables[name])) {
      throw new Error(`Dump missing table ${name}`);
    }
  }
}

export function serializeDump(dump: LogicalDump): string {
  assertCriticalTables(dump);
  return `${JSON.stringify(dump)}\n`;
}

export function deserializeDump(raw: string): LogicalDump {
  const parsed = JSON.parse(raw) as LogicalDump;
  assertCriticalTables(parsed);
  return parsed;
}

export function encryptBackup(plaintext: string, passphrase: string): Buffer {
  if (!passphrase) throw new Error("Need BACKUP_ENCRYPTION_KEY");
  const salt = randomBytes(BACKUP_SALT_LEN);
  const iv = randomBytes(BACKUP_IV_LEN);
  const key = scryptSync(passphrase, salt, BACKUP_KEY_LEN);
  const cipher = createCipheriv(BACKUP_CIPHER, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from(BACKUP_MAGIC), salt, iv, tag, ciphertext]);
}

export function decryptBackup(blob: Buffer, passphrase: string): string {
  if (!passphrase) throw new Error("Need BACKUP_ENCRYPTION_KEY");
  if (blob.length < 4 + BACKUP_SALT_LEN + BACKUP_IV_LEN + BACKUP_TAG_LEN) {
    throw new Error("Ciphertext too short");
  }
  const magic = blob.subarray(0, 4).toString("utf8");
  if (magic !== BACKUP_MAGIC) throw new Error("Unknown backup envelope");
  const salt = blob.subarray(4, 4 + BACKUP_SALT_LEN);
  const iv = blob.subarray(4 + BACKUP_SALT_LEN, 4 + BACKUP_SALT_LEN + BACKUP_IV_LEN);
  const tag = blob.subarray(
    4 + BACKUP_SALT_LEN + BACKUP_IV_LEN,
    4 + BACKUP_SALT_LEN + BACKUP_IV_LEN + BACKUP_TAG_LEN,
  );
  const ciphertext = blob.subarray(4 + BACKUP_SALT_LEN + BACKUP_IV_LEN + BACKUP_TAG_LEN);
  const key = scryptSync(passphrase, salt, BACKUP_KEY_LEN);
  const decipher = createDecipheriv(BACKUP_CIPHER, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function splitQualified(qualified: string): { schema: string; table: string } {
  const [schema, table] = qualified.split(".");
  if (!schema || !table) throw new Error(`Not a qualified table: ${qualified}`);
  return { schema, table };
}

export async function dumpLogicalFromExecutor(
  executor: SqlExecutor,
  opts: { projectRef: string; dumpedAt?: string },
): Promise<LogicalDump> {
  const dump = emptyLogicalDump({
    projectRef: opts.projectRef,
    dumpedAt: opts.dumpedAt ?? new Date().toISOString(),
  });
  for (const name of CRITICAL_BACKUP_TABLES) {
    const rows = parseDumpRows(await executor.query(dumpTableSql(name)));
    dump.tables[name] = rows;
  }
  return dump;
}

export async function dumpLogicalFromManagementApi(opts: {
  accessToken: string;
  projectRef: string;
  now?: () => string;
}): Promise<LogicalDump> {
  const executor = createManagementApiExecutor({
    accessToken: opts.accessToken,
    projectRef: opts.projectRef,
    readOnly: true,
  });
  return dumpLogicalFromExecutor(executor, {
    projectRef: opts.projectRef,
    dumpedAt: opts.now?.(),
  });
}

function dollarQuote(value: string): string {
  let n = 0;
  while (value.includes(`$d${n}$`)) n += 1;
  return `$d${n}$${value}$d${n}$`;
}

async function existingColumns(
  executor: SqlExecutor,
  schema: string,
  table: string,
): Promise<string[]> {
  const rows = await executor.query<{ column_name?: string }>(tableColumnsSql(schema, table));
  return rows.map((row) => String(row.column_name ?? "")).filter(Boolean);
}

export async function restoreLogicalDump(
  executor: SqlExecutor,
  dump: LogicalDump,
): Promise<RestoreResult> {
  assertCriticalTables(dump);
  const restored: Record<string, number> = {};
  try {
    await executor.query("alter table auth.users disable trigger user");
  } catch {
    // PGlite / stub may not support DISABLE TRIGGER; inserts still work.
  }
  try {
    for (const name of CRITICAL_BACKUP_TABLES) {
      const rows = dump.tables[name] ?? [];
      restored[name] = 0;
      if (rows.length === 0) continue;
      const { schema, table } = splitQualified(name);
      const have = new Set(await existingColumns(executor, schema, table));
      const cols = Object.keys(rows[0]).filter((col) => have.has(col));
      if (cols.length === 0) {
        throw new Error(`No overlapping columns to restore ${name}`);
      }
      const json = JSON.stringify(rows);
      const sql = [
        `insert into ${name} (${cols.join(", ")})`,
        `select ${cols.join(", ")}`,
        `from json_populate_recordset(null::${name}, ${dollarQuote(json)}::json)`,
      ].join("\n");
      await executor.query(sql);
      restored[name] = rows.length;
    }
  } finally {
    try {
      await executor.query("alter table auth.users enable trigger user");
    } catch {
      // ignore
    }
  }
  return { restored };
}

export function backupFileName(dumpedAt: string): string {
  const stamp = dumpedAt.replace(/[:.]/g, "").replace(/Z$/, "Z");
  return `studyreview-${stamp}.srp1`;
}

export function writeEncryptedDump(
  dump: LogicalDump,
  passphrase: string,
  dir: string,
): BackupFileMeta {
  const plaintext = serializeDump(dump);
  const ciphertext = encryptBackup(plaintext, passphrase);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, backupFileName(dump.dumpedAt));
  writeFileSync(path, ciphertext);
  return {
    path,
    ciphertextBytes: ciphertext.length,
    rowCounts: rowCountsOf(dump),
    dumpedAt: dump.dumpedAt,
    projectRef: dump.projectRef,
  };
}

export function readEncryptedDump(path: string, passphrase: string): LogicalDump {
  return deserializeDump(decryptBackup(readFileSync(path), passphrase));
}

export function resolveBackupEnv(env: NodeJS.ProcessEnv = process.env): {
  accessToken: string;
  projectRef: string;
  encryptionKey: string;
  backupDir: string;
} {
  const accessToken = env.SUPABASE_ACCESS_TOKEN?.trim() ?? "";
  const projectRef =
    env.SUPABASE_PROJECT_REF?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ||
    DEFAULT_BACKUP_PROJECT_REF;
  const encryptionKey = env.BACKUP_ENCRYPTION_KEY?.trim() ?? "";
  const backupDir = env.BACKUP_DIR?.trim() || "tmp/db-backups";
  if (!accessToken) throw new Error("Need SUPABASE_ACCESS_TOKEN");
  if (!encryptionKey) throw new Error("Need BACKUP_ENCRYPTION_KEY");
  return { accessToken, projectRef, encryptionKey, backupDir };
}
