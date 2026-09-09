import { create } from 'zustand';

// 聊天区轻量 UI 态。划词的「解释/举例/追问」浮窗已迁到多开系统 useFloatingChats；
// 这里只保留「引用到输入框」的选区文本（ChatInput 消费）。
interface ChatUIState {
  quotedText: string | null;
  setQuotedText: (text: string) => void;
  clearQuotedText: () => void;
}

export const useChatUI = create<ChatUIState>((set) => ({
  quotedText: null,
  setQuotedText: (text) => set({ quotedText: text }),
  clearQuotedText: () => set({ quotedText: null }),
}));
