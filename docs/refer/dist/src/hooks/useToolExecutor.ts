import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { chapterContents } from '../content';
import { getChapter } from '../content/chapters';
import type { ToolCallBlock } from '../types/chat';

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
  cacheHit?: boolean;
}

// 简单内存缓存
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

const generateCacheKey = (type: string, id?: string): string => {
  return `tool:${type}${id ? `:${id}` : ''}`;
};

const getCached = (key: string): any | null => {
  const entry = contentCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return { data: entry.data, cacheHit: true };
  }
  return null;
};

const setCached = (key: string, data: any): void => {
  contentCache.set(key, { data, timestamp: Date.now() });
};

export const useToolExecutor = () => {
  const { chapterId, sectionId } = useParams<{ chapterId: string; sectionId: string }>();

  const executeTool = useCallback(async (toolCall: ToolCallBlock): Promise<ToolResult> => {
    
    try {
      switch (toolCall.name) {
        case 'getCurrentPage': {
          const cacheKey = generateCacheKey('currentPage', `${chapterId}:${sectionId}`);
          const cached = getCached(cacheKey);
          if (cached) {
            return { success: true, data: cached.data, cacheHit: true };
          }

          if (!chapterId || !sectionId) {
            return { success: false, data: null, error: '当前不在任何章节页面' };
          }

          const id = Number(chapterId);
          const chapter = getChapter(id);
          const contentData = chapterContents[id]?.sections.find(s => s.id === sectionId);

          const result = {
            chapterId: id,
            chapterTitle: chapter?.title || '',
            sectionId: sectionId,
            sectionTitle: chapter?.sections.find(s => s.id === sectionId)?.title || '',
            content: contentData?.content || '该小节内容正在开发中',
            keyPoints: chapter?.sections.find(s => s.id === sectionId)?.keyPoints || []
          };

          setCached(cacheKey, result);
          return { success: true, data: result, cacheHit: false };
        }

        case 'getAllChapters': {
          const cacheKey = generateCacheKey('allChapters');
          const cached = getCached(cacheKey);
          if (cached) {
            return { success: true, data: cached.data, cacheHit: true };
          }

          const allChapters = Object.entries(chapterContents).map(([id, content]) => {
            const chapter = getChapter(Number(id));
            return {
              chapterId: Number(id),
              title: chapter?.title || '',
              sectionCount: content.sections.length,
              difficulty: chapter?.difficulty || 3,
              examWeight: chapter?.examWeight || 0,
              sections: content.sections.map(s => ({
                id: s.id,
                title: s.title
              }))
            };
          });

          setCached(cacheKey, allChapters);
          return { success: true, data: allChapters, cacheHit: false };
        }

        case 'getSectionContent': {
          const targetSectionId = toolCall.arguments.sectionId as string;
          if (!targetSectionId || !targetSectionId.includes('.')) {
            return { success: false, data: null, error: '无效的小节ID格式，应为"章节.小节"如"3.2"' };
          }

          const cacheKey = generateCacheKey('section', targetSectionId);
          const cached = getCached(cacheKey);
          if (cached) {
            return { success: true, data: cached.data, cacheHit: true };
          }

          const [chId] = targetSectionId.split('.');
          const id = Number(chId);
          const chapter = getChapter(id);
          const contentData = chapterContents[id]?.sections.find(s => s.id === targetSectionId);

          if (!contentData) {
            return { success: false, data: null, error: `未找到小节: ${targetSectionId}` };
          }

          const result = {
            chapterId: id,
            chapterTitle: chapter?.title || '',
            sectionId: targetSectionId,
            sectionTitle: contentData.title,
            content: contentData.content,
            keyPoints: chapter?.sections.find(s => s.id === targetSectionId)?.keyPoints || []
          };

          setCached(cacheKey, result);
          return { success: true, data: result, cacheHit: false };
        }

        case 'webSearch': {
          // 联网搜索需要在环境变量中配置搜索API
          const searchKey = import.meta.env.VITE_SERPAPI_KEY;
          if (!searchKey) {
            return { 
              success: false, 
              data: null, 
              error: '联网搜索未配置，请在环境变量中设置 VITE_SERPAPI_KEY' 
            };
          }

          // const query = toolCall.arguments.query as string;
          // const numResults = (toolCall.arguments.numResults as number) || 5;

          // 这里应该调用实际的搜索API
          // 简化实现，实际应该调用SerpAPI等
          return { 
            success: false, 
            data: null, 
            error: '联网搜索功能需要配置第三方API' 
          };
        }

        default:
          return { success: false, data: null, error: `未知工具: ${toolCall.name}` };
      }
    } catch (err: any) {
      return { success: false, data: null, error: err.message || '工具执行失败' };
    }
  }, [chapterId, sectionId]);

  return { executeTool, contentCache };
};

export default useToolExecutor;
