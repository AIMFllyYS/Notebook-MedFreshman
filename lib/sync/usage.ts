import {
  CLOUD_SYNC_KINDS,
  KIND_QUOTA_POOL,
  KIND_SIZE_LIMIT,
  MAX_USER_SYNC_BYTES,
  POOL_SIZE_LIMIT,
  type CloudSyncKind,
  type SyncDocumentRow,
  type SyncQuotaPool,
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

export interface CloudSyncPoolUsage {
  id: SyncQuotaPool;
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
  pools: CloudSyncPoolUsage[];
  error?: string;
}

export const SYNC_KIND_META: Record<CloudSyncKind, { label: string; unit: string }> = {
  "chat-session": { label: "全部对话", unit: "条" },
  artifact: { label: "演示", unit: "个" },
  document: { label: "文档", unit: "篇" },
  "user-note": { label: "个人笔记", unit: "篇" },
  "review-card": { label: "复习闪卡", unit: "张" },
  "chat-project": { label: "对话项目", unit: "个" },
};

export const SYNC_POOL_META: Record<SyncQuotaPool, { label: string; unit: string }> = {
  notes: { label: "笔记额度池", unit: "篇" },
  flashcards: { label: "闪卡额度池", unit: "张" },
};

function emptyPools(): CloudSyncPoolUsage[] {
  return (Object.keys(POOL_SIZE_LIMIT) as SyncQuotaPool[]).map((id) => ({
    id,
    ...SYNC_POOL_META[id],
    bytes: 0,
    count: 0,
    limitBytes: POOL_SIZE_LIMIT[id],
  }));
}

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
    pools: emptyPools(),
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
  const byPool = new Map(usage.pools.map((row) => [row.id, row]));
  for (const entry of entries) {
    const row = byKind.get(entry.kind);
    if (!row || !(entry.bytes > 0) || !Number.isFinite(entry.bytes)) continue;
    row.bytes += entry.bytes;
    row.count += 1;
    const poolId = KIND_QUOTA_POOL[entry.kind];
    if (!poolId) continue;
    const pool = byPool.get(poolId);
    if (!pool) continue;
    pool.bytes += entry.bytes;
    pool.count += 1;
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
