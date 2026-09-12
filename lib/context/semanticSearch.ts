import type { ContextManager, BuildContextResult, BuildContextOptions } from './types';
import { closeReferenceMaterials, getMaxTokens } from './types';
import { summarizePageMarkdown } from './referenceTiers';
import { DEFAULT_MODEL_ID, type CustomApiGroup } from '@/lib/ai/models';
import type { ChatContext } from '@/lib/types/chat';
import { readContentMarkdown } from '@/lib/content/loader';
import { getContentItem } from '@/lib/content-data';
import type { SubjectId, CategoryId } from '@/lib/types/content';
import { isAcademicYearId } from '@/lib/constants/academic-year';
import { estimateTokens } from './estimateTokens';

// ── 预留接口定义 ──

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

interface VectorStore {
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
  private customGroups: CustomApiGroup[];

  constructor(model = DEFAULT_MODEL_ID, customGroups: CustomApiGroup[] = []) {
    this.model = model;
    this.customGroups = customGroups;
  }

  async buildContext(
    chatContext: ChatContext,
    userMessage: string,
    options?: BuildContextOptions,
  ): Promise<BuildContextResult> {
    const maxTokens = getMaxTokens(this.model, this.customGroups);
    const parts: string[] = [];
    const compact = options?.compact === true;

    const pageContent = readContentMarkdown(
      chatContext.subjectId,
      chatContext.categoryId,
      chatContext.itemId,
    );
    const item = getContentItem(
      chatContext.subjectId as SubjectId,
      chatContext.categoryId as CategoryId,
      chatContext.itemId,
    );
    const title = item?.title ?? chatContext.currentTopic;
    if (pageContent) {
      if (compact) {
        parts.push('\n' + summarizePageMarkdown(pageContent, title));
      } else {
        parts.push(`\n## 当前内容：${title}\n${pageContent}`);
      }
    }

    // 截断态跳过检索 I/O（P1-15）；非 compact 才注入语义命中。
    if (!compact) {
      try {
        const { hybridSearch } = await import('@/lib/ai/search/hybridSearch');
        const year = chatContext.academicYear;
        const hits = await hybridSearch(userMessage, {
          topK: 5,
          academicYear: year === "all" || !isAcademicYearId(year) ? "all" : year,
          preferSubjectId: chatContext.subjectId,
        });
        if (hits.length > 0) {
          const searchLines = hits.map(
            (h) => `### ${h.title}\npath: ${h.path}\n${h.snippet}`,
          );
          parts.push(`\n## 语义检索相关内容\n${searchLines.join('\n\n')}`);
        }
      } catch {
        // 索引不可用时不注入检索结果
      }
    }

    const body = parts.join('\n');
    // userMessage 只用于检索；提问本身留在最后一条 user，不拼进 system。
    const context = closeReferenceMaterials(body);
    const tokenCount = estimateTokens(context);

    return {
      context,
      tokenCount,
      maxTokens,
      cacheHit: false,
      sources: this.collectSources(chatContext),
      overflow: tokenCount > maxTokens,
      tier: compact ? "summary" : "full",
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
