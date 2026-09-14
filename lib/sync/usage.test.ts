import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyCloudSyncUsage, formatSyncBytes, summarizeSyncRows, summarizeSyncUsage } from "./usage.ts";
import { MAX_USER_SYNC_BYTES } from "./types.ts";

test("formatSyncBytes uses KB and MB without claiming empty usage", () => {
  assert.equal(formatSyncBytes(0), "0 KB");
  assert.equal(formatSyncBytes(512), "512 B");
  assert.equal(formatSyncBytes(1536), "1.5 KB");
  assert.equal(formatSyncBytes(20 * 1024), "20 KB");
  assert.equal(formatSyncBytes(32 * 1024 * 1024), "32.0 MB");
});

test("summarizeSyncRows skips tombstones and totals live kinds", () => {
  const usage = summarizeSyncRows([
    { kind: "chat-session", client_id: "s1", payload: { v: 1, text: "hello" }, deleted: false, updated_at: "t" },
    { kind: "artifact", client_id: "a1", payload: { html: "<p>x</p>" }, deleted: false, updated_at: "t" },
    { kind: "document", client_id: "d1", payload: { id: "d1" }, deleted: true, updated_at: "t" },
  ]);
  assert.equal(usage.source, "cloud");
  assert.equal(usage.limitBytes, MAX_USER_SYNC_BYTES);
  assert.equal(usage.kinds.find((row) => row.kind === "chat-session")?.count, 1);
  assert.equal(usage.kinds.find((row) => row.kind === "artifact")?.count, 1);
  assert.equal(usage.kinds.find((row) => row.kind === "document")?.count, 0);
  assert.ok(usage.totalBytes > 0);
  assert.equal(usage.totalBytes, usage.kinds.reduce((sum, row) => sum + row.bytes, 0));
});

test("summarizeSyncUsage ignores non-finite bytes and keeps empty rows", () => {
  const usage = summarizeSyncUsage(
    [
      { kind: "document", bytes: 100 },
      { kind: "document", bytes: Number.POSITIVE_INFINITY },
    ],
    "local",
  );
  assert.equal(usage.source, "local");
  assert.equal(usage.kinds.find((row) => row.kind === "document")?.count, 1);
  assert.equal(usage.kinds.find((row) => row.kind === "document")?.bytes, 100);
  assert.equal(emptyCloudSyncUsage("cloud").totalBytes, 0);
});
