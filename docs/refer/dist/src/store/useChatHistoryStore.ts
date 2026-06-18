import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ChatContext } from '../types/chat';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
  context?: ChatContext;
}

interface ChatHistoryState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  // Actions
  createSession: (context?: ChatContext) => string;
  updateSession: (id: string, messages: ChatMessage[], title?: string) => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
  getActiveSession: () => ChatSession | undefined;
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (context) => {
        const id = Date.now().toString();
        const newSession: ChatSession = {
          id,
          title: '新对话',
          messages: [],
          timestamp: Date.now(),
          context,
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      updateSession: (id, messages, title) => {
        set((state) => {
          const newSessions = state.sessions.map((session) => {
            if (session.id === id) {
              return {
                ...session,
                messages,
                title: title || session.title,
                timestamp: Date.now(), // update timestamp on activity
              };
            }
            return session;
          });
          
          // Move updated session to top
          const updatedIndex = newSessions.findIndex(s => s.id === id);
          if (updatedIndex > 0) {
            const updatedSession = newSessions.splice(updatedIndex, 1)[0];
            newSessions.unshift(updatedSession);
          }

          return { sessions: newSessions };
        });
      },

      switchSession: (id) => {
        set({ activeSessionId: id });
      },

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          let newActiveId = state.activeSessionId;
          if (state.activeSessionId === id) {
            newActiveId = newSessions.length > 0 ? newSessions[0].id : null;
          }
          return {
            sessions: newSessions,
            activeSessionId: newActiveId,
          };
        });
      },

      clearHistory: () => {
        set({ sessions: [], activeSessionId: null });
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId);
      },
    }),
    {
      name: 'chat-history-storage',
    }
  )
);
