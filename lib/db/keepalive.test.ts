import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  DEFAULT_KEEPALIVE_PROJECT_REF,
  DEFAULT_KEEPALIVE_SUPABASE_URL,
  KEEPALIVE_CRON,
  KEEPALIVE_LIMIT,
  KEEPALIVE_SELECT,
  KEEPALIVE_TABLE,
  KEEPALIVE_WORKFLOW_PATH,
  buildKeepaliveRequest,
  formatKeepaliveRecord,
  isDailyCron,
  keepaliveQueryLabel,
  keepaliveRestPath,
  resolveKeepaliveEnv,
  runKeepalive,
} from "./keepalive.ts";

test("keepalive query is a single-column PostgREST read with limit 1", () => {
  const path = keepaliveRestPath();
  assert.equal(path, `/rest/v1/${KEEPALIVE_TABLE}?select=${KEEPALIVE_SELECT}&limit=${KEEPALIVE_LIMIT}`);
  assert.equal(KEEPALIVE_TABLE, "app_users");
  assert.equal(KEEPALIVE_SELECT, "id");
  assert.equal(KEEPALIVE_LIMIT, 1);
  assert.doesNotMatch(path, /select=\*/);
  assert.equal(keepaliveQueryLabel(), `GET ${path}`);
});

test("resolveKeepaliveEnv prefers explicit URL/key and falls back to live project URL", () => {
  const resolved = resolveKeepaliveEnv({
    SUPABASE_URL: "https://abc123.supabase.co/",
    SUPABASE_ANON_KEY: "anon-key",
    NEXT_PUBLIC_SUPABASE_URL: "https://ignored.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "ignored",
  });
  assert.deepEqual(resolved, {
    supabaseUrl: "https://abc123.supabase.co",
    apiKey: "anon-key",
  });

  const fallback = resolveKeepaliveEnv({
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon",
  });
  assert.equal(fallback.supabaseUrl, DEFAULT_KEEPALIVE_SUPABASE_URL);
  assert.equal(fallback.supabaseUrl.includes(DEFAULT_KEEPALIVE_PROJECT_REF), true);
  assert.equal(fallback.apiKey, "public-anon");
});

test("resolveKeepaliveEnv rejects missing keys and non-supabase hosts", () => {
  assert.throws(() => resolveKeepaliveEnv({}), /SUPABASE_ANON_KEY/);
  assert.throws(
    () =>
      resolveKeepaliveEnv({
        SUPABASE_URL: "https://example.com",
        SUPABASE_ANON_KEY: "x",
      }),
    /SUPABASE_URL/,
  );
});

test("buildKeepaliveRequest never embeds a wildcard select", () => {
  const req = buildKeepaliveRequest({
    supabaseUrl: DEFAULT_KEEPALIVE_SUPABASE_URL,
    apiKey: "test-anon",
  });
  assert.equal(req.method, "GET");
  assert.equal(req.url, `${DEFAULT_KEEPALIVE_SUPABASE_URL}${keepaliveRestPath()}`);
  assert.equal(req.headers.apikey, "test-anon");
  assert.equal(req.headers.Authorization, "Bearer test-anon");
  assert.equal(req.headers.Prefer, "count=none");
  assert.doesNotMatch(req.url, /select=\*/);
});

test("runKeepalive treats 200 + empty RLS array as success and records the ping", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const result = await runKeepalive({
    supabaseUrl: DEFAULT_KEEPALIVE_SUPABASE_URL,
    apiKey: "test-anon",
    now: () => "2026-09-11T20:17:00.000Z",
    source: "github-actions",
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${DEFAULT_KEEPALIVE_SUPABASE_URL}${keepaliveRestPath()}`);
  assert.deepEqual(result, {
    ok: true,
    pingedAt: "2026-09-11T20:17:00.000Z",
    httpStatus: 200,
    rowCount: 0,
    query: keepaliveQueryLabel(),
    projectHost: "jlahwwnjbhqfnsicdjsx.supabase.co",
    source: "github-actions",
  });
  const record = formatKeepaliveRecord(result);
  assert.match(record, /"pingedAt":"2026-09-11T20:17:00.000Z"/);
  assert.match(record, /"query":"GET \/rest\/v1\/app_users\?select=id&limit=1"/);
});

test("runKeepalive fails closed on HTTP errors", async () => {
  await assert.rejects(
    () =>
      runKeepalive({
        supabaseUrl: DEFAULT_KEEPALIVE_SUPABASE_URL,
        apiKey: "bad",
        fetchImpl: async () => new Response("unauthorized", { status: 401 }),
      }),
    /Keepalive 401/,
  );
});

test("KEEPALIVE_CRON is daily so a week without users still gets a DB hit", () => {
  assert.equal(isDailyCron(KEEPALIVE_CRON), true);
  assert.equal(isDailyCron("17 20 * * *"), true);
  assert.equal(isDailyCron("0 0 * * 1"), false);
  assert.equal(isDailyCron("0 0 1 * *"), false);
  assert.equal(isDailyCron("@daily"), false);
});

test("github workflow schedules the same daily cron and leaves a run record", () => {
  const yaml = readFileSync(join(process.cwd(), KEEPALIVE_WORKFLOW_PATH), "utf8");
  assert.match(yaml, new RegExp(`cron:\\s*["']${KEEPALIVE_CRON.replace(/\*/g, "\\*")}["']`));
  assert.match(yaml, /workflow_dispatch/);
  assert.match(yaml, /curl /);
  assert.match(yaml, /\/rest\/v1\/app_users\?select=id&limit=1/);
  assert.match(yaml, /Prefer: count=none/);
  assert.doesNotMatch(yaml, /tsx scripts\/db-keepalive\.ts/);
  assert.doesNotMatch(yaml, /npx --yes tsx/);
  assert.doesNotMatch(yaml, /eyJ[A-Za-z0-9_-]{10,}/);
  assert.doesNotMatch(yaml, /sbp_/);
  assert.doesNotMatch(yaml, /service_role/);
  assert.equal(isDailyCron(KEEPALIVE_CRON), true);
});
