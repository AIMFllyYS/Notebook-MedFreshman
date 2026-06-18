import { create } from 'zustand';

interface ChatUIState {
  quotedText: string | null;
  quickExplainText: string | null;
  setQuotedText: (text: string | null) => void;
  setQuickExplainText: (text: string | null) => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  quotedText: null,
  quickExplainText: null,
  setQuotedText: (text) => set({ quotedText: text }),
  setQuickExplainText: (text) => set({ quickExplainText: text }),
}));
