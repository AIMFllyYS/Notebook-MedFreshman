import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  BACKUP_CRON,
  BACKUP_KIND,
  BACKUP_MAGIC,
  BACKUP_WORKFLOW_PATH,
  CRITICAL_BACKUP_TABLES,
  backupIsDailyCron,
  decryptBackup,
  dumpLogicalFromExecutor,
  dumpTableSql,
  encryptBackup,
  parseDumpRows,
  readEncryptedDump,
  resolveBackupEnv,
  restoreLogicalDump,
  rowCountsOf,
  serializeDump,
  writeEncryptedDump,
} from "./backup.ts";
import { createEmptyPostgres } from "./empty-postgres.ts";
import { runMigrations, type SqlExecutor, type SqlRow } from "./migrate.ts";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CODE_ID = "22222222-2222-4222-8222-222222222222";
const GRANT_ID = "33333333-3333-4333-8333-333333333333";
const LEDGER_ID = "44444444-4444-4444-8444-444444444444";
const REDEEM_ID = "55555555-5555-4555-8555-555555555555";
const FIXTURE_CODE = "TEST-RESTORE-PLUS-001";
const PASSPHRASE = "test-backup-passphrase-not-production";

async function seedFixture(executor: SqlExecutor): Promise<void> {
  try {
    await executor.query("alter table auth.users disable trigger user");
  } catch {
    // optional
  }
  await executor.query(`
insert into auth.users (id, email) values ('${USER_ID}', 'restore-user@example.test');
insert into public.app_users (id, email, tier, period_start, period_end)
values (
  '${USER_ID}',
  'restore-user@example.test',
  'plus',
  '2026-01-01T00:00:00Z',
  '2026-01-31T00:00:00Z'
)
on conflict (id) do update set
  email = excluded.email,
  tier = excluded.tier,
  period_start = excluded.period_start,
  period_end = excluded.period_end;
delete from public.quota_grants;
insert into public.redemption_codes (id, code, tier, months, max_uses, used_count, note)
values ('${CODE_ID}', '${FIXTURE_CODE}', 'plus', 1, 1, 1, 'fixture');
insert into public.quota_grants (
  id, user_id, pool, tier, amount_cny, period_start, period_end, source, redemption_id
) values (
  '${GRANT_ID}',
  '${USER_ID}',
  'platform',
  'plus',
  70.0000,
  '2026-01-01T00:00:00Z',
  '2026-01-31T00:00:00Z',
  'redemption',
  '${REDEEM_ID}'
);
insert into public.usage_ledger (
  id, user_id, occurred_at, pool, route, kind, selected_model_id, actual_model_id,
  prompt_tokens, completion_tokens, cost_cny, request_id, meta
) values (
  '${LEDGER_ID}',
  '${USER_ID}',
  '2026-01-02T12:00:00Z',
  'platform',
  'chat',
  'llm',
  'fixture-model',
  'fixture-model',
  10,
  20,
  1.250000,
  'req-restore-1',
  '{"test":true}'::jsonb
);
insert into public.redemptions (id, code_id, user_id, redeemed_at)
values ('${REDEEM_ID}', '${CODE_ID}', '${USER_ID}', '2026-01-01T00:05:00Z');
`);
}

async function countTable(executor: SqlExecutor, qualified: string): Promise<number> {
  const rows = await executor.query<{ n?: unknown }>(`select count(*)::int as n from ${qualified}`);
  return Number(rows[0]?.n ?? 0);
}

async function scalar(executor: SqlExecutor, sql: string): Promise<SqlRow> {
  const rows = await executor.query(sql);
  return rows[0] ?? {};
}

test("dumpTableSql only accepts schema.table and wraps json_agg", () => {
  assert.equal(
    dumpTableSql("public.app_users"),
    "select coalesce(json_agg(to_json(t)), '[]'::json) as rows from (select * from public.app_users order by 1) t",
  );
  assert.throws(() => dumpTableSql("app_users"), /unqualified/);
  assert.throws(() => dumpTableSql("public.app_users;drop"), /unsafe/);
});

test("parseDumpRows accepts array or JSON-string payloads", () => {
  assert.deepEqual(parseDumpRows([{ rows: [{ id: 1 }] }]), [{ id: 1 }]);
  assert.deepEqual(parseDumpRows([{ rows: "[]" }]), []);
  assert.deepEqual(parseDumpRows([{ rows: JSON.stringify([{ id: "a" }]) }]), [{ id: "a" }]);
  assert.deepEqual(parseDumpRows([]), []);
});

test("resolveBackupEnv requires token and encryption key", () => {
  assert.throws(() => resolveBackupEnv({}), /SUPABASE_ACCESS_TOKEN/);
  assert.throws(
    () => resolveBackupEnv({ SUPABASE_ACCESS_TOKEN: "sbp_x" }),
    /BACKUP_ENCRYPTION_KEY/,
  );
  const resolved = resolveBackupEnv({
    SUPABASE_ACCESS_TOKEN: "sbp_x",
    BACKUP_ENCRYPTION_KEY: "k",
  });
  assert.equal(resolved.projectRef, "jlahwwnjbhqfnsicdjsx");
  assert.equal(resolved.backupDir, "tmp/db-backups");
});

test("encryptBackup hides plaintext and decrypts with the same key", () => {
  const plain = serializeDump({
    version: 1,
    kind: BACKUP_KIND,
    projectRef: "fixture",
    dumpedAt: "2026-01-01T00:00:00.000Z",
    tables: {
      "auth.users": [],
      "public.app_users": [],
      "public.quota_grants": [],
      "public.usage_ledger": [],
      "public.redemption_codes": [{ code: FIXTURE_CODE }],
      "public.redemptions": [],
    },
  });
  const blob = encryptBackup(plain, PASSPHRASE);
  assert.equal(blob.subarray(0, 4).toString("utf8"), BACKUP_MAGIC);
  assert.equal(blob.includes(Buffer.from(FIXTURE_CODE)), false);
  assert.equal(decryptBackup(blob, PASSPHRASE), plain);
  assert.throws(() => decryptBackup(blob, "wrong-key"), /Unsupported state|unable to authenticate|bad decrypt|unable/i);
});

test("PGlite dump encrypt restore covers account quota ledger codes", { timeout: 60_000 }, async () => {
  const source = await createEmptyPostgres();
  let dump;
  try {
    await runMigrations(source.executor);
    await seedFixture(source.executor);
    dump = await dumpLogicalFromExecutor(source.executor, {
      projectRef: "fixture",
      dumpedAt: "2026-01-03T00:00:00.000Z",
    });
  } finally {
    await source.close();
  }

  assert.deepEqual(rowCountsOf(dump), {
    "auth.users": 1,
    "public.app_users": 1,
    "public.quota_grants": 1,
    "public.usage_ledger": 1,
    "public.redemption_codes": 1,
    "public.redemptions": 1,
  });
  assert.equal(dump.tables["public.redemption_codes"][0]?.code, FIXTURE_CODE);
  assert.equal(dump.tables["public.app_users"][0]?.tier, "plus");
  assert.equal(Number(dump.tables["public.quota_grants"][0]?.amount_cny), 70);
  assert.equal(Number(dump.tables["public.usage_ledger"][0]?.cost_cny), 1.25);

  const dir = mkdtempSync(join(tmpdir(), "srp-backup-"));
  const meta = writeEncryptedDump(dump, PASSPHRASE, dir);
  const onDisk = readFileSync(meta.path);
  assert.equal(onDisk.includes(Buffer.from(FIXTURE_CODE)), false);
  assert.equal(meta.ciphertextBytes, onDisk.length);
  const loaded = readEncryptedDump(meta.path, PASSPHRASE);

  const dest = await createEmptyPostgres();
  try {
    await runMigrations(dest.executor);
    const result = await restoreLogicalDump(dest.executor, loaded);
    assert.deepEqual(result.restored, rowCountsOf(dump));
    for (const table of CRITICAL_BACKUP_TABLES) {
      assert.equal(await countTable(dest.executor, table), 1, table);
    }
    const user = await scalar(dest.executor, `select email, tier from public.app_users where id = '${USER_ID}'`);
    assert.equal(user.email, "restore-user@example.test");
    assert.equal(user.tier, "plus");
    const grant = await scalar(dest.executor, `select amount_cny::text as amount, source from public.quota_grants where id = '${GRANT_ID}'`);
    assert.equal(Number(grant.amount), 70);
    assert.equal(grant.source, "redemption");
    const ledger = await scalar(dest.executor, `select cost_cny::text as cost, request_id from public.usage_ledger where id = '${LEDGER_ID}'`);
    assert.equal(Number(ledger.cost), 1.25);
    assert.equal(ledger.request_id, "req-restore-1");
    const code = await scalar(dest.executor, `select code, used_count from public.redemption_codes where id = '${CODE_ID}'`);
    assert.equal(code.code, FIXTURE_CODE);
    assert.equal(Number(code.used_count), 1);
    const redeem = await scalar(dest.executor, `select user_id from public.redemptions where id = '${REDEEM_ID}'`);
    assert.equal(redeem.user_id, USER_ID);
  } finally {
    await dest.close();
  }
});

test("github backup workflow is daily self-contained and stores ciphertext outside supabase", () => {
  const yaml = readFileSync(join(process.cwd(), BACKUP_WORKFLOW_PATH), "utf8");
  assert.equal(backupIsDailyCron(BACKUP_CRON), true);
  assert.match(yaml, new RegExp(`cron:\\s*["']${BACKUP_CRON.replace(/\*/g, "\\*")}["']`));
  assert.match(yaml, /workflow_dispatch/);
  assert.match(yaml, /api\.supabase\.com\/v1\/projects\//);
  assert.match(yaml, /database\/query\/read-only/);
  assert.match(yaml, /openssl enc -aes-256-cbc/);
  assert.match(yaml, /actions\/upload-artifact/);
  assert.match(yaml, /node_network_transmit_bytes_total/);
  assert.match(yaml, /pg_database_size/);
  assert.match(yaml, /500 \* 1024 \* 1024/);
  assert.match(yaml, /5 \* 1024 \* 1024 \* 1024/);
  assert.doesNotMatch(yaml, /tsx scripts\/db-backup\.ts/);
  assert.doesNotMatch(yaml, /npx --yes tsx/);
  assert.doesNotMatch(yaml, /eyJ[A-Za-z0-9_-]{10,}/);
  assert.doesNotMatch(yaml, /sbp_/);
  assert.doesNotMatch(yaml, /TEST-RESTORE-PLUS-001/);
});
