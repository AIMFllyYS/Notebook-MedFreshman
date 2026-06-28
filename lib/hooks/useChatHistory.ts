import { create } from 'zustand';
import type { ChatMessage, ChatContext } from '@/lib/types/chat';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import {
  type SessionMeta,
  buildSessionMeta,
  mergeArtifactIds,
  loadManifest,
  saveManifest,
  loadSessionMessages,
  saveSessionMessages,
  migrateFromV1IfNeeded,
  deleteSessionData,
  listBlobIdsForSession,
  persistInlineAttachments,
  hydrateAttachmentsForApi,
} from '@/lib/storage/chatStorage';
import { PERSIST_KEYS } from '@/lib/storage/idbStorage';

const MAX_LOADED_SESSIONS = 3;
const MAX_SESSIONS = 50;

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  context?: ChatContext;
  kind?: 'main' | 'floating';
  /** Storage v2：历史列表在未加载消息体时使用 */
  messageCount?: number;
}

interface ChatHistoryState {
  sessionsMeta: SessionMeta[];
  messagesById: Record<string, ChatMessage[]>;
  activeSessionId: string | null;
  sessionLoadState: Record<string, 'idle' | 'loading' | 'loaded' | 'error'>;
  loadedSessionIds: string[];
  pinnedSessionIds: string[];
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  /** 当前 active 会话消息已从 IDB 加载完成 */
  _activeMessagesReady: boolean;
  _setActiveMessagesReady: (v: boolean) => void;
  /** 合并 meta + 已加载 messages，供历史面板等使用 */
  getSessions: () => ChatSession[];
  pinSession: (id: string) => void;
  unpinSession: (id: string) => void;
  ensureSessionLoaded: (sessionId: string) => Promise<void>;
  createSession: (context?: ChatContext, kind?: 'main' | 'floating') => string;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

let bootstrapPromise: Promise<void> | null = null;

function metaToChatSession(meta: SessionMeta, messages: ChatMessage[]): ChatSession {
  return {
    id: meta.id,
    title: meta.title,
    messages,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    context: meta.context,
    kind: meta.kind,
    messageCount: meta.messageCount,
  };
}

function pruneArtifactsFromMetas(metas: SessionMeta[]): void {
  const keepIds = metas.flatMap((m) => m.artifactIds);
  try {
    useArtifacts.getState().prune(keepIds);
  } catch {
    // ignore
  }
}

function evictLoadedSessions(state: ChatHistoryState, keepIds: Set<string>): Record<string, ChatMessage[]> {
  const next = { ...state.messagesById };
  for (const id of state.loadedSessionIds) {
    if (keepIds.has(id)) continue;
    delete next[id];
  }
  return next;
}

export const useChatHistory = create<ChatHistoryState>()((set, get) => ({
  sessionsMeta: [],
  messagesById: {},
  activeSessionId: null,
  sessionLoadState: {},
  loadedSessionIds: [],
  pinnedSessionIds: [],
  _hasHydrated: false,
  _activeMessagesReady: false,
  _setHasHydrated: (v) => set({ _hasHydrated: v }),
  _setActiveMessagesReady: (v) => set({ _activeMessagesReady: v }),

  getSessions: () => {
    const { sessionsMeta, messagesById } = get();
    return sessionsMeta.map((meta) =>
      metaToChatSession(meta, messagesById[meta.id] ?? []),
    );
  },

  pinSession: (id) => {
    set((state) => ({
      pinnedSessionIds: state.pinnedSessionIds.includes(id)
        ? state.pinnedSessionIds
        : [...state.pinnedSessionIds, id],
    }));
  },

  unpinSession: (id) => {
    set((state) => ({
      pinnedSessionIds: state.pinnedSessionIds.filter((x) => x !== id),
    }));
  },

  ensureSessionLoaded: async (sessionId) => {
    const state = get();
    if (state.messagesById[sessionId]) {
      set((s) => ({
        sessionLoadState: { ...s.sessionLoadState, [sessionId]: 'loaded' },
      }));
      return;
    }
    set((s) => ({
      sessionLoadState: { ...s.sessionLoadState, [sessionId]: 'loading' },
    }));
    const messages = await loadSessionMessages(sessionId);
    if (!messages) {
      set((s) => ({
        sessionLoadState: { ...s.sessionLoadState, [sessionId]: 'error' },
      }));
      return;
    }
    set((s) => {
      const keep = new Set([
        sessionId,
        s.activeSessionId,
        ...s.pinnedSessionIds,
      ].filter(Boolean) as string[]);
      let loadedSessionIds = [...s.loadedSessionIds.filter((x) => x !== sessionId), sessionId];
      while (loadedSessionIds.length > MAX_LOADED_SESSIONS) {
        const candidate = loadedSessionIds.find((x) => !keep.has(x));
        if (!candidate) break;
        loadedSessionIds = loadedSessionIds.filter((x) => x !== candidate);
        keep.add(sessionId);
      }
      const messagesById = { ...s.messagesById, [sessionId]: messages };
      const evictKeep = new Set([...loadedSessionIds, ...s.pinnedSessionIds, s.activeSessionId].filter(Boolean) as string[]);
      const pruned = evictLoadedSessions({ ...s, messagesById, loadedSessionIds }, evictKeep);
      return {
        messagesById: pruned,
        loadedSessionIds,
        sessionLoadState: { ...s.sessionLoadState, [sessionId]: 'loaded' },
      };
    });
  },

  createSession: (context, kind) => {
    const id = Date.now().toString();
    const now = Date.now();
    const meta: SessionMeta = {
      id,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      kind: kind === 'floating' ? 'floating' : undefined,
      context,
      messageCount: 0,
      artifactIds: [],
    };
    const claimActive = kind !== 'floating';
    set((state) => {
      const sessionsMeta = [meta, ...state.sessionsMeta];
      const capped = sessionsMeta.length > MAX_SESSIONS ? sessionsMeta.slice(0, MAX_SESSIONS) : sessionsMeta;
      if (sessionsMeta.length > MAX_SESSIONS) {
        const dropped = sessionsMeta.slice(MAX_SESSIONS);
        for (const d of dropped) {
          void deleteSessionData(d.id, []);
        }
        pruneArtifactsFromMetas(capped);
      }
      saveManifest({
        version: 2,
        activeSessionId: claimActive ? id : state.activeSessionId,
        sessions: capped,
      });
      return {
        sessionsMeta: capped,
        messagesById: { ...state.messagesById, [id]: [] },
        loadedSessionIds: [...state.loadedSessionIds.filter((x) => x !== id), id],
        activeSessionId: claimActive ? id : state.activeSessionId,
        sessionLoadState: { ...state.sessionLoadState, [id]: 'loaded' },
        _activeMessagesReady: claimActive ? true : state._activeMessagesReady,
      };
    });
    saveSessionMessages(id, []);
    return id;
  },

  deleteSession: (id) => {
    set((state) => {
      const sessionsMeta = state.sessionsMeta.filter((s) => s.id !== id);
      const newActiveId =
        state.activeSessionId === id
          ? sessionsMeta.length > 0
            ? sessionsMeta[0].id
            : null
          : state.activeSessionId;
      const { [id]: _drop, ...messagesById } = state.messagesById;
      pruneArtifactsFromMetas(sessionsMeta);
      saveManifest({ version: 2, activeSessionId: newActiveId, sessions: sessionsMeta });
      void (async () => {
        const blobIds = await listBlobIdsForSession(id);
        await deleteSessionData(id, blobIds);
      })();
      return {
        sessionsMeta,
        messagesById,
        activeSessionId: newActiveId,
        loadedSessionIds: state.loadedSessionIds.filter((x) => x !== id),
        sessionLoadState: { ...state.sessionLoadState, [id]: 'idle' },
      };
    });
  },

  switchSession: (id) => {
    set({ activeSessionId: id, _activeMessagesReady: false });
    void get().ensureSessionLoaded(id).then(() => {
      if (get().activeSessionId === id) {
        get()._setActiveMessagesReady(true);
      }
    });
  },

  addMessage: (sessionId, message) => {
    set((state) => {
      const storedMessage = persistInlineAttachments(message);
      const prev = state.messagesById[sessionId] ?? [];
      const messages = [...prev, storedMessage];
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              messageCount: messages.length,
              preview: storedMessage.role === 'user' ? storedMessage.content.slice(0, 80) : s.preview,
              artifactIds: mergeArtifactIds(s.artifactIds, [storedMessage]),
            }
          : s,
      );
      saveSessionMessages(sessionId, messages);
      saveManifest({
        version: 2,
        activeSessionId: state.activeSessionId,
        sessions: sessionsMeta,
      });
      return { messagesById: { ...state.messagesById, [sessionId]: messages }, sessionsMeta };
    });
  },

  // 性能契约：仅替换目标 session / message；未修改 session 须保留引用（供 useChat 引用相等订阅）。
  updateMessage: (sessionId, messageId, updates) => {
    set((state) => {
      const prev = state.messagesById[sessionId];
      if (!prev) return state;
      const messages = prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m));
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              artifactIds: mergeArtifactIds(s.artifactIds, messages),
            }
          : s,
      );
      saveSessionMessages(sessionId, messages);
      saveManifest({
        version: 2,
        activeSessionId: state.activeSessionId,
        sessions: sessionsMeta,
      });
      return { messagesById: { ...state.messagesById, [sessionId]: messages }, sessionsMeta };
    });
  },

  updateSessionTitle: (sessionId, title) => {
    set((state) => {
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s,
      );
      saveManifest({
        version: 2,
        activeSessionId: state.activeSessionId,
        sessions: sessionsMeta,
      });
      return { sessionsMeta };
    });
  },
}));

/** 启动时迁移 + 加载 manifest 与当前会话（幂等）。 */
export async function ensureChatHistoryBootstrap(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    if (typeof window === 'undefined') return;
    await migrateFromV1IfNeeded();
    const manifest = await loadManifest();
    const store = useChatHistory.getState();
    if (manifest) {
      useChatHistory.setState({
        sessionsMeta: manifest.sessions,
        activeSessionId: manifest.activeSessionId,
        _hasHydrated: true,
      });
      if (manifest.activeSessionId) {
        await store.ensureSessionLoaded(manifest.activeSessionId);
        useChatHistory.getState()._setActiveMessagesReady(true);
      } else {
        useChatHistory.getState()._setActiveMessagesReady(true);
      }
    } else {
      useChatHistory.setState({ _hasHydrated: true, _activeMessagesReady: true });
    }
  })();
  return bootstrapPromise;
}

type ChatHistoryPersistShim = {
  hasHydrated: () => boolean;
  onHydrate: (fn: () => void) => () => void;
  onFinishHydration: (fn: () => void) => () => void;
};

// 兼容 useHydrated(useChatHistory)
(useChatHistory as typeof useChatHistory & { persist: ChatHistoryPersistShim }).persist = {
  hasHydrated: () => useChatHistory.getState()._hasHydrated,
  onHydrate: (fn: () => void) => {
    fn();
    return () => {};
  },
  onFinishHydration: (fn: () => void) => {
    if (useChatHistory.getState()._hasHydrated) {
      fn();
      return () => {};
    }
    return useChatHistory.subscribe((s) => {
      if (s._hasHydrated) fn();
    });
  },
};
