/**
 * Free-plan capacity / egress watermark.
 *
 * Database size is exact: `pg_database_size(current_database())` via the
 * Management API. Unified billing egress is not exposed on a personal
 * access token; we proxy outbound bytes from the project Prometheus
 * scrape (`node_network_transmit_bytes_total`, non-loopback).
 *
 * Alerts are a JSON line + workflow summary. Crossing the ratio fails
 * the scheduled job so GitHub emails the repo owner.
 */
function managementUrl(projectRef: string, path: string): string {
  return `https://api.supabase.com/v1/projects/${projectRef}${path}`;
}

async function postSql(opts: {
  accessToken: string;
  projectRef: string;
  sql: string;
  fetchImpl: typeof fetch;
}): Promise<unknown> {
  const res = await opts.fetchImpl(
    managementUrl(opts.projectRef, "/database/query/read-only"),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: opts.sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Usage SQL ${res.status}: ${text.slice(0, 240)}`);
  return text ? JSON.parse(text) : [];
}

export const DEFAULT_USAGE_PROJECT_REF = "jlahwwnjbhqfnsicdjsx";
export const FREE_PLAN_DB_LIMIT_BYTES = 500 * 1024 * 1024;
export const FREE_PLAN_EGRESS_LIMIT_BYTES = 5 * 1024 * 1024 * 1024;
export const DEFAULT_USAGE_RATIO = 0.8;
export const USAGE_METRICS_PATH = "/analytics/endpoints/metrics";
export const USAGE_API_COUNTS_PATH = "/analytics/endpoints/usage.api-counts?interval=1day";
export const DB_SIZE_SQL = "select pg_database_size(current_database())::bigint as db_bytes";

export type UsageMetric = "database" | "egress";

export interface UsageSnapshot {
  collectedAt: string;
  projectRef: string;
  dbBytes: number;
  dbSource: "pg_database_size";
  egressBytes: number;
  egressSource: string;
  apiCounts: unknown;
}

export interface UsageAlert {
  metric: UsageMetric;
  usedBytes: number;
  limitBytes: number;
  ratio: number;
  threshold: number;
  breached: boolean;
}

export interface UsageRecord {
  ok: true;
  collectedAt: string;
  projectRef: string;
  source: string;
  dbBytes: number;
  dbLimitBytes: number;
  dbRatio: number;
  egressBytes: number;
  egressLimitBytes: number;
  egressRatio: number;
  egressSource: string;
  apiCounts: unknown;
  alerts: UsageAlert[];
  alert: boolean;
}

export function parsePromLines(
  text: string,
  metricName: string,
): { labels: Record<string, string>; value: number }[] {
  const out: { labels: Record<string, string>; value: number }[] = [];
  const prefix = `${metricName}`;
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    if (!line.startsWith(prefix)) continue;
    const rest = line.slice(prefix.length);
    if (rest[0] !== "{" && rest[0] !== " " && rest[0] !== "\t") continue;
    let labels: Record<string, string> = {};
    let valueText = rest.trim();
    if (rest.startsWith("{")) {
      const end = rest.indexOf("}");
      if (end < 0) continue;
      const raw = rest.slice(1, end);
      labels = {};
      for (const part of raw.split(",")) {
        const eq = part.indexOf("=");
        if (eq < 0) continue;
        const key = part.slice(0, eq).trim();
        let val = part.slice(eq + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        labels[key] = val;
      }
      valueText = rest.slice(end + 1).trim();
    }
    const value = Number(valueText.split(/\s+/)[0]);
    if (!Number.isFinite(value)) continue;
    out.push({ labels, value });
  }
  return out;
}

export function sumPromMetric(
  text: string,
  metricName: string,
  keep?: (labels: Record<string, string>) => boolean,
): number {
  return parsePromLines(text, metricName).reduce((acc, row) => {
    if (keep && !keep(row.labels)) return acc;
    return acc + row.value;
  }, 0);
}

export function collectEgressBytes(metricsText: string): { bytes: number; source: string } {
  const nic = sumPromMetric(
    metricsText,
    "node_network_transmit_bytes_total",
    (labels) => labels.device !== "lo",
  );
  if (nic > 0) {
    return { bytes: nic, source: "prometheus:node_network_transmit_bytes_total" };
  }
  const dbTx = sumPromMetric(metricsText, "db_transmit_bytes");
  return { bytes: dbTx, source: "prometheus:db_transmit_bytes" };
}

export function evaluateUsageAlerts(
  snapshot: Pick<UsageSnapshot, "dbBytes" | "egressBytes">,
  opts?: { dbLimit?: number; egressLimit?: number; threshold?: number },
): UsageAlert[] {
  const dbLimit = opts?.dbLimit ?? FREE_PLAN_DB_LIMIT_BYTES;
  const egressLimit = opts?.egressLimit ?? FREE_PLAN_EGRESS_LIMIT_BYTES;
  const threshold = opts?.threshold ?? DEFAULT_USAGE_RATIO;
  const make = (metric: UsageMetric, used: number, limit: number): UsageAlert => {
    const ratio = limit > 0 ? used / limit : 0;
    return {
      metric,
      usedBytes: used,
      limitBytes: limit,
      ratio,
      threshold,
      breached: ratio >= threshold,
    };
  };
  return [
    make("database", snapshot.dbBytes, dbLimit),
    make("egress", snapshot.egressBytes, egressLimit),
  ];
}

export function buildUsageRecord(
  snapshot: UsageSnapshot,
  opts?: { source?: string; threshold?: number },
): UsageRecord {
  const alerts = evaluateUsageAlerts(snapshot, { threshold: opts?.threshold });
  const db = alerts.find((a) => a.metric === "database")!;
  const egress = alerts.find((a) => a.metric === "egress")!;
  return {
    ok: true,
    collectedAt: snapshot.collectedAt,
    projectRef: snapshot.projectRef,
    source: opts?.source ?? "cli",
    dbBytes: snapshot.dbBytes,
    dbLimitBytes: db.limitBytes,
    dbRatio: db.ratio,
    egressBytes: snapshot.egressBytes,
    egressLimitBytes: egress.limitBytes,
    egressRatio: egress.ratio,
    egressSource: snapshot.egressSource,
    apiCounts: snapshot.apiCounts,
    alerts,
    alert: alerts.some((a) => a.breached),
  };
}

export function formatUsageRecord(record: UsageRecord): string {
  return `${JSON.stringify(record)}\n`;
}

export function formatUsageSummary(record: UsageRecord): string {
  const pct = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;
  return [
    "## Supabase usage watermark",
    "",
    `- alert: \`${record.alert}\``,
    `- collectedAt: \`${record.collectedAt}\``,
    `- projectRef: \`${record.projectRef}\``,
    `- database: \`${record.dbBytes}\` / \`${record.dbLimitBytes}\` (${pct(record.dbRatio)})`,
    `- egress: \`${record.egressBytes}\` / \`${record.egressLimitBytes}\` (${pct(record.egressRatio)})`,
    `- egressSource: \`${record.egressSource}\``,
    `- source: \`${record.source}\``,
    "",
  ].join("\n");
}

async function readJson(
  url: string,
  accessToken: string,
  fetchImpl: typeof fetch,
): Promise<unknown> {
  const res = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Usage GET ${res.status}: ${text.slice(0, 240)}`);
  return text ? JSON.parse(text) : null;
}

export async function fetchProjectUsage(opts: {
  accessToken: string;
  projectRef: string;
  fetchImpl?: typeof fetch;
  now?: () => string;
}): Promise<UsageSnapshot> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const sqlBody = await postSql({
    accessToken: opts.accessToken,
    projectRef: opts.projectRef,
    sql: DB_SIZE_SQL,
    fetchImpl,
  });
  const sqlRows = Array.isArray(sqlBody) ? sqlBody : [];
  const dbBytes = Number((sqlRows[0] as { db_bytes?: unknown } | undefined)?.db_bytes ?? 0);

  const metricsRes = await fetchImpl(managementUrl(opts.projectRef, USAGE_METRICS_PATH), {
    headers: { Authorization: `Bearer ${opts.accessToken}` },
  });
  const metricsText = await metricsRes.text();
  if (!metricsRes.ok) throw new Error(`Usage metrics ${metricsRes.status}: ${metricsText.slice(0, 240)}`);

  let apiCounts: unknown = null;
  try {
    apiCounts = await readJson(
      managementUrl(opts.projectRef, USAGE_API_COUNTS_PATH),
      opts.accessToken,
      fetchImpl,
    );
  } catch {
    apiCounts = null;
  }

  const egress = collectEgressBytes(metricsText);
  return {
    collectedAt: opts.now?.() ?? new Date().toISOString(),
    projectRef: opts.projectRef,
    dbBytes,
    dbSource: "pg_database_size",
    egressBytes: egress.bytes,
    egressSource: egress.source,
    apiCounts,
  };
}
