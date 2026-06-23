import { create } from 'zustand';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
}

const EMPTY_USAGE: TokenUsage = { promptTokens: 0, completionTokens: 0, cachedTokens: 0, totalTokens: 0 };

export interface TokenTrackerState {
  sessionTotal: TokenUsage;
  lastTurn: TokenUsage;
  /** Client-side estimated context token count (updated before each send). */
  currentContextTokens: number;
  /** Model context limit in tokens (derived from ModelInfo.contextK). */
  modelContextLimit: number;
  /** 最后一次收到 usage 事件的时间戳（Date.now()），用于 prefix cache 倒计时。 */
  lastRequestTime: number | null;

  addUsage(usage: Partial<TokenUsage>): void;
  setCurrentContext(tokens: number, limit: number): void;
  resetSession(): void;
}

export const useTokenTracker = create<TokenTrackerState>((set) => ({
  sessionTotal: { ...EMPTY_USAGE },
  lastTurn: { ...EMPTY_USAGE },
  currentContextTokens: 0,
  modelContextLimit: 128_000,
  lastRequestTime: null,

  addUsage(usage) {
    set((s) => {
      const turn: TokenUsage = {
        promptTokens: usage.promptTokens ?? 0,
        completionTokens: usage.completionTokens ?? 0,
        cachedTokens: usage.cachedTokens ?? 0,
        totalTokens: usage.totalTokens ?? ((usage.promptTokens ?? 0) + (usage.completionTokens ?? 0)),
      };
      return {
        lastTurn: turn,
        lastRequestTime: Date.now(),
        sessionTotal: {
          promptTokens: s.sessionTotal.promptTokens + turn.promptTokens,
          completionTokens: s.sessionTotal.completionTokens + turn.completionTokens,
          cachedTokens: s.sessionTotal.cachedTokens + turn.cachedTokens,
          totalTokens: s.sessionTotal.totalTokens + turn.totalTokens,
        },
      };
    });
  },

  setCurrentContext(tokens, limit) {
    set({ currentContextTokens: tokens, modelContextLimit: limit });
  },

  resetSession() {
    set({
      sessionTotal: { ...EMPTY_USAGE },
      lastTurn: { ...EMPTY_USAGE },
      currentContextTokens: 0,
      lastRequestTime: null,
    });
  },
}));
