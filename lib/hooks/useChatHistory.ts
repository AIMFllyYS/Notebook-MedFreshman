import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ChatContext } from '@/lib/types/chat';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  context?: ChatContext;
}

interface ChatHistoryState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  createSession: (context?: ChatContext) => string;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  clearHistory: () => void;
}

export const useChatHistory = create<ChatHistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (context) => {
        const id = Date.now().toString();
        const newSession: ChatSession = {
          id,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          context,
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
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

      clearHistory: () => {
        set({ sessions: [], activeSessionId: null });
      },
    }),
    { name: 'chat-history' },
  ),
);
