import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage, ChatContext } from '@/lib/types/chat';
import { idbStorage, PERSIST_KEYS } from '@/lib/storage/idbStorage';
import { useArtifacts } from '@/lib/hooks/useArtifacts';

// 对话历史持久化 —— 已从 localStorage 迁移至 IndexedDB（gailvlun-db）。
// 异步存储意味着首屏 store 为空，水合完成后才有数据。
// 消费方应通过 useHydrated(useChatHistory) 门控输入，避免水合前抢跑。
// 会话删除时联动 useArtifacts.prune 清理孤儿 artifact。

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  context?: ChatContext;
  /** 会话来源：缺省/'main' = 右侧主对话；'floating' = 划词浮窗会话（历史面板「划词」栏，可还原）。 */
  kind?: 'main' | 'floating';
}

interface ChatHistoryState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  /** IndexedDB 异步水合完成标志；false = 首屏加载中，消费方应门控输入。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  createSession: (context?: ChatContext, kind?: 'main' | 'floating') => string;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

export const useChatHistory = create<ChatHistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      createSession: (context, kind) => {
        const id = Date.now().toString();
        const newSession: ChatSession = {
          id,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          context,
          ...(kind === 'floating' ? { kind } : {}),
        };
        // 划词会话不抢占主面板的 activeSessionId（否则会劫持当前主对话焦点）。
        const claimActive = kind !== 'floating';
        set((state) => {
          // 最多保留 50 个会话，溢出的最老会话其 artifact 一并清理
          const sessions = [newSession, ...state.sessions];
          const capped = sessions.length > 50 ? sessions.slice(0, 50) : sessions;
          if (sessions.length > 50) {
            const dropped = sessions.slice(50);
            const keepIds = collectArtifactIds(capped);
            const droppedIds = collectArtifactIds(dropped);
            const orphanIds = droppedIds.filter((aid) => !keepIds.includes(aid));
            if (orphanIds.length > 0) {
              pruneArtifacts(keepIds);
            }
          }
          return claimActive ? { sessions: capped, activeSessionId: id } : { sessions: capped };
        });
        return id;
      },

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          const newActiveId =
            state.activeSessionId === id
              ? newSessions.length > 0
                ? newSessions[0].id
                : null
              : state.activeSessionId;
          // 清理孤儿 artifact：删除会话后，不再被任何剩余会话引用的 artifact
          const keepIds = collectArtifactIds(newSessions);
          pruneArtifacts(keepIds);
          return { sessions: newSessions, activeSessionId: newActiveId };
        });
      },

      switchSession: (id) => {
        set({ activeSessionId: id });
      },

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
              : s,
          ),
        }));
      },

      updateMessage: (sessionId, messageId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m,
                  ),
                  updatedAt: Date.now(),
                }
              : s,
          ),
        }));
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, title, updatedAt: Date.now() }
              : s,
          ),
        }));
      },
    }),
    {
      name: PERSIST_KEYS.chatHistory,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ sessions: s.sessions, activeSessionId: s.activeSessionId }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);

// ── 内部辅助 ────────────────────────────────────────────────────

/** 从会话列表中收集所有 artifactId（避免循环依赖，延迟 import）。 */
function collectArtifactIds(sessions: ChatSession[]): string[] {
  const ids: string[] = [];
  for (const s of sessions) {
    for (const m of s.messages) {
      if (m.toolCalls) {
        for (const tc of m.toolCalls) {
          if (tc.artifactId) ids.push(tc.artifactId);
        }
      }
    }
  }
  return ids;
}

/** 调用 useArtifacts.prune 清理孤儿 artifact。 */
function pruneArtifacts(keepIds: string[]): void {
  try {
    useArtifacts.getState().prune(keepIds);
  } catch {
    // useArtifacts 尚未初始化时静默跳过
  }
}
