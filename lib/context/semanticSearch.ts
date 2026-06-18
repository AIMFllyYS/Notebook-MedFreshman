import type { ContextManager, BuildContextResult } from './types';
import type { ChatContext } from '@/lib/types/chat';

/** 语义检索上下文管理器 - 预留接口，尚未实现 */
export class SemanticSearchManager implements ContextManager {
  mode = 'semantic' as const;

  async buildContext(
    _chatContext: ChatContext,
    _userMessage: string,
  ): Promise<BuildContextResult> {
    // TODO: 接入向量模型实现语义检索
    return {
      context: '',
      tokenCount: 0,
      maxTokens: 1_000_000,
      cacheHit: false,
      sources: [],
      overflow: false,
    };
  }
}

// ── 预留接口定义 ──

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  index(
    documents: { id: string; content: string; metadata?: Record<string, unknown> }[],
  ): Promise<void>;
  query(
    embedding: number[],
    topK: number,
  ): Promise<{ id: string; content: string; score: number }[]>;
}
