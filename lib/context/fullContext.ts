import type { ContextManager, BuildContextResult } from './types';
import { getMaxTokens } from './types';
import type { ChatContext } from '@/lib/types/chat';
import { contentTree } from '@/content/manifest';
import { getContentItem } from '@/content';
import { readSectionMarkdown } from '@/lib/content/loader';
import type { SubjectId, CategoryId } from '@/lib/types/content';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// ── Token 估算 ──

export function estimateTokens(text: string): number {
  let tokens = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code > 0x4dff && code < 0x9fff) {
      // CJK 统一汉字：1 字 ≈ 2 token
      tokens += 2;
    } else if (/[a-zA-Z]/.test(char)) {
      // 英文字母累积为词后估算，此处简化：0.325/字母（≈1.3/词 ÷ 4字母/词）
      tokens += 0.325;
    } else if (/\s/.test(char)) {
      tokens += 0.2;
    } else {
      tokens += 1;
    }
  }
  return Math.ceil(tokens);
}

// ── 内容加载 ──

function loadPageContent(chatContext: ChatContext): string | null {
  const { subjectId, categoryId, itemId } = chatContext;

  if (subjectId === 'probability' && categoryId === 'detail') {
    const chapterMatch = itemId.match(/^(\d+)\./);
    if (chapterMatch) {
      const chapterNum = parseInt(chapterMatch[1]);
      const chapterId = `ch${String(chapterNum).padStart(2, '0')}`;
      return readSectionMarkdown(chapterId, itemId);
    }
    return readSectionMarkdown(itemId, 'index');
  }

  // 其他科目/分类：尝试通用路径
  try {
    const filePath = path.join(
      process.cwd(), 'content', subjectId, categoryId, `${itemId}.md`,
    );
    return fs.readFileSync(filePath, 'utf8') ?? null;
  } catch {
    return null;
  }
}

// ── 文件夹树摘要 ──

function buildTreeSummary(): string {
  const lines: string[] = [];
  for (const subject of contentTree.subjects) {
    lines.push(`[${subject.name}]`);
    for (const cat of subject.categories) {
      const itemTitles = cat.items.map((i) => i.title).join(', ');
      lines.push(`  ${cat.name}: ${itemTitles || '(空)'}`);
    }
  }
  return lines.join('\n');
}

// ── 缓存 ──

interface CacheEntry {
  pageId: string;
  contentHash: string;
}

function hashContent(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

// ── 全量上下文管理器 ──

export class FullContextManager implements ContextManager {
  mode = 'full' as const;
  private cache: CacheEntry | null = null;
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
    const cacheHit = this.cache !== null
      && this.cache.pageId === pageId
      && this.cache.contentHash === contentHash;

    this.cache = { pageId, contentHash };

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

    // 系统提示词
    parts.push('你是一个课程学习助手，根据以下课程内容回答学生的问题。');

    // 文件夹树结构摘要
    parts.push('\n## 课程目录\n' + buildTreeSummary());

    // 当前页面内容
    const pageContent = loadPageContent(chatContext);
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
