// 工具类型定义 —— 1:1 参考原 refer/dist/src/types/tools.ts，扩展多科工具。

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
  cacheHit?: boolean;
}

// 本地页面内容工具集（含多科扩展）
export const PAGE_CONTENT_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'getCurrentPage',
      description: '获取当前正在浏览的页面完整内容，包括标题、正文、公式、关键知识点',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getFolderTree',
      description: '获取完整文件夹树结构（科目-分类-文档），用于了解课程全貌或定位其他知识点',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPageContent',
      description: '获取指定页面的完整内容，用于跨小节讲解或对比',
      parameters: {
        type: 'object',
        properties: {
          subjectId: { type: 'string', description: '科目ID，如 probability' },
          categoryId: { type: 'string', description: '分类ID，如 detail' },
          itemId: { type: 'string', description: '内容项ID，如 "1.1"' },
        },
        required: ['subjectId', 'categoryId', 'itemId'],
      },
    },
  },
];

// 联网搜索工具
export const WEB_SEARCH_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'webSearch',
    description: '搜索互联网获取实时信息，用于补充课程相关的前沿应用或最新动态',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词，建议用中文' },
        numResults: { type: 'number', description: '返回结果数量，默认5条', default: 5 },
      },
      required: ['query'],
    },
  },
};

export function getActiveTools(enableSearch: boolean): ToolDefinition[] {
  const tools = [...PAGE_CONTENT_TOOLS];
  if (enableSearch) {
    tools.push(WEB_SEARCH_TOOL);
  }
  return tools;
}
