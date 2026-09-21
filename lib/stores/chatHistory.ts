import { create } from 'zustand';
import type { ChatMessage, ChatContext } from '@/lib/types/chat';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import {
  type ChatFolder,
  type ChatManifestV2,
  type SessionMeta,
  manifestFrom,
  ensureDefaultProjects as ensureDefaultProjectRows,
  isSystemProject,
  mergeArtifactIds,
  loadManifest,
  saveManifest,
  loadSessionMessages,
  saveSessionMessages,
  migrateFromV1IfNeeded,
  deleteSessionData,
  listBlobIdsForSession,
  persistInlineAttachments,
  scheduleOrphanChatGc,
} from '@/lib/storage/chatStorage';
import { getMessageText } from '@/lib/chat/messageParts';
import { mergeRememberedSlices } from '@/lib/project/sessionSlices';
import { scheduleCloudTombstone, scheduleCloudUpsert } from '@/lib/sync/schedule';

const MAX_LOADED_SESSIONS = 3;
const MAX_SESSIONS = 50;

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  context?: ChatContext;
  kind?: 'main' | 'floating' | 'note';
  /** Storage v2：历史列表在未加载消息体时使用 */
  messageCount?: number;
}

interface ChatHistoryState {
  sessionsMeta: SessionMeta[];
  /** 对话项目（与 sessionsMeta 一起写进 manifest）；含两个系统项目。 */
  folders: ChatFolder[];
  /** 下一次「新建对话」的落点项目；null = 不使用项目。 */
  activeProjectId: string | null;
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
  /** 补齐两个系统项目（幂等）。水合前不落盘。 */
  ensureDefaultProjects: () => void;
  /** 选择/清空下一次新建对话的落点项目。 */
  setActiveProject: (projectId: string | null) => void;
  /** 新建会话；folderId 落到某个项目（系统项目的成员由 kind 决定，不从这条路径传）。 */
  createSession: (context?: ChatContext, kind?: 'main' | 'floating' | 'note', folderId?: string | null) => string;
  /**
   * 显式「新建对话」：左栏按钮 / 右键菜单 / 快捷键 / 面板头部都走这里，规则只有一份。
   * 已经站在一条空白新对话里就什么都不做；否则**复用**最新那条空白 main 会话；都没有才真的新建。
   * 防的是连点：`MAX_SESSIONS` 到顶后每多建一条，最旧的会话会连同消息一起被删掉。
   * 未水合时返回 null 并等水合完再做（绝不基于空列表落盘）。
   */
  startNewChat: (context?: ChatContext, projectId?: string | null) => string | null;
  /** 「点了新建、复用了已有空白对话」的累计次数：只给 UI 一次轻反馈用，不落盘。 */
  blankChatPulse: number;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  replaceMessages: (sessionId: string, messages: ChatMessage[]) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  /** 归档 / 取消归档；归档不删除消息，只是从默认列表移出。 */
  archiveSession: (sessionId: string, archived: boolean) => void;
  /** 新建项目；两个系统项目由 ensureDefaultProjects 种下，不走这里。 */
  createFolder: (name?: string, opts?: { system?: ChatFolder['system'] }) => string;
  /** 重命名项目（系统项目也可以改显示名），并把新名字同步到云端。 */
  renameFolder: (folderId: string, name: string) => void;
  /** 删除项目；系统项目不可删（返回 false），成员会话退回 Recents。 */
  deleteFolder: (folderId: string) => boolean;
  moveSessionToFolder: (sessionId: string, folderId: string | null) => void;
  /** 记录本会话读过的项目切片（去重 + 上限截断）；没有新 id 时不落盘。 */
  rememberReadSlices: (sessionId: string, sliceIds: string[]) => void;
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

/**
 * manifest 全量落盘（唯一入口）。
 *
 * **未水合前一律不写**：那时 sessionsMeta 还是空数组，写下去等于把盘上真实的会话列表
 * 覆盖成「只剩刚建的那一条」；紧接着启动期的孤儿 GC 会以 manifest 为唯一真相源，
 * 把其余会话的消息体全部当成孤儿删掉——2026-09-19 的真实数据事故就是这个链路。
 * 未水合期间照常改内存，但绝不允许落盘。
 */
function persistManifest(state: ChatHistoryState, manifest: ChatManifestV2): void {
  if (!state._hasHydrated) return;
  saveManifest(manifest);
}

/**
 * 从当前状态出发构造 manifest，只覆盖显式传入的字段。
 * **不允许手写 manifest 字面量**：2026-09-19 的会话清空事故与之后的「云端拉取丢 projects」
 * 都是漏字段造成的，多一个入口就多一次漏的机会。
 */
function manifestOf(
  state: Pick<ChatHistoryState, 'activeSessionId' | 'sessionsMeta' | 'folders' | 'activeProjectId'>,
  overrides: Partial<Pick<ChatManifestV2, 'activeSessionId' | 'sessions' | 'folders' | 'activeProjectId'>> = {},
): ChatManifestV2 {
  return manifestFrom(state, overrides);
}

/**
 * 「空白新对话」：main 类型、没归档、一条消息都没有。
 * 用 meta.messageCount 判定（写在 manifest 里），不依赖消息体是否已从 IndexedDB 加载回来，
 * 否则一个正在加载的真实对话会被误判成空白。
 */
function isBlankMainSession(meta: SessionMeta): boolean {
  return meta.kind !== 'floating' && meta.kind !== 'note' && !meta.archived && meta.messageCount === 0;
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

function sameStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export const useChatHistory = create<ChatHistoryState>()((set, get) => ({
  sessionsMeta: [],
  folders: [],
  activeProjectId: null,
  messagesById: {},
  activeSessionId: null,
  sessionLoadState: {},
  loadedSessionIds: [],
  pinnedSessionIds: [],
  _hasHydrated: false,
  _activeMessagesReady: false,
  blankChatPulse: 0,
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

  createSession: (context, kind, folderId) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const claimActive = kind !== 'floating' && kind !== 'note';
    const meta: SessionMeta = {
      id,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      kind: claimActive ? undefined : kind,
      context,
      messageCount: 0,
      artifactIds: [],
      // 系统项目的成员由 kind 决定（笔记记录 / 划词摘录），只有普通会话才落 folderId。
      ...(claimActive && folderId ? { folderId } : {}),
    };
    set((state) => {
      const sessionsMeta = [meta, ...state.sessionsMeta];
      const capped = sessionsMeta.length > MAX_SESSIONS ? sessionsMeta.slice(0, MAX_SESSIONS) : sessionsMeta;
      const dropped = sessionsMeta.length > MAX_SESSIONS ? sessionsMeta.slice(MAX_SESSIONS) : [];
      const droppedIds = new Set(dropped.map((d) => d.id));
      if (dropped.length > 0) {
        for (const d of dropped) {
          void (async () => {
            const blobIds = await listBlobIdsForSession(d.id);
            await deleteSessionData(d.id, blobIds);
            scheduleOrphanChatGc();
          })();
        }
        pruneArtifactsFromMetas(capped);
      }
      const messagesById = { ...state.messagesById, [id]: [] };
      for (const dropId of droppedIds) delete messagesById[dropId];
      persistManifest(
        state,
        manifestOf(state, { activeSessionId: claimActive ? id : state.activeSessionId, sessions: capped }),
      );
      return {
        sessionsMeta: capped,
        messagesById,
        loadedSessionIds: [...state.loadedSessionIds.filter((x) => x !== id && !droppedIds.has(x)), id],
        activeSessionId: claimActive ? id : state.activeSessionId,
        sessionLoadState: { ...state.sessionLoadState, [id]: 'loaded' },
        _activeMessagesReady: claimActive ? true : state._activeMessagesReady,
      };
    });
    saveSessionMessages(id, []);
    scheduleCloudUpsert('chat-session', id);
    return id;
  },

  startNewChat: (context, projectId) => {
    const state = get();
    const targetProjectId = projectId === undefined ? state.activeProjectId : projectId;
    // 还没水合：此刻的 sessionsMeta 是空数组，任何「新建」都会把盘上的真实列表覆盖掉。
    // 等水合完再按当时的真实列表决定，期间返回 null（调用方都不依赖返回值）。
    if (!state._hasHydrated) {
      void ensureChatHistoryBootstrap()
        .then(() => {
          get().startNewChat(context, projectId);
        })
        .catch(() => {
          // 水合失败就什么都不做：宁可这次点击没反应，也不能基于空列表落盘
        });
      return null;
    }
    // 先看「脚下这条」：已经站在一条空白新对话里就原地不动
    // （草稿、输入框实例都原样保留），只放一个脉冲让 UI 提示一下。
    const active = state.sessionsMeta.find((meta) => meta.id === state.activeSessionId);
    if (active && isBlankMainSession(active)) {
      set({ blankChatPulse: state.blankChatPulse + 1 });
      return active.id;
    }
    // 否则复用列表里最近的一条空白新对话（sessionsMeta 新的在前）。
    const blank = state.sessionsMeta.find(isBlankMainSession);
    if (!blank) return get().createSession(context, undefined, targetProjectId);
    // 复用而不是新建。**不走 switchSession**：它会先从 IndexedDB 读一次消息体，
    // 而空白会话的消息体可能压根不在盘上，读空会让 loadState 变 'error'；
    // canSendNow 只认 'loaded'，于是发送被静默挡掉。
    // 复用一条已有空白对话时，也要把它挪到这次选的落点项目上（否则 chip 选了项目却没生效）。
    const nextFolderId = targetProjectId ?? null;
    const sessionsMeta =
      (blank.folderId ?? null) === nextFolderId
        ? state.sessionsMeta
        : state.sessionsMeta.map((meta) => (meta.id === blank.id ? { ...meta, folderId: nextFolderId } : meta));
    set({
      sessionsMeta,
      activeSessionId: blank.id,
      messagesById: state.messagesById[blank.id]
        ? state.messagesById
        : { ...state.messagesById, [blank.id]: [] },
      sessionLoadState: { ...state.sessionLoadState, [blank.id]: 'loaded' },
      loadedSessionIds: [...state.loadedSessionIds.filter((id) => id !== blank.id), blank.id],
      _activeMessagesReady: true,
    });
    persistManifest(state, manifestOf(state, { activeSessionId: blank.id, sessions: sessionsMeta }));
    if (sessionsMeta !== state.sessionsMeta) scheduleCloudUpsert('chat-session', blank.id);
    return blank.id;
  },

  deleteSession: (id) => {
    let nextActiveToLoad: string | null = null;
    set((state) => {
      const sessionsMeta = state.sessionsMeta.filter((s) => s.id !== id);
      const deletedActive = state.activeSessionId === id;
      const newActiveId =
        deletedActive
          ? sessionsMeta.length > 0
            ? sessionsMeta[0].id
            : null
          : state.activeSessionId;
      nextActiveToLoad = deletedActive ? newActiveId : null;
      const messagesById = { ...state.messagesById };
      delete messagesById[id];
      pruneArtifactsFromMetas(sessionsMeta);
      persistManifest(state, manifestOf(state, { activeSessionId: newActiveId, sessions: sessionsMeta }));
      void (async () => {
        const blobIds = await listBlobIdsForSession(id);
        await deleteSessionData(id, blobIds);
        scheduleOrphanChatGc();
      })();
      scheduleCloudTombstone('chat-session', id);
      return {
        sessionsMeta,
        messagesById,
        activeSessionId: newActiveId,
        loadedSessionIds: state.loadedSessionIds.filter((x) => x !== id),
        sessionLoadState: { ...state.sessionLoadState, [id]: 'idle' },
        _activeMessagesReady: deletedActive ? newActiveId === null : state._activeMessagesReady,
      };
    });
    if (nextActiveToLoad) {
      void get().ensureSessionLoaded(nextActiveToLoad).then(() => {
        if (get().activeSessionId === nextActiveToLoad) {
          get()._setActiveMessagesReady(true);
        }
      });
    }
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
      if (!state.sessionsMeta.some((s) => s.id === sessionId)) return state;
      const storedMessage = persistInlineAttachments(message);
      const prev = state.messagesById[sessionId] ?? [];
      const messages = [...prev, storedMessage];
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              messageCount: messages.length,
              preview: storedMessage.role === 'user' ? getMessageText(storedMessage).slice(0, 80) : s.preview,
              artifactIds: mergeArtifactIds(s.artifactIds, [storedMessage]),
            }
          : s,
      );
      saveSessionMessages(sessionId, messages);
      persistManifest(state, manifestOf(state, { sessions: sessionsMeta }));
      scheduleCloudUpsert('chat-session', sessionId);
      return { messagesById: { ...state.messagesById, [sessionId]: messages }, sessionsMeta };
    });
  },

  replaceMessages: (sessionId, messages) => {
    set((state) => {
      if (!state.sessionsMeta.some((s) => s.id === sessionId)) return state;
      const stored = messages.map((message) => persistInlineAttachments(message));
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              messageCount: stored.length,
              preview: stored.find((item) => item.role === "user")
                ? getMessageText(stored.find((item) => item.role === "user")!).slice(0, 80)
                : s.preview,
              artifactIds: mergeArtifactIds([], stored),
            }
          : s,
      );
      saveSessionMessages(sessionId, stored);
      persistManifest(state, manifestOf(state, { sessions: sessionsMeta }));
      scheduleCloudUpsert("chat-session", sessionId);
      return { messagesById: { ...state.messagesById, [sessionId]: stored }, sessionsMeta };
    });
  },

  // 性能契约：仅替换目标 session / message；未修改 session 须保留引用（供 useChat 引用相等订阅）。
  updateMessage: (sessionId, messageId, updates) => {
    set((state) => {
      if (!state.sessionsMeta.some((s) => s.id === sessionId)) return state;
      const prev = state.messagesById[sessionId];
      if (!prev) return state;
      const target = prev.find((m) => m.id === messageId);
      if (!target) return state;
      const updated = { ...target, ...updates };
      const messages = prev.map((m) => (m.id === messageId ? updated : m));
      let shouldSaveManifest = false;
      const sessionsMeta = state.sessionsMeta.map((s) =>
        {
          if (s.id !== sessionId) return s;
          const artifactIds = mergeArtifactIds(s.artifactIds, [updated]);
          if (!sameStringArray(s.artifactIds, artifactIds)) {
            shouldSaveManifest = true;
          }
          return {
            ...s,
            updatedAt: Date.now(),
            artifactIds,
          };
        });
      saveSessionMessages(sessionId, messages);
      if (shouldSaveManifest) {
        persistManifest(state, manifestOf(state, { sessions: sessionsMeta }));
      }
      return { messagesById: { ...state.messagesById, [sessionId]: messages }, sessionsMeta };
    });
  },

  updateSessionTitle: (sessionId, title) => {
    set((state) => {
      if (!state.sessionsMeta.some((s) => s.id === sessionId)) return state;
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s,
      );
      persistManifest(state, manifestOf(state, { sessions: sessionsMeta }));
      scheduleCloudUpsert('chat-session', sessionId);
      return { sessionsMeta };
    });
  },

  archiveSession: (sessionId, archived) => {
    set((state) => {
      if (!state.sessionsMeta.some((s) => s.id === sessionId)) return state;
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId ? { ...s, archived } : s,
      );
      persistManifest(state, manifestOf(state, { sessions: sessionsMeta }));
      return { sessionsMeta };
    });
  },

  /** 系统项目：水合后补齐两个（笔记记录 / 划词摘录），只补缺的，不动用户改过的名字。 */
  ensureDefaultProjects: () => {
    set((state) => {
      const folders = ensureDefaultProjectRows(state.folders);
      if (!folders) return state;
      persistManifest(state, manifestOf(state, { folders }));
      return { folders };
    });
  },

  setActiveProject: (projectId) => {
    const state = get();
    const next = projectId && state.folders.some((folder) => folder.id === projectId) ? projectId : null;
    if (state.activeProjectId === next) return;
    set({ activeProjectId: next });
    persistManifest(get(), manifestOf(get(), { activeProjectId: next }));
  },

  createFolder: (name, opts) => {
    const id = `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    set((state) => {
      const userCount = state.folders.filter((folder) => !isSystemProject(folder)).length;
      const folders = [
        ...state.folders,
        {
          id,
          name: (name ?? '').trim() || `新建项目 ${userCount + 1}`,
          createdAt: now,
          updatedAt: now,
          ...(opts?.system ? { system: opts.system } : {}),
        },
      ];
      persistManifest(state, manifestOf(state, { folders }));
      return { folders };
    });
    scheduleCloudUpsert('chat-project', id);
    return id;
  },

  renameFolder: (folderId, name) => {
    const next = name.trim();
    if (!next) return;
    let changed = false;
    set((state) => {
      const folders = state.folders.map((f) => {
        if (f.id !== folderId || f.name === next) return f;
        changed = true;
        return { ...f, name: next, updatedAt: Date.now() };
      });
      if (!changed) return state;
      persistManifest(state, manifestOf(state, { folders }));
      return { folders };
    });
    // 项目名要跨设备可见：改名走云端 upsert（删除那条路径走 tombstone）。
    if (changed) scheduleCloudUpsert('chat-project', folderId);
  },

  deleteFolder: (folderId) => {
    const target = get().folders.find((folder) => folder.id === folderId);
    // 系统项目（笔记记录 / 划词摘录）不可删：成员由来源决定，删了这些会话就无处安放。
    if (!target || isSystemProject(target)) return false;
    set((state) => {
      const folders = state.folders.filter((f) => f.id !== folderId);
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.folderId === folderId ? { ...s, folderId: null } : s,
      );
      persistManifest(state, manifestOf(state, { sessions: sessionsMeta, folders }));
      return {
        folders,
        sessionsMeta,
        activeProjectId: state.activeProjectId === folderId ? null : state.activeProjectId,
      };
    });
    scheduleCloudTombstone('chat-project', folderId);
    return true;
  },

  moveSessionToFolder: (sessionId, folderId) => {
    let moved = false;
    set((state) => {
      const target = state.sessionsMeta.find((s) => s.id === sessionId);
      if (!target) return state;
      // 系统项目里的会话（note / floating）归属由来源决定，不允许改挂到别的项目。
      if (target.kind === 'note' || target.kind === 'floating') return state;
      if ((target.folderId ?? null) === (folderId ?? null)) return state;
      moved = true;
      const sessionsMeta = state.sessionsMeta.map((s) =>
        s.id === sessionId ? { ...s, folderId } : s,
      );
      persistManifest(state, manifestOf(state, { sessions: sessionsMeta }));
      return { sessionsMeta };
    });
    // 归属变化要跟着会话一起上云，否则换设备看不到它进了哪个项目。
    if (moved) scheduleCloudUpsert('chat-session', sessionId);
  },

  rememberReadSlices: (sessionId, sliceIds) => {
    if (sliceIds.length === 0) return;
    const state = get();
    const target = state.sessionsMeta.find((s) => s.id === sessionId);
    if (!target) return;
    const before = target.readSliceIds ?? [];
    const next = mergeRememberedSlices(before, sliceIds);
    // 没有新增就别落盘：读完同样的片会反复触发这个调用。
    // 注意不能只比长度——到上限后长度不变、内容会滚动。
    if (next.length === before.length && next.every((id, index) => id === before[index])) return;
    const sessionsMeta = state.sessionsMeta.map((s) =>
      s.id === sessionId ? { ...s, readSliceIds: next } : s,
    );
    set({ sessionsMeta });
    persistManifest(get(), manifestOf(get(), { sessions: sessionsMeta }));
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
      const folders = manifest.folders ?? [];
      // 落点项目必须还存在：项目被删掉后 manifest 里可能留下悬空 id。
      const activeProjectId =
        manifest.activeProjectId && folders.some((folder) => folder.id === manifest.activeProjectId)
          ? manifest.activeProjectId
          : null;
      useChatHistory.setState({
        sessionsMeta: manifest.sessions,
        folders,
        activeSessionId: manifest.activeSessionId,
        activeProjectId,
        _hasHydrated: true,
      });
      // 两个系统项目必须在**水合之后**补：persistManifest 的闸门要求 _hasHydrated，
      // 而且补的动作要基于盘上真实的 folders，绝不能基于空数组。
      useChatHistory.getState().ensureDefaultProjects();
      if (manifest.activeSessionId) {
        await store.ensureSessionLoaded(manifest.activeSessionId);
        useChatHistory.getState()._setActiveMessagesReady(true);
      } else {
        useChatHistory.getState()._setActiveMessagesReady(true);
      }
    } else {
      useChatHistory.setState({ _hasHydrated: true, _activeMessagesReady: true });
      useChatHistory.getState().ensureDefaultProjects();
    }
    scheduleOrphanChatGc();
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
