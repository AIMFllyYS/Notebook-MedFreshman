import { create } from 'zustand';

interface QuickExplainPosition {
  x: number;
  y: number;
}

interface QuickExplainMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoningContent?: string;
  timestamp: number;
}

interface QuickExplainSize {
  width: number;
  height: number;
}

interface ChatUIState {
  quotedText: string | null;
  quickExplainText: string | null;
  quickExplainPosition: QuickExplainPosition | null;
  quickExplainMode: 'explain' | 'example';
  quickExplainMessages: QuickExplainMessage[];
  quickExplainSize: QuickExplainSize;
  
  setQuotedText: (text: string) => void;
  clearQuotedText: () => void;
  setQuickExplain: (text: string, position: QuickExplainPosition, mode?: 'explain' | 'example') => void;
  clearQuickExplain: () => void;
  addQuickExplainMessage: (msg: QuickExplainMessage) => void;
  clearQuickExplainMessages: () => void;
  setQuickExplainSize: (size: QuickExplainSize) => void;
}

// 从 localStorage 读取保存的窗口尺寸
const getSavedSize = (): QuickExplainSize => {
  if (typeof window === 'undefined') return { width: 400, height: 450 };
  try {
    const saved = localStorage.getItem('quickExplainWindowSize');
    if (saved) {
      const size = JSON.parse(saved);
      // 验证尺寸是否在有效范围内
      if (size.width >= 360 && size.width <= 800 && size.height >= 320 && size.height <= 600) {
        return size;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved window size:', e);
  }
  return { width: 400, height: 450 };
};

export const useChatUI = create<ChatUIState>((set) => ({
  quotedText: null,
  quickExplainText: null,
  quickExplainPosition: null,
  quickExplainMode: 'explain',
  quickExplainMessages: [],
  quickExplainSize: getSavedSize(),

  setQuotedText: (text) => set({ quotedText: text }),
  clearQuotedText: () => set({ quotedText: null }),

  setQuickExplain: (text, position, mode = 'explain') =>
    set({ quickExplainText: text, quickExplainPosition: position, quickExplainMode: mode }),
  clearQuickExplain: () =>
    set({ quickExplainText: null, quickExplainPosition: null, quickExplainMessages: [] }),

  addQuickExplainMessage: (msg) =>
    set((state) => ({
      quickExplainMessages: [...state.quickExplainMessages, msg],
    })),

  clearQuickExplainMessages: () => set({ quickExplainMessages: [] }),

  setQuickExplainSize: (size) => {
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quickExplainWindowSize', JSON.stringify(size));
      } catch (e) {
        console.warn('Failed to save window size:', e);
      }
    }
    set({ quickExplainSize: size });
  },
}));
