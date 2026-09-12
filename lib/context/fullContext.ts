import type { ContextManager, BuildContextResult, BuildContextOptions } from './types';
import { closeReferenceMaterials, getMaxTokens } from './types';
import { assembleReference, pickReferenceTier, summarizePageMarkdown } from './referenceTiers';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';
import type { ChatContext } from '@/lib/types/chat';
import { contentTree } from '@/lib/content-data/manifest';
import { getContentItem } from '@/lib/content-data';
import { readContentMarkdown } from '@/lib/content/loader';
import type { SubjectId, CategoryId } from '@/lib/types/content';
import { createHash } from 'node:crypto';
import { estimateTokens } from './estimateTokens';

// ── 文件夹树摘要（模块级缓存：课程目录运行时不变） ──

let _treeSummaryCache: string | null = null;

function buildTreeSummary(): string {
  if (_treeSummaryCache) return _treeSummaryCache;
  const lines: string[] = [];
  for (const subject of contentTree.subjects) {
    lines.push(`[${subject.name}]`);
    for (const cat of subject.categories) {
      const itemTitles = cat.items.map((i) => i.title).join(', ');
      lines.push(`  ${cat.name}: ${itemTitles || '(空)'}`);
    }
  }
  _treeSummaryCache = lines.join('\n');
  return _treeSummaryCache;
}

// ── 模块级缓存（跨请求持久化，解决 per-request new 实例的缓存失效问题） ──

interface CacheEntry {
  pageId: string;
  contentHash: string;
  tier: string;
}

let _contextCache: CacheEntry | null = null;

function hashContent(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

// ── 全量上下文管理器 ──

export class FullContextManager implements ContextManager {
  mode = 'full' as const;
  private model: string;

  constructor(model = DEFAULT_MODEL_ID) {
    this.model = model;
  }

  async buildContext(
    chatContext: ChatContext,
    _userMessage?: string,
    options?: BuildContextOptions,
  ): Promise<BuildContextResult> {
    const maxTokens = getMaxTokens(this.model);
    const outline = buildTreeSummary();
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
    const summary = pageContent ? summarizePageMarkdown(pageContent, title) : "";
    const full = pageContent ? `## 当前内容：${title}\n${pageContent}` : "";

    let tier = pickReferenceTier({ compact: options?.compact });
    let assembled = assembleReference({ outline, summary, full }, tier);
    let tokenCount = estimateTokens(closeReferenceMaterials(assembled));
    if (!options?.compact && tokenCount > maxTokens) {
      tier = "summary";
      assembled = assembleReference({ outline, summary, full }, tier);
      tokenCount = estimateTokens(closeReferenceMaterials(assembled));
    }
    if (options?.compact && tokenCount / Math.max(maxTokens, 1) >= 0.8) {
      tier = "outline";
      assembled = assembleReference({ outline, summary, full }, tier);
      tokenCount = estimateTokens(closeReferenceMaterials(assembled));
    }

    // 提问只留在最后一条 user；这里只放参考材料，收尾不含用户原话。
    const context = closeReferenceMaterials(assembled);
    tokenCount = estimateTokens(context);

    const pageId = `${chatContext.subjectId}/${chatContext.categoryId}/${chatContext.itemId}`;
    const contentHash = hashContent(assembled);
    const cacheHit = _contextCache !== null
      && _contextCache.pageId === pageId
      && _contextCache.contentHash === contentHash
      && _contextCache.tier === tier;

    _contextCache = { pageId, contentHash, tier };

    const sources = this.collectSources(chatContext);

    return {
      context,
      tokenCount,
      maxTokens,
      cacheHit,
      sources,
      overflow: tokenCount > maxTokens,
      tier,
    };
  }

  async getFullContext(chatContext: ChatContext): Promise<string> {
    const result = await this.buildContext(chatContext, "", { compact: false });
    return result.context.replace(/\n\n以上是参考材料$/, "");
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
