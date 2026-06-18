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

// 本地页面内容工具集
export const PAGE_CONTENT_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'getCurrentPage',
      description: '获取当前正在浏览的章节小节完整内容，包括标题、正文、公式、关键知识点',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getAllChapters',
      description: '获取所有章节目录列表，包含章节ID、标题、小节数量、难度权重',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getSectionContent',
      description: '获取指定小节ID的完整内容，包括标题、正文、公式推导、例题',
      parameters: {
        type: 'object',
        properties: {
          sectionId: {
            type: 'string',
            description: '小节ID格式 "章节.小节" 如 "3.2" 或 "1.1"'
          }
        },
        required: ['sectionId']
      }
    }
  }
];

// 联网搜索工具（需要第三方API配置）
export const WEB_SEARCH_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'webSearch',
    description: '搜索互联网获取实时信息，用于补充概率论相关的前沿应用或最新考研动态',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词，建议用中文'
        },
        numResults: {
          type: 'number',
          description: '返回结果数量，默认5条',
          default: 5
        }
      },
      required: ['query']
    }
  }
};

export function getActiveTools(enableSearch: boolean): ToolDefinition[] {
  const tools = [...PAGE_CONTENT_TOOLS];
  if (enableSearch) {
    tools.push(WEB_SEARCH_TOOL);
  }
  return tools;
}
