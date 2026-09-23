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
import type { MultiSearchHit } from '@/lib/content/loader';

// ── 语义命中短 TTL 缓存 ──
// 同一条 user 消息在同科目/学年下的检索结果 60s 内复用：
// 重试、重新生成、软上限触发的二次装配都直接命中，不再付 embed + rerank 双 RTT。

const SEARCH_CACHE_TTL_MS = 60_000;
const SEARCH_CACHE_MAX = 32;
const searchCache = new Map<string, { hits: MultiSearchHit[]; expiresAt: number }>();

function cachedSearchKey(userMessage: string, academicYear: string, subjectId: string | undefined): string {
  return `${academicYear}|${subjectId ?? ""}|${userMessage}`;
}

function readSearchCache(key: string): MultiSearchHit[] | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return null;
  }
  return entry.hits;
}

function writeSearchCache(key: string, hits: MultiSearchHit[]): void {
  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const oldest = searchCache.keys().next().value;
    if (oldest !== undefined) searchCache.delete(oldest);
  }
  searchCache.set(key, { hits, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
}

// ── 预留接口定义 ──

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
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
        const year = chatContext.academicYear;
        const scopedYear = year === "all" || !isAcademicYearId(year) ? "all" : year;
        const cacheKey = cachedSearchKey(userMessage, scopedYear, chatContext.subjectId);
        let hits = readSearchCache(cacheKey);
        if (!hits) {
          const { hybridSearch } = await import('@/lib/ai/search/hybridSearch');
          hits = await hybridSearch(userMessage, {
            topK: 5,
            academicYear: scopedYear,
            preferSubjectId: chatContext.subjectId,
          });
          writeSearchCache(cacheKey, hits);
        }
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
