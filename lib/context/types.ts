import type { ChatContext } from '@/lib/types/chat';

export type ContextMode = 'full' | 'semantic';

export interface ContextManager {
  mode: ContextMode;
  buildContext(chatContext: ChatContext, userMessage: string): Promise<BuildContextResult>;
}

export interface BuildContextResult {
  context: string;
  tokenCount: number;
  maxTokens: number;
  cacheHit: boolean;
  sources?: string[];
  overflow: boolean;
}

export const MODEL_TOKEN_LIMITS: Record<string, number> = {
  'deepseek-chat': 1_000_000,
  'deepseek-reasoner': 1_000_000,
  'mimo-v2.5-pro': 1_000_000,
  'mimo-v2.5': 1_000_000,
  'mimo-v2-flash': 256_000,
  'default': 128_000,
};

export function getMaxTokens(model: string): number {
  return MODEL_TOKEN_LIMITS[model] ?? MODEL_TOKEN_LIMITS['default'];
}
