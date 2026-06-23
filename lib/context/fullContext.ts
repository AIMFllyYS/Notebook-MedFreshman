import type { ContextManager, BuildContextResult } from './types';
import { getMaxTokens } from './types';
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
}

let _contextCache: CacheEntry | null = null;

function hashContent(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

// ── 全量上下文管理器 ──

export class FullContextManager implements ContextManager {
  mode = 'full' as const;
  private model: string;

  constructor(model = 'deepseek-chat') {
    this.model = model;
  }

  async buildContext(
    chatContext: ChatContext,
    userMessage: string,
  ): Promise<BuildContextResult> {
    const maxTokens = getMaxTokens(this.model);
    const fullContext = await this.getFullContext(chatContext);
    const context = fullContext + '\n\n用户提问：' + userMessage;
    const tokenCount = estimateTokens(context);

    const pageId = `${chatContext.subjectId}/${chatContext.categoryId}/${chatContext.itemId}`;
    const contentHash = hashContent(fullContext);
    const cacheHit = _contextCache !== null
      && _contextCache.pageId === pageId
      && _contextCache.contentHash === contentHash;

    _contextCache = { pageId, contentHash };

    const sources = this.collectSources(chatContext);

    return {
      context,
      tokenCount,
      maxTokens,
      cacheHit,
      sources,
      overflow: tokenCount > maxTokens,
    };
  }

  async getFullContext(chatContext: ChatContext): Promise<string> {
    const parts: string[] = [];

    parts.push('\n## 课程目录\n' + buildTreeSummary());

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

    return parts.join('\n');
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
