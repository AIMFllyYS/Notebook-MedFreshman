/**
 * Daily Supabase keepalive: one PostgREST row read so a Free-plan project
 * is not paused after 7 days with no real users.
 *
 * Official bar is "a few user database requests each day". Auth /health
 * does not count — the request must reach Postgres. This module issues
 * `GET /rest/v1/app_users?select=id&limit=1` (one column, one row, RLS
 * may return []). GitHub Actions cron is the scheduler (must live on
 * default branch `master`). The workflow curls this same path so master
 * does not need `scripts/db-keepalive.ts`. Workflow runs plus stdout JSON
 * are the audit trail.
 */
export const DEFAULT_KEEPALIVE_PROJECT_REF = "jlahwwnjbhqfnsicdjsx";
export const DEFAULT_KEEPALIVE_SUPABASE_URL = `https://${DEFAULT_KEEPALIVE_PROJECT_REF}.supabase.co`;

export const KEEPALIVE_TABLE = "app_users";
export const KEEPALIVE_SELECT = "id";
export const KEEPALIVE_LIMIT = 1;
export const KEEPALIVE_TIMEOUT_MS = 15_000;

/** Daily at 20:17 UTC. Odd minute avoids the top-of-hour stampede. */
export const KEEPALIVE_CRON = "17 20 * * *";
export const KEEPALIVE_WORKFLOW_PATH = ".github/workflows/supabase-keepalive.yml";

export interface KeepaliveEnv {
  supabaseUrl: string;
  apiKey: string;
}

export interface KeepaliveRequest {
  method: "GET";
  url: string;
  headers: Record<string, string>;
}

export interface KeepaliveResult {
  ok: true;
  pingedAt: string;
  httpStatus: number;
  rowCount: number;
  query: string;
  projectHost: string;
  source: string;
}

export function keepaliveRestPath(): string {
  return `/rest/v1/${KEEPALIVE_TABLE}?select=${KEEPALIVE_SELECT}&limit=${KEEPALIVE_LIMIT}`;
}

export function keepaliveQueryLabel(): string {
  return `GET ${keepaliveRestPath()}`;
}

/**
 * True when a 5-field cron fires every calendar day (any minute/hour).
 * Used to prove the 7-day pause window is covered without waiting a week.
 */
export function isDailyCron(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  if ([minute, hour, dayOfMonth, month, dayOfWeek].some((part) => part === "")) return false;
  return dayOfMonth === "*" && month === "*" && dayOfWeek === "*";
}

export function resolveKeepaliveEnv(
  env: NodeJS.ProcessEnv = process.env,
): KeepaliveEnv {
  const supabaseUrl = (
    env.SUPABASE_URL?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    DEFAULT_KEEPALIVE_SUPABASE_URL
  ).replace(/\/+$/, "");

  const apiKey =
    env.SUPABASE_ANON_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";

  if (!apiKey) {
    throw new Error(
      "Need SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) {
    throw new Error("SUPABASE_URL must be https://<ref>.supabase.co");
  }
  return { supabaseUrl, apiKey };
}

export function buildKeepaliveRequest(opts: KeepaliveEnv): KeepaliveRequest {
  return {
    method: "GET",
    url: `${opts.supabaseUrl}${keepaliveRestPath()}`,
    headers: {
      apikey: opts.apiKey,
      Authorization: `Bearer ${opts.apiKey}`,
      Accept: "application/json",
      Prefer: "count=none",
    },
  };
}

function projectHostFromUrl(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function parseRowCount(body: string): number {
  if (!body) return 0;
  try {
    const parsed = JSON.parse(body) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export async function runKeepalive(opts: {
  supabaseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
  now?: () => string;
  source?: string;
}): Promise<KeepaliveResult> {
  const request = buildKeepaliveRequest({
    supabaseUrl: opts.supabaseUrl,
    apiKey: opts.apiKey,
  });
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(request.url, {
    method: request.method,
    headers: request.headers,
    signal: AbortSignal.timeout(KEEPALIVE_TIMEOUT_MS),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Keepalive ${res.status}: ${body.slice(0, 240)}`);
  }
  return {
    ok: true,
    pingedAt: opts.now?.() ?? new Date().toISOString(),
    httpStatus: res.status,
    rowCount: parseRowCount(body),
    query: keepaliveQueryLabel(),
    projectHost: projectHostFromUrl(opts.supabaseUrl),
    source: opts.source ?? "cli",
  };
}

export function formatKeepaliveRecord(result: KeepaliveResult): string {
  return `${JSON.stringify(result)}\n`;
}

export function formatKeepaliveSummary(result: KeepaliveResult): string {
  return [
    "## Supabase keepalive",
    "",
    `- ok: \`${result.ok}\``,
    `- pingedAt: \`${result.pingedAt}\``,
    `- query: \`${result.query}\``,
    `- httpStatus: \`${result.httpStatus}\``,
    `- rowCount: \`${result.rowCount}\``,
    `- projectHost: \`${result.projectHost}\``,
    `- source: \`${result.source}\``,
    "",
  ].join("\n");
}
