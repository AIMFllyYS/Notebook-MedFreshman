import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_USAGE_PROJECT_REF,
  DEFAULT_USAGE_RATIO,
  FREE_PLAN_DB_LIMIT_BYTES,
  FREE_PLAN_EGRESS_LIMIT_BYTES,
  buildUsageRecord,
  collectEgressBytes,
  evaluateUsageAlerts,
  fetchProjectUsage,
  formatUsageRecord,
  formatUsageSummary,
  parsePromLines,
} from "./usageAlert.ts";

const SAMPLE_PROM = `
# TYPE node_network_transmit_bytes_total counter
node_network_transmit_bytes_total{device="lo"} 999999
node_network_transmit_bytes_total{device="ens5"} 100
node_network_transmit_bytes_total{device="ens6"} 50
# TYPE db_transmit_bytes counter
db_transmit_bytes 8
`;

test("free-plan watermarks match documented 500MB / 5GB and 80%", () => {
  assert.equal(FREE_PLAN_DB_LIMIT_BYTES, 500 * 1024 * 1024);
  assert.equal(FREE_PLAN_EGRESS_LIMIT_BYTES, 5 * 1024 * 1024 * 1024);
  assert.equal(DEFAULT_USAGE_RATIO, 0.8);
});

test("collectEgressBytes sums non-loopback NIC transmit", () => {
  const lines = parsePromLines(SAMPLE_PROM, "node_network_transmit_bytes_total");
  assert.equal(lines.length, 3);
  assert.deepEqual(collectEgressBytes(SAMPLE_PROM), {
    bytes: 150,
    source: "prometheus:node_network_transmit_bytes_total",
  });
  assert.deepEqual(collectEgressBytes("db_transmit_bytes 42\n"), {
    bytes: 42,
    source: "prometheus:db_transmit_bytes",
  });
});

test("evaluateUsageAlerts breaches at the threshold inclusive", () => {
  const under = evaluateUsageAlerts({
    dbBytes: FREE_PLAN_DB_LIMIT_BYTES * 0.799,
    egressBytes: 0,
  });
  assert.equal(under[0].breached, false);
  assert.equal(under[1].breached, false);

  const dbHit = evaluateUsageAlerts({
    dbBytes: FREE_PLAN_DB_LIMIT_BYTES * 0.8,
    egressBytes: 0,
  });
  assert.equal(dbHit[0].breached, true);
  assert.equal(dbHit[1].breached, false);

  const egressHit = evaluateUsageAlerts({
    dbBytes: 1,
    egressBytes: FREE_PLAN_EGRESS_LIMIT_BYTES,
  });
  assert.equal(egressHit[1].breached, true);
});

test("buildUsageRecord writes a JSON audit line and markdown summary", () => {
  const record = buildUsageRecord(
    {
      collectedAt: "2026-09-12T21:41:00.000Z",
      projectRef: DEFAULT_USAGE_PROJECT_REF,
      dbBytes: 11_496_595,
      dbSource: "pg_database_size",
      egressBytes: 15_456_635,
      egressSource: "prometheus:node_network_transmit_bytes_total",
      apiCounts: { result: [] },
    },
    { source: "github-actions" },
  );
  assert.equal(record.alert, false);
  assert.equal(record.ok, true);
  const line = formatUsageRecord(record);
  assert.match(line, /"collectedAt":"2026-09-12T21:41:00.000Z"/);
  assert.match(line, /"alert":false/);
  const summary = formatUsageSummary(record);
  assert.match(summary, /Supabase usage watermark/);
  assert.match(summary, /11496595/);
});

test("fetchProjectUsage reads SQL size and prometheus egress", async () => {
  const calls: string[] = [];
  const snapshot = await fetchProjectUsage({
    accessToken: "sbp_test",
    projectRef: "abc123",
    now: () => "2026-09-12T21:41:00.000Z",
    fetchImpl: async (url) => {
      const href = String(url);
      calls.push(href);
      if (href.includes("/database/query/read-only")) {
        return new Response(JSON.stringify([{ db_bytes: 2048 }]), { status: 201 });
      }
      if (href.includes("/analytics/endpoints/metrics")) {
        return new Response("node_network_transmit_bytes_total{device=\"ens5\"} 4096\n", {
          status: 200,
        });
      }
      if (href.includes("usage.api-counts")) {
        return new Response(JSON.stringify({ result: [{ timestamp: "t", total_rest_requests: 3 }] }), {
          status: 200,
        });
      }
      return new Response("missing", { status: 404 });
    },
  });
  assert.equal(snapshot.dbBytes, 2048);
  assert.equal(snapshot.egressBytes, 4096);
  assert.equal(snapshot.egressSource, "prometheus:node_network_transmit_bytes_total");
  assert.equal(snapshot.projectRef, "abc123");
  assert.equal(calls.some((u) => u.includes("/database/query/read-only")), true);
  assert.equal(calls.some((u) => u.includes("/analytics/endpoints/metrics")), true);
});
