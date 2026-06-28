import { useSyncExternalStore } from 'react';
import { useChatHistory } from './useChatHistory';

/**
 * 对话可交互：manifest 已加载，且当前 active 会话消息已就绪（或无 active 会话）。
 */
export function useChatReady(sessionId?: string | null): boolean {
  return useSyncExternalStore(
    (onChange) => useChatHistory.subscribe(onChange),
    () => {
      const s = useChatHistory.getState();
      if (!s._hasHydrated) return false;
      if (sessionId !== undefined) {
        if (!sessionId) return true;
        return !!s.messagesById[sessionId] || s.sessionLoadState[sessionId] === 'loaded';
      }
      if (!s.activeSessionId) return true;
      return s._activeMessagesReady;
    },
    () => false,
  );
}
