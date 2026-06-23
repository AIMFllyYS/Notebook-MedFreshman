// AI 对话完整类型定义 —— 1:1 参考原 refer/dist/src/types/chat.ts，扩展多科上下文。

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  icon?: string;
  media?: string;
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
  /** renderInteractive 专用：生成的交互产物 id（点击「查看」打开弹窗）。 */
  artifactId?: string;
  /** renderInteractive 专用：演示标题。 */
  title?: string;
  /** renderInteractive 专用：生成时传入的 prompt 参数，用于前端展示生成依据。 */
  prompt?: string;
  /** searchNotes 专用：检索命中的笔记片段。 */
  hits?: { title: string; path: string; snippet: string }[];
}

export interface ChatAttachment {
  type: 'image';
  mimeType: string;
  /** data:image/png;base64,... 完整 data-url */
  base64: string;
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
  attachments?: ChatAttachment[];
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
