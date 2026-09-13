import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { createPgliteExecutor, SUPABASE_AUTH_STUB_SQL } from "./empty-postgres.ts";
import { DEFAULT_MIGRATIONS_DIR, discoverMigrations, inventoryFromMigrations, runMigrations } from "./migrate.ts";

const USER_ID = "11111111-1111-4111-8111-111111111111";

test("0002 drops app_users_update_own and revokes client writes", () => {
  const files = discoverMigrations(DEFAULT_MIGRATIONS_DIR);
  assert.equal(files.some((f) => f.version === "0002"), true);
  const sql = files.find((f) => f.version === "0002")?.sql ?? "";
  assert.match(sql, /drop policy if exists app_users_update_own/i);
  assert.match(sql, /revoke insert, update, delete, truncate on public\.app_users from anon, authenticated/i);
  const combined = inventoryFromMigrations(files);
  assert.ok(combined.policies.includes("app_users_select_own"));
});

test("JWT/authenticated 角色无法 UPDATE app_users.tier", { timeout: 60_000 }, async () => {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  try {
    await db.exec(SUPABASE_AUTH_STUB_SQL);
    const executor = createPgliteExecutor(db);
    const applied = await runMigrations(executor, DEFAULT_MIGRATIONS_DIR);
    assert.ok(applied.applied.includes("0002"));

    const policies = await executor.query<{ policyname: string }>(
      "select policyname from pg_policies where tablename = 'app_users' order by policyname",
    );
    assert.deepEqual(
      policies.map((p) => p.policyname),
      ["app_users_select_own"],
    );

    await db.exec(`
      insert into auth.users (id, email) values ('${USER_ID}', 'rls@users.invalid');
    `);

    await db.exec("grant authenticated to postgres");
    await db.exec("set role authenticated");
    let denied = false;
    let message = "";
    try {
      await db.exec(`update public.app_users set tier = 'pro' where id = '${USER_ID}'`);
    } catch (error) {
      denied = true;
      message = error instanceof Error ? error.message : String(error);
    }
    await db.exec("reset role");
    assert.equal(denied, true, "authenticated UPDATE tier must be rejected");
    assert.match(message, /permission denied|row-level security|violates/i);

    const rows = await executor.query<{ tier: string }>(
      `select tier from public.app_users where id = '${USER_ID}'`,
    );
    assert.equal(rows[0]?.tier, "free");
  } finally {
    await db.close();
  }
});

test("0002 migration file is tracked next to 0001", () => {
  const sql = readFileSync(join(process.cwd(), "supabase/migrations/0002_app_users_no_client_update.sql"), "utf8");
  assert.match(sql, /app_users_update_own/);
});
