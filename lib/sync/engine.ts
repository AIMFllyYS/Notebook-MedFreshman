import { tryGetBrowserAuthClient } from "@/lib/auth/browserClient";
import {
  deleteSessionData,
  listBlobIdsForSession,
  loadSessionMessages,
  saveManifest,
  saveSessionMessages,
  type SessionMeta,
} from "@/lib/storage/chatStorage";
import { useArtifacts, type Artifact } from "@/lib/stores/artifacts";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useDocuments } from "@/lib/stores/documents";
import type { StoredDocument } from "@/lib/documents/types";
import type { ChatMessage } from "@/lib/types/chat";
import { createSupabaseSyncClient } from "./client";
import { isRemoteNewer, mergeChatSessionPayloads } from "./merge";
import {
  buildArtifactPayload,
  buildChatSessionPayload,
  buildDocumentPayload,
  formatKindLimitMessage,
  formatUserLimitMessage,
  payloadByteSize,
  preparePayload,
} from "./payload";
import { beginCloudSyncApply, endCloudSyncApply } from "./schedule";
import { getCloudSyncStatus, setCloudSyncStatus } from "./status";
import {
  CLOUD_SYNC_KINDS,
  MAX_USER_SYNC_BYTES,
  type ChatSessionSyncPayload,
  type CloudSyncKind,
  type SyncDocumentRow,
  type SyncDocumentsApi,
} from "./types";

const DEFAULT_DEBOUNCE_MS = 2000;
const MAX_LOCAL_SESSIONS = 50;

type JobOp = "upsert" | "tombstone";
type Job = { op: JobOp; kind: CloudSyncKind; clientId: string };

export interface CloudSyncStores {
  listSessionMetas: () => SessionMeta[];
  loadSession: (id: string) => Promise<{ meta: SessionMeta; messages: ChatMessage[] } | null>;
  applySession: (payload: ChatSessionSyncPayload) => void;
  forgetSession: (id: string) => void;
  listArtifactIds: () => string[];
  getArtifact: (id: string) => Artifact | null;
  applyArtifact: (artifact: Artifact) => void;
  forgetArtifact: (id: string) => void;
  listDocumentIds: () => string[];
  getDocument: (id: string) => StoredDocument | null;
  applyDocument: (doc: StoredDocument) => void;
  forgetDocument: (id: string) => void;
}

function createDefaultStores(): CloudSyncStores {
  return {
    listSessionMetas: () => useChatHistory.getState().sessionsMeta,
    async loadSession(id) {
      const meta = useChatHistory.getState().sessionsMeta.find((item) => item.id === id);
      if (!meta) return null;
      const memory = useChatHistory.getState().messagesById[id];
      const messages = memory ?? (await loadSessionMessages(id)) ?? [];
      return { meta, messages };
    },
    applySession: applyChatPayloadToZustand,
    forgetSession: forgetLocalSessionInZustand,
    listArtifactIds: () => useArtifacts.getState().order,
    getArtifact: (id) => useArtifacts.getState().byId[id] ?? null,
    applyArtifact: applyArtifactToZustand,
    forgetArtifact: forgetArtifactInZustand,
    listDocumentIds: () => Object.keys(useDocuments.getState().byId),
    getDocument: (id) => useDocuments.getState().byId[id] ?? null,
    applyDocument: applyDocumentToZustand,
    forgetDocument: forgetDocumentInZustand,
  };
}

let stores: CloudSyncStores = createDefaultStores();
let injectedClient: SyncDocumentsApi | null | undefined;
let debounceMs = DEFAULT_DEBOUNCE_MS;
const pending = new Map<string, Job>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const baseline = new Map<string, string>();
let chain: Promise<void> = Promise.resolve();
let pagehideBound = false;

function jobKey(kind: CloudSyncKind, clientId: string): string {
  return `${kind}:${clientId}`;
}

export function __setCloudSyncStoresForTests(next: CloudSyncStores | null): void {
  stores = next ?? createDefaultStores();
}

export function __setSyncClientForTests(client: SyncDocumentsApi | null): void {
  injectedClient = client;
}

export function __setCloudSyncDebounceForTests(ms: number): void {
  debounceMs = ms;
}

export function __resetCloudSyncForTests(): void {
  injectedClient = undefined;
  stores = createDefaultStores();
  debounceMs = DEFAULT_DEBOUNCE_MS;
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  pending.clear();
  baseline.clear();
  chain = Promise.resolve();
}

async function resolveClient(): Promise<SyncDocumentsApi | null> {
  if (injectedClient !== undefined) return injectedClient;
  const supabase = tryGetBrowserAuthClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user && "id" in data.session.user ? data.session.user.id : null;
  if (typeof userId !== "string" || !userId) return null;
  return createSupabaseSyncClient(supabase, userId);
}

function bindPagehideFlush(): void {
  if (pagehideBound || typeof window === "undefined") return;
  pagehideBound = true;
  const flush = () => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    void flushPendingJobs();
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

function enqueue(job: Job): void {
  bindPagehideFlush();
  const key = jobKey(job.kind, job.clientId);
  pending.set(key, job);
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  if (debounceMs <= 0) {
    timers.delete(key);
    void flushPendingJobs();
    return;
  }
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      void flushPendingJobs();
    }, debounceMs),
  );
}

export function enqueueUpsert(kind: CloudSyncKind, clientId: string): void {
  enqueue({ op: "upsert", kind, clientId });
}

export function enqueueTombstone(kind: CloudSyncKind, clientId: string): void {
  enqueue({ op: "tombstone", kind, clientId });
}

async function flushPendingJobs(): Promise<void> {
  const jobs = [...pending.values()];
  pending.clear();
  if (jobs.length === 0) return;
  chain = chain.then(async () => {
    const api = await resolveClient();
    if (!api) return;
    for (const job of jobs) {
      if (job.op === "tombstone") await pushTombstone(api, job.kind, job.clientId);
      else await pushOne(api, job.kind, job.clientId);
    }
  });
  await chain;
}

export async function flushCloudSyncForTests(): Promise<void> {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  await flushPendingJobs();
  await chain;
}

function withLocalApply(fn: () => void): void {
  beginCloudSyncApply();
  try {
    fn();
  } finally {
    endCloudSyncApply();
  }
}

function asChatPayload(value: unknown): ChatSessionSyncPayload | null {
  if (!value || typeof value !== "object") return null;
  const row = value as ChatSessionSyncPayload;
  if (row.v !== 1 || !row.meta?.id || !Array.isArray(row.messages)) return null;
  return { v: 1, meta: row.meta, messages: row.messages };
}

function asArtifact(value: unknown): Artifact | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Artifact;
  if (typeof row.id !== "string" || typeof row.html !== "string") return null;
  return {
    id: row.id,
    title: typeof row.title === "string" ? row.title : "",
    html: row.html,
    status: "done",
    reasoning: typeof row.reasoning === "string" ? row.reasoning : undefined,
  };
}

function asDocument(value: unknown): StoredDocument | null {
  if (!value || typeof value !== "object") return null;
  const row = value as StoredDocument;
  if (typeof row.id !== "string" || !row.spec) return null;
  return row;
}

async function loadLocalPayload(kind: CloudSyncKind, clientId: string): Promise<unknown | null> {
  if (kind === "chat-session") {
    const session = await stores.loadSession(clientId);
    return session ? buildChatSessionPayload(session.meta, session.messages) : null;
  }
  if (kind === "artifact") {
    const artifact = stores.getArtifact(clientId);
    return artifact ? buildArtifactPayload(artifact) : null;
  }
  const doc = stores.getDocument(clientId);
  return doc ? buildDocumentPayload(doc) : null;
}

async function remoteUserBytes(
  api: SyncDocumentsApi,
  skipKind: CloudSyncKind,
  skipId: string,
): Promise<{ bytes: number; error: string | null }> {
  const { data, error } = await api.list(CLOUD_SYNC_KINDS);
  if (error) return { bytes: 0, error: error.message };
  let bytes = 0;
  for (const row of data) {
    if (row.deleted) continue;
    if (row.kind === skipKind && row.client_id === skipId) continue;
    bytes += payloadByteSize(row.payload);
  }
  return { bytes, error: null };
}

function rememberBaseline(kind: CloudSyncKind, clientId: string, updatedAt: string | undefined): void {
  if (!updatedAt) return;
  baseline.set(jobKey(kind, clientId), updatedAt);
}

function reportError(message: string): void {
  setCloudSyncStatus({ phase: "error", message });
}

function reportMerged(): void {
  setCloudSyncStatus({
    phase: "merged",
    message: "已与另一台设备上的对话合并，消息都保留了。",
  });
}

async function pushTombstone(api: SyncDocumentsApi, kind: CloudSyncKind, clientId: string): Promise<void> {
  const { data, error } = await api.upsert({
    kind,
    client_id: clientId,
    payload: {},
    deleted: true,
  });
  if (error) {
    reportError(`云端同步失败：${error.message}`);
    return;
  }
  rememberBaseline(kind, clientId, data?.updated_at);
}

async function pushOne(api: SyncDocumentsApi, kind: CloudSyncKind, clientId: string): Promise<void> {
  const local = await loadLocalPayload(kind, clientId);
  if (!local) {
    await pushTombstone(api, kind, clientId);
    return;
  }

  const { data: remote, error: getError } = await api.get(kind, clientId);
  if (getError) {
    reportError(`云端同步失败：${getError.message}`);
    return;
  }

  let toUpload: unknown = local;
  if (kind === "chat-session" && remote && !remote.deleted) {
    const known = baseline.get(jobKey(kind, clientId));
    if (isRemoteNewer(remote.updated_at, known)) {
      const localPayload = asChatPayload(local);
      const remotePayload = asChatPayload(remote.payload);
      if (localPayload && remotePayload) {
        const merged = mergeChatSessionPayloads(localPayload, remotePayload);
        toUpload = merged.payload;
        stores.applySession(merged.payload);
        if (merged.added > 0) reportMerged();
      }
    }
  }

  const prepared = preparePayload(kind, toUpload);
  if (!prepared.ok) {
    if (prepared.reason === "kind-limit") {
      reportError(formatKindLimitMessage(kind, prepared.bytes, prepared.limit));
    } else {
      reportError("同步内容含图片或密钥，已跳过上传。本机仍保留。");
    }
    return;
  }

  const total = await remoteUserBytes(api, kind, clientId);
  if (total.error) {
    reportError(`云端同步失败：${total.error}`);
    return;
  }
  if (total.bytes + prepared.bytes > MAX_USER_SYNC_BYTES) {
    reportError(formatUserLimitMessage(MAX_USER_SYNC_BYTES));
    return;
  }

  const { data, error } = await api.upsert({
    kind,
    client_id: clientId,
    payload: prepared.payload,
    deleted: false,
  });
  if (error) {
    reportError(`云端同步失败：${error.message}`);
    return;
  }
  rememberBaseline(kind, clientId, data?.updated_at);
}

function capSessions(metas: SessionMeta[]): SessionMeta[] {
  if (metas.length <= MAX_LOCAL_SESSIONS) return metas;
  return [...metas].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_LOCAL_SESSIONS);
}

function applyChatPayloadToZustand(payload: ChatSessionSyncPayload): void {
  withLocalApply(() => {
    const { meta, messages } = payload;
    const state = useChatHistory.getState();
    const sessionsMeta = capSessions([
      meta,
      ...state.sessionsMeta.filter((item) => item.id !== meta.id),
    ]);
    saveSessionMessages(meta.id, messages);
    saveManifest({
      version: 2,
      activeSessionId: state.activeSessionId ?? meta.id,
      sessions: sessionsMeta,
    });
    useChatHistory.setState({
      sessionsMeta,
      messagesById: { ...state.messagesById, [meta.id]: messages },
    });
  });
}

function forgetLocalSessionInZustand(id: string): void {
  withLocalApply(() => {
    const state = useChatHistory.getState();
    const sessionsMeta = state.sessionsMeta.filter((item) => item.id !== id);
    const { [id]: _drop, ...messagesById } = state.messagesById;
    const deletedActive = state.activeSessionId === id;
    const activeSessionId = deletedActive ? sessionsMeta[0]?.id ?? null : state.activeSessionId;
    saveManifest({ version: 2, activeSessionId, sessions: sessionsMeta });
    useChatHistory.setState({
      sessionsMeta,
      messagesById,
      activeSessionId,
      loadedSessionIds: state.loadedSessionIds.filter((item) => item !== id),
    });
    void (async () => {
      const blobIds = await listBlobIdsForSession(id);
      await deleteSessionData(id, blobIds);
    })();
  });
}

function applyArtifactToZustand(artifact: Artifact): void {
  withLocalApply(() => {
    useArtifacts.setState((state) => ({
      byId: { ...state.byId, [artifact.id]: artifact },
      order: state.order.includes(artifact.id) ? state.order : [...state.order, artifact.id],
    }));
  });
}

function forgetArtifactInZustand(id: string): void {
  withLocalApply(() => {
    useArtifacts.setState((state) => {
      const { [id]: _drop, ...byId } = state.byId;
      return { byId, order: state.order.filter((item) => item !== id) };
    });
  });
}

function applyDocumentToZustand(doc: StoredDocument): void {
  withLocalApply(() => {
    useDocuments.setState((state) => ({
      byId: { ...state.byId, [doc.id]: doc },
    }));
  });
}

function forgetDocumentInZustand(id: string): void {
  withLocalApply(() => {
    useDocuments.setState((state) => {
      const { [id]: _drop, ...byId } = state.byId;
      return { byId };
    });
  });
}

async function applyRemoteRow(row: SyncDocumentRow): Promise<void> {
  rememberBaseline(row.kind, row.client_id, row.updated_at);
  if (row.deleted) {
    if (row.kind === "chat-session") stores.forgetSession(row.client_id);
    else if (row.kind === "artifact") stores.forgetArtifact(row.client_id);
    else stores.forgetDocument(row.client_id);
    return;
  }
  if (row.kind === "chat-session") {
    const remote = asChatPayload(row.payload);
    if (!remote) return;
    const local = await stores.loadSession(remote.meta.id);
    if (local) {
      const merged = mergeChatSessionPayloads(
        { v: 1, meta: local.meta, messages: local.messages },
        remote,
      );
      stores.applySession(merged.payload);
      if (merged.added > 0) reportMerged();
    } else {
      stores.applySession(remote);
    }
    return;
  }
  if (row.kind === "artifact") {
    const artifact = asArtifact(row.payload);
    if (artifact) stores.applyArtifact(artifact);
    return;
  }
  const doc = asDocument(row.payload);
  if (doc) stores.applyDocument(doc);
}

async function pullFromCloud(api: SyncDocumentsApi): Promise<void> {
  const { data, error } = await api.list(CLOUD_SYNC_KINDS);
  if (error) {
    reportError(`云端同步失败：${error.message}`);
    return;
  }
  const tombstones = data.filter((row) => row.deleted);
  const live = data.filter((row) => !row.deleted);
  for (const row of tombstones) await applyRemoteRow(row);
  for (const row of live) await applyRemoteRow(row);
}

async function pushAllLocal(api: SyncDocumentsApi): Promise<void> {
  for (const meta of stores.listSessionMetas()) await pushOne(api, "chat-session", meta.id);
  for (const id of stores.listArtifactIds()) await pushOne(api, "artifact", id);
  for (const id of stores.listDocumentIds()) await pushOne(api, "document", id);
}

export async function pullAndPushAll(): Promise<void> {
  const api = await resolveClient();
  if (!api) return;
  setCloudSyncStatus({ phase: "syncing", message: null });
  chain = chain.then(async () => {
    await pullFromCloud(api);
    await pushAllLocal(api);
    const current = getCloudSyncStatus();
    if (current.phase === "syncing") {
      setCloudSyncStatus({ phase: "idle", message: current.message });
    }
  });
  await chain;
}
