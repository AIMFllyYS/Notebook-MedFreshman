import { create } from 'zustand';
import type { ContextBreakdown } from '@/lib/types/chat';

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
  /** 服务端精确的上下文 token 数（promptTokens + completionTokens），不被前端粗估覆盖。 */
  serverContextTokens: number;
  /** 服务端 context_breakdown.total，用于前端增量估算基线。 */
  lastBreakdownTotal: number;
  /** Model context limit in tokens (derived from ModelInfo.contextK). */
  modelContextLimit: number;
  /** 最后一次收到 usage 事件的时间戳（Date.now()），用于 prefix cache 倒计时。 */
  lastRequestTime: number | null;
  /** 服务端回传的上下文分项统计（最近一次发送）；null = 尚无数据。 */
  contextBreakdown: ContextBreakdown | null;

  addUsage(usage: Partial<TokenUsage>): void;
  setCurrentContext(tokens: number, limit: number): void;
  setContextBreakdown(breakdown: ContextBreakdown): void;
  resetSession(): void;
}

export const useTokenTracker = create<TokenTrackerState>((set) => ({
  sessionTotal: { ...EMPTY_USAGE },
  lastTurn: { ...EMPTY_USAGE },
  currentContextTokens: 0,
  serverContextTokens: 0,
  lastBreakdownTotal: 0,
  modelContextLimit: 128_000,
  lastRequestTime: null,
  contextBreakdown: null,

  addUsage(usage) {
    set((s) => {
      const turn: TokenUsage = {
        promptTokens: usage.promptTokens ?? 0,
        completionTokens: usage.completionTokens ?? 0,
        cachedTokens: usage.cachedTokens ?? 0,
        totalTokens: usage.totalTokens ?? ((usage.promptTokens ?? 0) + (usage.completionTokens ?? 0)),
      };
      const serverCtx = turn.promptTokens + turn.completionTokens;
      return {
        lastTurn: turn,
        lastRequestTime: Date.now(),
        serverContextTokens: serverCtx,
        currentContextTokens: serverCtx,
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

  setContextBreakdown(breakdown) {
    set({ contextBreakdown: breakdown, lastBreakdownTotal: breakdown.total });
  },

  resetSession() {
    set({
      sessionTotal: { ...EMPTY_USAGE },
      lastTurn: { ...EMPTY_USAGE },
      currentContextTokens: 0,
      serverContextTokens: 0,
      lastBreakdownTotal: 0,
      lastRequestTime: null,
      contextBreakdown: null,
    });
  },
}));
