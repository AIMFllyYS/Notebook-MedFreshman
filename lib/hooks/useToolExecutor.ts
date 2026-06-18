import { useCallback } from 'react';
import type { ChatContext } from '@/lib/types/chat';
import type { ToolResult } from '@/lib/types/tools';
import { contentTree } from '@/content/manifest';

// 内存缓存
const contentCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

function generateCacheKey(type: string, id?: string): string {
  return `tool:${type}${id ? `:${id}` : ''}`;
}

function getCached(key: string): unknown | null {
  const entry = contentCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  contentCache.delete(key);
  return null;
}

function setCached(key: string, data: unknown): void {
  contentCache.set(key, { data, timestamp: Date.now() });
}

export function useToolExecutor(chatContext: ChatContext) {
  const executeTool = useCallback(
    async (name: string, args: Record<string, any>): Promise<ToolResult> => {
      try {
        switch (name) {
          case 'getCurrentPage': {
            const { subjectId, categoryId, itemId } = chatContext;
            const cacheKey = generateCacheKey('currentPage', `${subjectId}/${categoryId}/${itemId}`);
            const cached = getCached(cacheKey);
            if (cached) return { success: true, data: cached, cacheHit: true };

            const params = new URLSearchParams({ subjectId, categoryId, itemId });
            const res = await fetch(`/api/section?${params}`);
            if (!res.ok) return { success: false, data: null, error: `请求失败: ${res.status}` };

            const { content } = (await res.json()) as { content: string | null };
            const result = {
              subjectId,
              categoryId,
              itemId,
              content: content || '该页面内容正在开发中',
            };
            setCached(cacheKey, result);
            return { success: true, data: result, cacheHit: false };
          }

          case 'getFolderTree': {
            const cacheKey = generateCacheKey('folderTree');
            const cached = getCached(cacheKey);
            if (cached) return { success: true, data: cached, cacheHit: true };

            const result = contentTree.subjects.map((s) => ({
              id: s.id,
              name: s.name,
              categories: s.categories.map((c) => ({
                id: c.id,
                name: c.name,
                items: c.items.map((i) => ({
                  id: i.id,
                  title: i.title,
                  status: i.status,
                })),
              })),
            }));
            setCached(cacheKey, result);
            return { success: true, data: result, cacheHit: false };
          }

          case 'getPageContent': {
            const { subjectId, categoryId, itemId: targetItemId } = args;
            if (!subjectId || !categoryId || !targetItemId) {
              return { success: false, data: null, error: '缺少必要参数: subjectId, categoryId, itemId' };
            }
            const cacheKey = generateCacheKey('page', `${subjectId}/${categoryId}/${targetItemId}`);
            const cached = getCached(cacheKey);
            if (cached) return { success: true, data: cached, cacheHit: true };

            const params = new URLSearchParams({
              subjectId: String(subjectId),
              categoryId: String(categoryId),
              itemId: String(targetItemId),
            });
            const res = await fetch(`/api/section?${params}`);
            if (!res.ok) return { success: false, data: null, error: `请求失败: ${res.status}` };

            const { content } = (await res.json()) as { content: string | null };
            const result = {
              subjectId: String(subjectId),
              categoryId: String(categoryId),
              itemId: String(targetItemId),
              content: content || '该页面内容正在开发中',
            };
            setCached(cacheKey, result);
            return { success: true, data: result, cacheHit: false };
          }

          case 'webSearch': {
            // 联网搜索预留接口，需要配置第三方搜索API
            return { success: false, data: null, error: '联网搜索功能暂未开放' };
          }

          default:
            return { success: false, data: null, error: `未知工具: ${name}` };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '工具执行失败';
        return { success: false, data: null, error: message };
      }
    },
    [chatContext],
  );

  return { executeTool };
}
