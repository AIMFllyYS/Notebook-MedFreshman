import type { ChatContext, ChatMessage, ChatAttachment, StoredChatAttachment } from '@/lib/types/chat';
import type { ChatSession } from '@/lib/hooks/useChatHistory';
import {
  idbStorage,
  setItemNow,
  PERSIST_KEYS,
  chatSessionKey,
  chatBlobKey,
  CHAT_BLOB_KEY_PREFIX,
} from '@/lib/storage/idbStorage';
import { keys as idbKeys } from 'idb-keyval';
import { createStore } from 'idb-keyval';

const DB_NAME = 'gailvlun-db';
const STORE_NAME = 'keyval';
const idbStore = createStore(DB_NAME, STORE_NAME);

export interface SessionMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  kind?: 'main' | 'floating';
  context?: ChatContext;
  messageCount: number;
  preview?: string;
  artifactIds: string[];
}

export interface ChatManifestV2 {
  version: 2;
  activeSessionId: string | null;
  sessions: SessionMeta[];
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

export function collectArtifactIdsFromMessages(messages: ChatMessage[]): string[] {
  const ids: string[] = [];
  for (const m of messages) {
    if (!m.toolCalls) continue;
    for (const tc of m.toolCalls) {
      if (tc.artifactId) ids.push(tc.artifactId);
    }
  }
  return ids;
}

export function buildSessionMeta(session: ChatSession): SessionMeta {
  const lastUser = [...session.messages].reverse().find((m) => m.role === 'user');
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    kind: session.kind,
    context: session.context,
    messageCount: session.messages.length,
    preview: lastUser?.content?.slice(0, 80),
    artifactIds: collectArtifactIdsFromMessages(session.messages),
  };
}

export function mergeArtifactIds(existing: string[], messages: ChatMessage[]): string[] {
  const set = new Set(existing);
  for (const id of collectArtifactIdsFromMessages(messages)) set.add(id);
  return [...set];
}

export async function loadManifest(): Promise<ChatManifestV2 | null> {
  if (!isBrowser()) return null;
  const raw = await idbStorage.getItem(PERSIST_KEYS.chatManifest);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ChatManifestV2;
    if (parsed?.version === 2 && Array.isArray(parsed.sessions)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveManifest(manifest: ChatManifestV2): void {
  idbStorage.setItem(PERSIST_KEYS.chatManifest, JSON.stringify(manifest));
}

export async function loadSessionMessages(sessionId: string): Promise<ChatMessage[] | null> {
  if (!isBrowser()) return null;
  const raw = await idbStorage.getItem(chatSessionKey(sessionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return null;
  }
}

export function saveSessionMessages(sessionId: string, messages: ChatMessage[]): void {
  idbStorage.setItem(chatSessionKey(sessionId), JSON.stringify(messages));
}

async function saveManifestNow(manifest: ChatManifestV2): Promise<boolean> {
  return setItemNow(PERSIST_KEYS.chatManifest, JSON.stringify(manifest));
}

async function saveSessionMessagesNow(sessionId: string, messages: ChatMessage[]): Promise<boolean> {
  return setItemNow(chatSessionKey(sessionId), JSON.stringify(messages));
}

export async function loadBlobDataUrl(blobId: string): Promise<string | null> {
  if (!isBrowser()) return null;
  return idbStorage.getItem(chatBlobKey(blobId));
}

export async function saveBlobFromDataUrl(blobId: string, dataUrl: string): Promise<void> {
  if (!isBrowser()) return;
  const ok = await setItemNow(chatBlobKey(blobId), dataUrl);
  if (!ok) throw new Error(`Failed to save chat blob: ${blobId}`);
}

export async function deleteSessionData(sessionId: string, blobIds: string[] = []): Promise<void> {
  if (!isBrowser()) return;
  await idbStorage.removeItem(chatSessionKey(sessionId));
  for (const id of blobIds) {
    try {
      await idbStorage.removeItem(chatBlobKey(id));
    } catch {
      // ignore
    }
  }
}

function extractBlobIdsFromMessages(messages: ChatMessage[]): string[] {
  const ids: string[] = [];
  for (const m of messages) {
    if (!m.attachments) continue;
    for (const a of m.attachments) {
      if ('id' in a && typeof (a as { id?: string }).id === 'string' && !('base64' in a)) {
        ids.push((a as { id: string }).id);
      }
    }
  }
  return ids;
}

async function migrateAttachmentsInMessages(messages: ChatMessage[]): Promise<ChatMessage[]> {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (!m.attachments?.length) {
      out.push(m);
      continue;
    }
    const attachments = [];
    for (const a of m.attachments) {
      if ('base64' in a && a.base64) {
        const id: string = `blob-${m.id}-${attachments.length}-${Date.now()}`;
        await saveBlobFromDataUrl(id, a.base64);
        attachments.push({ id, type: 'image' as const, mimeType: a.mimeType, name: undefined });
      } else {
        attachments.push(a);
      }
    }
    out.push({ ...m, attachments });
  }
  return out;
}

interface V1Persisted {
  state?: { sessions?: ChatSession[]; activeSessionId?: string | null };
  sessions?: ChatSession[];
  activeSessionId?: string | null;
}

/** 幂等：存在 legacy chat-history 且无 manifest 时拆分写入 v2。 */
export async function migrateFromV1IfNeeded(): Promise<boolean> {
  if (!isBrowser()) return false;
  const existing = await loadManifest();
  if (existing) return false;

  const legacyRaw = await idbStorage.getItem(PERSIST_KEYS.chatHistory);
  if (!legacyRaw) return false;

  let parsed: V1Persisted;
  try {
    parsed = JSON.parse(legacyRaw) as V1Persisted;
  } catch {
    return false;
  }

  const sessions: ChatSession[] = parsed.state?.sessions ?? parsed.sessions ?? [];
  const activeSessionId = parsed.state?.activeSessionId ?? parsed.activeSessionId ?? null;

  const metas: SessionMeta[] = [];
  try {
    for (const session of sessions) {
      const messages = await migrateAttachmentsInMessages(session.messages);
      const saved = await saveSessionMessagesNow(session.id, messages);
      if (!saved) return false;
      metas.push(buildSessionMeta({ ...session, messages }));
    }

    const manifestSaved = await saveManifestNow({ version: 2, activeSessionId, sessions: metas });
    if (!manifestSaved) return false;
  } catch {
    return false;
  }

  await idbStorage.removeItem(PERSIST_KEYS.chatHistory);
  return true;
}

/** 导出：并行加载全部会话并 hydrate 附件为 inline base64（兼容 v1 导出格式）。 */
export async function loadAllSessionsForExport(metas: SessionMeta[]): Promise<ChatSession[]> {
  const sessions: ChatSession[] = [];
  for (const meta of metas) {
    const messages = (await loadSessionMessages(meta.id)) ?? [];
    const hydrated = await hydrateAttachmentsForApi(messages);
    sessions.push({
      id: meta.id,
      title: meta.title,
      messages: hydrated,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      context: meta.context,
      kind: meta.kind,
    });
  }
  return sessions;
}

export async function hydrateAttachmentsForApi(messages: ChatMessage[]): Promise<ChatMessage[]> {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (!m.attachments?.length) {
      out.push(m);
      continue;
    }
    const attachments: ChatAttachment[] = [];
    for (const a of m.attachments) {
      if ('base64' in a && a.base64) {
        attachments.push(a as ChatAttachment);
      } else if ('id' in a) {
        const dataUrl = await loadBlobDataUrl((a as { id: string }).id);
        if (dataUrl) {
          attachments.push({
            type: 'image',
            mimeType: a.mimeType,
            base64: dataUrl,
          });
        }
      }
    }
    out.push({ ...m, attachments: attachments.length ? attachments : undefined });
  }
  return out;
}

export function persistInlineAttachments(message: ChatMessage): ChatMessage {
  if (!message.attachments?.length) return message;
  const attachments: StoredChatAttachment[] = [];
  for (const a of message.attachments) {
    if ('base64' in a && a.base64) {
      const id = `blob-${message.id}-${attachments.length}`;
      void saveBlobFromDataUrl(id, a.base64);
      attachments.push({ id, type: 'image', mimeType: a.mimeType });
    } else {
      attachments.push(a);
    }
  }
  return { ...message, attachments };
}

export function persistMessagesAttachments(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(persistInlineAttachments);
}

export async function listBlobIdsForSession(sessionId: string): Promise<string[]> {
  const messages = await loadSessionMessages(sessionId);
  if (!messages) return [];
  return extractBlobIdsFromMessages(messages);
}

export async function listAllChatKeys(): Promise<string[]> {
  if (!isBrowser()) return [];
  const all = await idbKeys(idbStore);
  return all.filter(
    (k) => typeof k === 'string' && (k.startsWith(CHAT_BLOB_KEY_PREFIX) || k.startsWith('chat-session:')),
  ) as string[];
}
