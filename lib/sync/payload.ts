import type { ChatMessage, StoredChatAttachment } from "@/lib/types/chat";
import type { SessionMeta } from "@/lib/storage/chatStorage";
import {
  KIND_SIZE_LIMIT,
  type ArtifactSyncPayload,
  type ChatSessionSyncPayload,
  type CloudSyncKind,
  type DocumentSyncPayload,
} from "./types";

const MEDIA_DATA_URL_RE = /data:(?:image|audio|video)\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/gi;
const STRIP_KEYS = new Set(["base64", "apikey", "api_key"]);

export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function payloadByteSize(payload: unknown): number {
  try {
    return utf8ByteLength(JSON.stringify(payload));
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function redactMediaString(value: string): string {
  return value.replace(MEDIA_DATA_URL_RE, "");
}

function stripNode(value: unknown): unknown {
  if (typeof value === "string") return redactMediaString(value);
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripNode);
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (STRIP_KEYS.has(key.toLowerCase())) continue;
    out[key] = stripNode(child);
  }
  return out;
}

export function stripForbiddenFields(value: unknown): unknown {
  return stripNode(value);
}

export function payloadLooksUnsafe(payload: unknown): boolean {
  let json: string;
  try {
    json = JSON.stringify(payload);
  } catch {
    return true;
  }
  const lower = json.toLowerCase();
  if (lower.includes("data:image") || lower.includes("data:audio") || lower.includes("data:video")) {
    return true;
  }
  if (lower.includes('"base64"') || lower.includes('"apikey"') || lower.includes('"api_key"')) {
    return true;
  }
  return false;
}

function stripAttachment(a: StoredChatAttachment): StoredChatAttachment {
  const id = "id" in a && typeof a.id === "string" && a.id ? a.id : `unsynced-${a.mimeType}`;
  const name = "name" in a && typeof a.name === "string" ? a.name : undefined;
  return { id, type: "image", mimeType: a.mimeType, name };
}

export function sanitizeChatMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    const stripped = stripForbiddenFields(message) as ChatMessage;
    if (!message.attachments?.length) {
      return { ...stripped, attachments: undefined };
    }
    return {
      ...stripped,
      attachments: message.attachments.map(stripAttachment),
    };
  });
}

export function buildChatSessionPayload(meta: SessionMeta, messages: ChatMessage[]): ChatSessionSyncPayload {
  return {
    v: 1,
    meta,
    messages: sanitizeChatMessages(messages),
  };
}

export function buildArtifactPayload(artifact: ArtifactSyncPayload): ArtifactSyncPayload {
  return stripForbiddenFields({
    id: artifact.id,
    title: artifact.title,
    html: artifact.html,
    status: artifact.status,
    reasoning: artifact.reasoning,
  }) as ArtifactSyncPayload;
}

export function buildDocumentPayload(doc: DocumentSyncPayload): DocumentSyncPayload {
  return stripForbiddenFields(doc) as DocumentSyncPayload;
}

export type PayloadCheck =
  | { ok: true; payload: unknown; bytes: number }
  | { ok: false; reason: "unsafe" | "kind-limit"; bytes: number; limit: number };

export function preparePayload(
  kind: CloudSyncKind,
  raw: unknown,
): PayloadCheck {
  const payload = stripForbiddenFields(raw);
  const bytes = payloadByteSize(payload);
  const limit = KIND_SIZE_LIMIT[kind];
  if (payloadLooksUnsafe(payload)) return { ok: false, reason: "unsafe", bytes, limit };
  if (bytes > limit) return { ok: false, reason: "kind-limit", bytes, limit };
  return { ok: true, payload, bytes };
}

export function formatKindLimitMessage(kind: CloudSyncKind, bytes: number, limit: number): string {
  const usedKb = Math.max(1, Math.round(bytes / 1024));
  const limitKb = Math.round(limit / 1024);
  if (kind === "artifact") {
    return `这条演示 HTML 约 ${usedKb} KB，超过单条上限 ${limitKb} KB，未上传云端。本机仍保留。`;
  }
  if (kind === "document") {
    return `这篇长文档约 ${usedKb} KB，超过单条上限 ${limitKb} KB，未上传云端。本机仍保留。`;
  }
  return `这段对话约 ${usedKb} KB，超过单条上限 ${limitKb} KB，未上传云端。本机仍保留。`;
}

export function formatUserLimitMessage(limit: number): string {
  const mb = Math.round((limit / (1024 * 1024)) * 10) / 10;
  return `云端同步已达 ${mb} MB 上限，本条未上传。本机仍保留。图片不会占用云端额度。`;
}
