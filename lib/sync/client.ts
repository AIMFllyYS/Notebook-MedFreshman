import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SYNC_TABLE,
  isCloudSyncKind,
  type SyncDocumentRow,
  type SyncDocumentsApi,
} from "./types";

function asRow(value: unknown): SyncDocumentRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.kind !== "string" || typeof row.client_id !== "string") return null;
  if (!isCloudSyncKind(row.kind)) return null;
  return {
    kind: row.kind,
    client_id: row.client_id,
    payload: row.payload ?? {},
    deleted: row.deleted === true,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date(0).toISOString(),
  };
}

export function createSupabaseSyncClient(client: SupabaseClient, userId: string): SyncDocumentsApi {
  return {
    async list(kinds) {
      const { data, error } = await client
        .from(SYNC_TABLE)
        .select("kind, client_id, payload, deleted, updated_at")
        .eq("user_id", userId)
        .in("kind", [...kinds]);
      if (error) return { data: [], error: { message: error.message } };
      return {
        data: (data ?? []).map(asRow).filter((row): row is SyncDocumentRow => row !== null),
        error: null,
      };
    },
    async get(kind, clientId) {
      const { data, error } = await client
        .from(SYNC_TABLE)
        .select("kind, client_id, payload, deleted, updated_at")
        .eq("user_id", userId)
        .eq("kind", kind)
        .eq("client_id", clientId)
        .maybeSingle();
      if (error) return { data: null, error: { message: error.message } };
      return { data: asRow(data), error: null };
    },
    async upsert(row) {
      const { data, error } = await client
        .from(SYNC_TABLE)
        .upsert(
          {
            user_id: userId,
            kind: row.kind,
            client_id: row.client_id,
            payload: row.payload,
            deleted: row.deleted,
          },
          { onConflict: "user_id,kind,client_id" },
        )
        .select("kind, client_id, payload, deleted, updated_at")
        .maybeSingle();
      if (error) return { data: null, error: { message: error.message } };
      return { data: asRow(data), error: null };
    },
  };
}

export function createMemorySyncClient(): SyncDocumentsApi & {
  rows: Map<string, SyncDocumentRow>;
  upserts: Array<{ kind: string; client_id: string; deleted: boolean; payload: unknown }>;
} {
  const rows = new Map<string, SyncDocumentRow>();
  const upserts: Array<{ kind: string; client_id: string; deleted: boolean; payload: unknown }> = [];
  let seq = 0;
  const keyOf = (kind: string, clientId: string) => `${kind}:${clientId}`;

  return {
    rows,
    upserts,
    async list(kinds) {
      const allow = new Set<string>(kinds);
      return {
        data: [...rows.values()].filter((row) => allow.has(row.kind)),
        error: null,
      };
    },
    async get(kind, clientId) {
      return { data: rows.get(keyOf(kind, clientId)) ?? null, error: null };
    },
    async upsert(row) {
      seq += 1;
      const stored: SyncDocumentRow = {
        kind: row.kind,
        client_id: row.client_id,
        payload: row.payload,
        deleted: row.deleted,
        updated_at: new Date(Date.now() + seq).toISOString(),
      };
      rows.set(keyOf(row.kind, row.client_id), stored);
      upserts.push({
        kind: row.kind,
        client_id: row.client_id,
        deleted: row.deleted,
        payload: row.payload,
      });
      return { data: stored, error: null };
    },
  };
}
