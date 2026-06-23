import type { ContextManager, BuildContextResult } from './types';
import { getMaxTokens } from './types';
import type { ChatContext } from '@/lib/types/chat';
import { readContentMarkdown } from '@/lib/content/loader';
import { getContentItem } from '@/lib/content-data';
import type { SubjectId, CategoryId } from '@/lib/types/content';
import { estimateTokens } from './estimateTokens';

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

// ── 语义检索上下文管理器 ──

export class SemanticSearchManager implements ContextManager {
  mode = 'semantic' as const;
  private model: string;

  constructor(model = 'deepseek-chat') {
    this.model = model;
  }

  async buildContext(
    chatContext: ChatContext,
    userMessage: string,
  ): Promise<BuildContextResult> {
    const maxTokens = getMaxTokens(this.model);
    const parts: string[] = [];

    // 1. 当前页面全文（与 FullContextManager 保持一致）
    const pageContent = readContentMarkdown(
      chatContext.subjectId,
      chatContext.categoryId,
      chatContext.itemId,
    );
    if (pageContent) {
      const item = getContentItem(
        chatContext.subjectId as SubjectId,
        chatContext.categoryId as CategoryId,
        chatContext.itemId,
      );
      const title = item?.title ?? chatContext.currentTopic;
      parts.push(`\n## 当前内容：${title}\n${pageContent}`);
    }

    // 2. 语义检索相关 chunk
    try {
      const { hybridSearch } = await import('@/lib/ai/search/hybridSearch');
      const hits = await hybridSearch(userMessage, 5);
      if (hits.length > 0) {
        const searchLines = hits.map(
          (h) => `### ${h.title}\npath: ${h.path}\n${h.snippet}`,
        );
        parts.push(`\n## 语义检索相关内容\n${searchLines.join('\n\n')}`);
      }
    } catch {
      // 索引不可用时不注入检索结果
    }

    const context = parts.join('\n') + '\n\n用户提问：' + userMessage;
    const tokenCount = estimateTokens(context);

    return {
      context,
      tokenCount,
      maxTokens,
      cacheHit: false,
      sources: this.collectSources(chatContext),
      overflow: tokenCount > maxTokens,
    };
  }

  private collectSources(chatContext: ChatContext): string[] {
    const sources: string[] = [];
    const item = getContentItem(
      chatContext.subjectId as SubjectId,
      chatContext.categoryId as CategoryId,
      chatContext.itemId,
    );
    if (item) sources.push(item.title);
    return sources;
  }
}
