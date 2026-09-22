import type { ChatContext, ChatMessage, ChatAttachment, StoredChatAttachment } from '@/lib/types/chat';
import type { ChatSession } from '@/lib/hooks/useChatHistory';
import {
  idbStorage,
  setItemNow,
  PERSIST_KEYS,
  chatSessionKey,
  chatBlobKey,
  CHAT_BLOB_KEY_PREFIX,
  CHAT_SESSION_KEY_PREFIX,
  listPersistedKeys,
  flushPendingWrites,
} from '@/lib/storage/idbStorage';
import { compactStudyMessages } from '@/lib/chat/compactStudyParts';
import { getMessageText, getToolPartsByName, normalizeStoredMessages } from '@/lib/chat/messageParts';

export interface SessionMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  kind?: 'main' | 'floating' | 'note' | 'scheduled';
  context?: ChatContext;
  messageCount: number;
  preview?: string;
  artifactIds: string[];
  /** 归档后从「正常对话 / 划词助手对话」默认列表移出，仍在本地可恢复。 */
  archived?: boolean;
  /** 用户自建文件夹；缺省表示未分组。 */
  folderId?: string | null;
  /**
   * 本会话已经读进过上下文的项目切片 id（去重 + FIFO，上限见 project/sessionSlices.ts）。
   * 项目一大，携带计划就从「全带」翻成「只带勾选的」；记住这些 id 能让模型读过的东西
   * 在后续轮次继续可读，而不是下一轮就报「这一轮没有携带切片正文」。
   */
  readSliceIds?: string[];
}

/** 系统项目的来源标记：笔记窗内 Agent 会话 / 划词助手会话 / 定时任务会话。 */
export type ProjectSystemKind = 'note' | 'floating' | 'scheduled';

/**
 * 对话项目（= 会话分组，可选字段，老 manifest 无此项时按空数组处理）。
 * `system` 有值的项目由来源决定成员，不可删除、可重命名。
 */
export interface ChatFolder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
  system?: ProjectSystemKind;
}

/** 三个默认项目：笔记记录（笔记窗内 Agent 会话）/ 划词摘录（划词助手会话）/ 定时任务（调度器触发的会话）。 */
export const SYSTEM_PROJECTS: readonly ChatFolder[] = [
  { id: 'project-note', name: '笔记记录', createdAt: 0, system: 'note' },
  { id: 'project-floating', name: '划词摘录', createdAt: 0, system: 'floating' },
  { id: 'project-scheduled', name: '定时任务', createdAt: 0, system: 'scheduled' },
];

export const SYSTEM_PROJECT_IDS = SYSTEM_PROJECTS.map((project) => project.id);

export function isSystemProject(folder: Pick<ChatFolder, 'system' | 'id'>): boolean {
  return Boolean(folder.system) || SYSTEM_PROJECT_IDS.includes(folder.id);
}

/**
 * 补齐两个系统项目（幂等）。返回新数组；没有变化时返回 null，调用方据此跳过落盘。
 * 用户改过的名字保留：只按 id 判断缺不缺，不按名字判断。
 */
export function ensureDefaultProjects(folders: ChatFolder[]): ChatFolder[] | null {
  const existing = new Set(folders.map((folder) => folder.id));
  const missing = SYSTEM_PROJECTS.filter((project) => !existing.has(project.id));
  if (missing.length === 0) return null;
  return [...folders, ...missing.map((project) => ({ ...project }))];
}

export interface ChatManifestV2 {
  version: 2;
  activeSessionId: string | null;
  sessions: SessionMeta[];
  folders?: ChatFolder[];
  /** 下一次「新建对话」的落点项目；null = 不使用项目。 */
  activeProjectId?: string | null;
}

/**
 * manifest 的唯一构造入口。**只允许走这里**：2026-09-19 的数据事故与之后的
 * 「云端拉取丢 folders」都源于手写对象字面量漏字段——新增字段时这里改一处就够。
 */
export function buildManifest(input: {
  activeSessionId: string | null;
  sessions: SessionMeta[];
  folders?: ChatFolder[];
  activeProjectId?: string | null;
}): ChatManifestV2 {
  return {
    version: 2,
    activeSessionId: input.activeSessionId,
    sessions: input.sessions,
    folders: input.folders ?? [],
    activeProjectId: input.activeProjectId ?? null,
  };
}

/** 能构造 manifest 的状态切片（chatHistory store 与云同步引擎都是这个形状）。 */
export interface ManifestSource {
  activeSessionId: string | null;
  sessionsMeta: SessionMeta[];
  folders: ChatFolder[];
  activeProjectId: string | null;
}

/**
 * 从状态切片构造 manifest，只覆盖显式传入的字段。**所有写盘路径都必须走这里。**
 * 两次真实事故（2026-09-19 会话被清空、2026-09-20 云端拉取丢项目）都是手写 manifest 字面量漏字段造成的。
 */
export function manifestFrom(
  source: ManifestSource,
  overrides: Partial<Pick<ChatManifestV2, "activeSessionId" | "sessions" | "folders" | "activeProjectId">> = {},
): ChatManifestV2 {
  return buildManifest({
    activeSessionId: source.activeSessionId,
    sessions: source.sessionsMeta,
    folders: source.folders,
    activeProjectId: source.activeProjectId,
    ...overrides,
  });
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

export function collectArtifactIdsFromMessages(messages: ChatMessage[]): string[] {
  const ids: string[] = [];
  for (const m of messages) {
    for (const part of getToolPartsByName(m, 'renderInteractive')) {
      if (part.state === 'output-available' && part.output.artifactId) ids.push(part.output.artifactId);
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
    preview: lastUser ? getMessageText(lastUser).slice(0, 80) : undefined,
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
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // 旧扁平结构（content / reasoningContent / toolCalls）在读取时就地迁移为 parts；
    // 下次保存自然写回新形状，无需单独的存储版本迁移。
    return compactStudyMessages(normalizeStoredMessages(parsed), 'persist');
  } catch {
    return null;
  }
}

export function serializeSessionMessages(messages: ChatMessage[]): string {
  return JSON.stringify(compactStudyMessages(messages, 'persist'));
}

export function saveSessionMessages(sessionId: string, messages: ChatMessage[]): void {
  idbStorage.setItemLazy(chatSessionKey(sessionId), () => serializeSessionMessages(messages));
}

async function saveManifestNow(manifest: ChatManifestV2): Promise<boolean> {
  return setItemNow(PERSIST_KEYS.chatManifest, JSON.stringify(manifest));
}

async function saveSessionMessagesNow(sessionId: string, messages: ChatMessage[]): Promise<boolean> {
  return setItemNow(chatSessionKey(sessionId), serializeSessionMessages(messages));
}

export async function loadBlobDataUrl(blobId: string): Promise<string | null> {
  if (!isBrowser()) return null;
  return idbStorage.getItem(chatBlobKey(blobId));
}

async function persistableDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("blob:")) return dataUrl;
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("读取本地文件失败"));
    reader.readAsDataURL(blob);
  });
}

export async function saveBlobFromDataUrl(blobId: string, dataUrl: string): Promise<void> {
  if (!isBrowser()) return;
  const stored = await persistableDataUrl(dataUrl);
  const ok = await setItemNow(chatBlobKey(blobId), stored);
  if (!ok) throw new Error(`Failed to save chat blob: ${blobId}`);
}

function inlineAttachmentPayload(attachment: ChatAttachment): string | null {
  if (attachment.type === 'image') return attachment.base64 || null;
  if (attachment.type === 'document') return attachment.text;
  return attachment.dataUrl || null;
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

export function extractBlobIdsFromMessages(messages: ChatMessage[]): string[] {
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
      const payload = 'id' in a ? null : inlineAttachmentPayload(a);
      if (payload != null) {
        const id: string = `blob-${m.id}-${attachments.length}-${Date.now()}`;
        await saveBlobFromDataUrl(id, payload);
        attachments.push({
          id, type: a.type, mimeType: a.mimeType,
          name: a.name, size: a.size,
          ...('characterCount' in a ? { characterCount: a.characterCount } : {}),
        });
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
      const messages = await migrateAttachmentsInMessages(
        normalizeStoredMessages(session.messages as unknown[]),
      );
      const saved = await saveSessionMessagesNow(session.id, messages);
      if (!saved) return false;
      metas.push(buildSessionMeta({ ...session, messages }));
    }

    // v1 没有项目概念：folders / activeProjectId 交给 buildManifest 补默认值。
    const manifestSaved = await saveManifestNow(buildManifest({ activeSessionId, sessions: metas }));
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

export async function hydrateAttachmentsForApi(
  messages: ChatMessage[],
  options?: { messageIds?: ReadonlySet<string> },
): Promise<ChatMessage[]> {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (options?.messageIds && !options.messageIds.has(m.id)) {
      out.push(m);
      continue;
    }
    if (!m.attachments?.length) {
      out.push(m);
      continue;
    }
    const attachments: ChatAttachment[] = [];
    for (const a of m.attachments) {
      if (!('id' in a)) {
        attachments.push(a as ChatAttachment);
      } else if ('id' in a) {
        const payload = await loadBlobDataUrl((a as { id: string }).id);
        if (payload) {
          attachments.push(a.type === 'document' ? {
            type: 'document',
            mimeType: a.mimeType as Extract<ChatAttachment, { type: 'document' }>['mimeType'],
            name: a.name ?? '未命名文档.txt',
            text: payload,
            size: a.size ?? new Blob([payload]).size,
            characterCount: a.characterCount ?? [...payload].length,
          } : a.type === 'local-file' ? {
            type: 'local-file', mimeType: a.mimeType as Extract<ChatAttachment, { type: 'local-file' }>['mimeType'], dataUrl: payload,
            name: a.name ?? '未命名本地文件', size: a.size ?? 0,
          } : {
            type: 'image', mimeType: a.mimeType, base64: payload,
            name: a.name, size: a.size,
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
    if (!('id' in a)) {
      const payload = inlineAttachmentPayload(a);
      if (payload == null) {
        attachments.push(a);
        continue;
      }
      const id = `blob-${message.id}-${attachments.length}`;
      void saveBlobFromDataUrl(id, payload);
      attachments.push({
        id, type: a.type, mimeType: a.mimeType,
        name: a.name, size: a.size,
        ...('characterCount' in a ? { characterCount: a.characterCount } : {}),
      });
    } else {
      attachments.push(a);
    }
  }
  return { ...message, attachments };
}


export async function listBlobIdsForSession(sessionId: string): Promise<string[]> {
  const messages = await loadSessionMessages(sessionId);
  if (!messages) return [];
  return extractBlobIdsFromMessages(messages);
}

export async function listAllChatKeys(): Promise<string[]> {
  if (!isBrowser()) return [];
  const all = await listPersistedKeys();
  return all.filter(
    (k) => k.startsWith(CHAT_BLOB_KEY_PREFIX) || k.startsWith(CHAT_SESSION_KEY_PREFIX),
  );
}

/**
 * 单轮 GC 允许删除的会话键上限。超过就认为 manifest 不可信、整轮放弃——
 * 正常情况只有「超出 50 条上限被淘汰」这类零星孤儿，绝不会有大批量同时失效。
 */
const MAX_ORPHAN_DELETIONS = 3;

export interface ChatGcDeps {
  listKeys?: () => Promise<string[]>;
  removeKey?: (key: string) => Promise<void>;
  loadMessages?: (sessionId: string) => Promise<ChatMessage[] | null>;
  loadManifest?: () => Promise<ChatManifestV2 | null>;
}

/**
 * 以 manifest 为唯一真相源：不在入口里的 chat-session:* / 无引用的 chat-blob:* 删除。
 * 不会删掉仍被 manifest 会话引用的键。
 */
export async function gcOrphanedChatKeys(deps: ChatGcDeps = {}): Promise<{ deleted: string[] }> {
  const listKeys = deps.listKeys ?? listAllChatKeys;
  const removeKey = deps.removeKey ?? ((key: string) => idbStorage.removeItem(key));
  const loadMessages = deps.loadMessages ?? loadSessionMessages;
  const readManifest = deps.loadManifest ?? loadManifest;

  flushPendingWrites();
  const manifest = await readManifest();
  // 读不到 manifest 时**绝不能**把「keep 集合为空」当成真相：那等于一次删光所有会话正文。
  if (!manifest) return { deleted: [] };
  const keepSessions = new Set(manifest.sessions.map((s) => s.id));
  const keys = await listKeys();
  const deleted: string[] = [];

  const orphanSessionKeys = keys.filter((key) => {
    if (!key.startsWith(CHAT_SESSION_KEY_PREFIX)) return false;
    const sessionId = key.slice(CHAT_SESSION_KEY_PREFIX.length);
    return Boolean(sessionId) && !keepSessions.has(sessionId);
  });
  // 孤儿异常多 = manifest 很可能不是真相（被空列表/旧列表覆盖过、或水合失败）。
  // 这时**一个都不删**：误删正文是不可逆的，留几个孤儿键只是占点空间。
  if (orphanSessionKeys.length > MAX_ORPHAN_DELETIONS) return { deleted: [] };

  for (const key of orphanSessionKeys) {
    await removeKey(key);
    deleted.push(key);
  }

  // 附件清理依赖「所有存活会话的正文都能读出来」。只要有一个存活会话的键在、正文却读不出来，
  // keep 集合就不完整，这一轮不动任何 blob（否则会把它们的附件误判成孤儿删掉）。
  const keepBlobs = new Set<string>();
  for (const sessionId of keepSessions) {
    const messages = await loadMessages(sessionId);
    if (!messages) {
      if (keys.includes(CHAT_SESSION_KEY_PREFIX + sessionId)) return { deleted };
      continue;
    }
    for (const blobId of extractBlobIdsFromMessages(messages)) keepBlobs.add(blobId);
  }

  for (const key of keys) {
    if (!key.startsWith(CHAT_BLOB_KEY_PREFIX)) continue;
    const blobId = key.slice(CHAT_BLOB_KEY_PREFIX.length);
    if (!blobId || keepBlobs.has(blobId)) continue;
    await removeKey(key);
    deleted.push(key);
  }

  return { deleted };
}

let gcTimer: ReturnType<typeof setTimeout> | null = null;
let gcIdleId: number | null = null;

export function cancelOrphanChatGc(): void {
  if (gcTimer) {
    clearTimeout(gcTimer);
    gcTimer = null;
  }
  if (gcIdleId != null && typeof window !== 'undefined') {
    window.cancelIdleCallback?.(gcIdleId);
    gcIdleId = null;
  }
}

export function scheduleOrphanChatGc(): void {
  if (typeof window === 'undefined') return;
  cancelOrphanChatGc();
  const run = () => {
    gcTimer = null;
    gcIdleId = null;
    void gcOrphanedChatKeys();
  };
  const ric = window.requestIdleCallback;
  if (typeof ric === 'function') {
    gcIdleId = ric(run, { timeout: 4000 });
    return;
  }
  gcTimer = setTimeout(run, 0);
}
