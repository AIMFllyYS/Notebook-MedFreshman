import {
  CLOUD_SYNC_KINDS,
  KIND_SIZE_LIMIT,
  MAX_USER_SYNC_BYTES,
  type CloudSyncKind,
  type SyncDocumentRow,
} from "./types";
import { payloadByteSize } from "./payload";

export type CloudSyncUsageSource = "cloud" | "local";

export interface CloudSyncKindUsage {
  kind: CloudSyncKind;
  label: string;
  unit: string;
  bytes: number;
  count: number;
  limitBytes: number;
}

export interface CloudSyncUsage {
  source: CloudSyncUsageSource;
  totalBytes: number;
  limitBytes: number;
  kinds: CloudSyncKindUsage[];
  error?: string;
}

export const SYNC_KIND_META: Record<CloudSyncKind, { label: string; unit: string }> = {
  "chat-session": { label: "全部对话", unit: "条" },
  artifact: { label: "演示", unit: "个" },
  document: { label: "文档", unit: "篇" },
};

export function emptyCloudSyncUsage(source: CloudSyncUsageSource, error?: string): CloudSyncUsage {
  return {
    source,
    totalBytes: 0,
    limitBytes: MAX_USER_SYNC_BYTES,
    kinds: CLOUD_SYNC_KINDS.map((kind) => ({
      kind,
      ...SYNC_KIND_META[kind],
      bytes: 0,
      count: 0,
      limitBytes: KIND_SIZE_LIMIT[kind],
    })),
    error,
  };
}

export function summarizeSyncUsage(
  entries: Iterable<{ kind: CloudSyncKind; bytes: number }>,
  source: CloudSyncUsageSource,
  error?: string,
): CloudSyncUsage {
  const usage = emptyCloudSyncUsage(source, error);
  const byKind = new Map(usage.kinds.map((row) => [row.kind, row]));
  for (const entry of entries) {
    const row = byKind.get(entry.kind);
    if (!row || !(entry.bytes > 0) || !Number.isFinite(entry.bytes)) continue;
    row.bytes += entry.bytes;
    row.count += 1;
  }
  usage.totalBytes = usage.kinds.reduce((sum, row) => sum + row.bytes, 0);
  return usage;
}

export function summarizeSyncRows(rows: readonly SyncDocumentRow[], source: CloudSyncUsageSource = "cloud"): CloudSyncUsage {
  return summarizeSyncUsage(
    rows
      .filter((row) => !row.deleted)
      .map((row) => ({ kind: row.kind, bytes: payloadByteSize(row.payload) })),
    source,
  );
}

export function formatSyncBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return kb < 10 ? `${kb.toFixed(1)} KB` : `${Math.round(kb)} KB`;
  }
  return `${(Math.round((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB`;
}
