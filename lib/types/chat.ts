// AI 对话完整类型定义 —— 1:1 参考原 refer/dist/src/types/chat.ts，扩展多科上下文。

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface ToolCallBlock {
  index?: number;
  id: string;
  name: string;
  argumentsStr?: string;
  arguments: Record<string, any>;
  status: 'running' | 'success' | 'error';
  result?: string;
  executionTime?: number;
  /** webSearch 专用：联网来源 + 是否命中缓存。 */
  sources?: WebSearchSource[];
  cacheHit?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  reasoningContent?: string;
  toolCalls?: ToolCallBlock[];
  toolCallId?: string;
  followUpQuestions?: string[];
  metadata?: {
    thinkingEnabled?: boolean;
    searchEnabled?: boolean;
    cacheHit?: boolean;
  };
}

export interface ChatContext {
  subjectId: string;
  categoryId: string;
  itemId: string;
  currentTopic: string;
}

export interface ChatOptions {
  enableThinking?: boolean;
  enableSearch?: boolean;
  thinkingEffort?: 'low' | 'medium' | 'high' | 'max';
  contextMode?: 'full' | 'semantic';
}

export interface ParsedBlock {
  type: 'markdown' | 'component';
  content?: string;
  tagName?: string;
  props?: Record<string, any>;
  childrenText?: string;
}
