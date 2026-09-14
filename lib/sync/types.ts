import type { SessionMeta } from "@/lib/storage/chatStorage";
import type { ChatMessage } from "@/lib/types/chat";
import type { Artifact } from "@/lib/stores/artifacts";
import type { StoredDocument } from "@/lib/documents/types";

/** 本 loop 实际上行的 kind。settings / skill 留到以后，且永远不带 apiKey。 */
export const CLOUD_SYNC_KINDS = ["chat-session", "artifact", "document"] as const;
export type CloudSyncKind = (typeof CLOUD_SYNC_KINDS)[number];

export const SCHEMA_SYNC_KINDS = ["chat-session", "artifact", "settings", "skill", "document"] as const;

export const SYNC_TABLE = "sync_documents";

/**
 * 压缩之后的可用容量：同一 32MB 是大量瘦身后的复习会话，不是几十条胖轨迹。
 * 免费层约 500 MB 可支撑十数个重度用户的同步副本。
 */
export const MAX_ARTIFACT_BYTES = 1 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
export const MAX_CHAT_SESSION_BYTES = 4 * 1024 * 1024;
export const MAX_USER_SYNC_BYTES = 32 * 1024 * 1024;

export const KIND_SIZE_LIMIT: Record<CloudSyncKind, number> = {
  "chat-session": MAX_CHAT_SESSION_BYTES,
  artifact: MAX_ARTIFACT_BYTES,
  document: MAX_DOCUMENT_BYTES,
};

export interface ChatSessionSyncPayload {
  v: 1;
  meta: SessionMeta;
  messages: ChatMessage[];
}

export type ArtifactSyncPayload = Pick<Artifact, "id" | "title" | "html" | "status" | "reasoning">;
export type DocumentSyncPayload = StoredDocument;

export interface SyncDocumentRow {
  kind: CloudSyncKind;
  client_id: string;
  payload: unknown;
  deleted: boolean;
  updated_at: string;
}

export interface SyncDocumentsApi {
  list: (kinds: readonly CloudSyncKind[]) => Promise<{
    data: SyncDocumentRow[];
    error: { message: string } | null;
  }>;
  get: (
    kind: CloudSyncKind,
    clientId: string,
  ) => Promise<{ data: SyncDocumentRow | null; error: { message: string } | null }>;
  upsert: (row: {
    kind: CloudSyncKind;
    client_id: string;
    payload: unknown;
    deleted: boolean;
  }) => Promise<{ data: SyncDocumentRow | null; error: { message: string } | null }>;
}

export function isCloudSyncKind(value: string): value is CloudSyncKind {
  return (CLOUD_SYNC_KINDS as readonly string[]).includes(value);
}
