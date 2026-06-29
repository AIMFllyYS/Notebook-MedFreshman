// AI 对话完整类型定义 —— 1:1 参考原 refer/dist/src/types/chat.ts，扩展多科上下文。

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  icon?: string;
  media?: string;
  /** imageSearch 专用：Unsplash 图片描述（对应 ImageSearchResult.alt）。 */
  alt?: string;
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
  /** imageSearch 专用：图片来源提供者（如 'unsplash'）。 */
  provider?: string;
  /** renderInteractive 专用：生成的交互产物 id（点击「查看」打开弹窗）。 */
  artifactId?: string;
  /** renderInteractive 专用：演示标题。 */
  title?: string;
  /** renderInteractive 专用：生成时传入的 prompt 参数，用于前端展示生成依据。 */
  prompt?: string;
  /** searchNotes 专用：检索命中的笔记片段。 */
  hits?: { title: string; path: string; snippet: string }[];
  /** useSkill 专用：被调用的技能名称。 */
  skill?: string;
  /** generateImage 专用：生图会话 id（前端跨卡片/弹窗共享同一 session）。 */
  imageGenId?: string;
  /** generateImage 专用：AI 优化后的生图提示词。 */
  imageGenPrompt?: string;
  /** generateImage 专用：图片标题。 */
  imageGenTitle?: string;
  /** generateImage 专用：图片尺寸（如 1024x1024）。 */
  imageGenSize?: string;
  /** generateImage 专用：生成数量（1-4）。 */
  imageGenCount?: number;
}

/** 上下文分项 token 统计（服务端按真实拼装精确计算，经 SSE 回传给上下文看板）。 */
export interface ContextBreakdown {
  /** 系统提示词：global+学科 prompt + 全局补充上下文 + 工具定义 JSON。 */
  tools: number;
  /** 技能：可调用菜单 + 固定开启全文 + 被调用的技能工具结果。 */
  skills: number;
  /** 对话：user/assistant 文本及其余工具结果。 */
  conversation: number;
  /** 笔记页面：定位+参考材料 + 读页/检索类工具结果。 */
  pages: number;
  /** 联网搜索：webSearch/imageSearch 工具结果。 */
  webSearch: number;
  total: number;
}

export interface ChatAttachment {
  type: 'image';
  mimeType: string;
  /** data:image/png;base64,... 完整 data-url */
  base64: string;
}

/** Storage v2：附件正文存 chat-blob:{id}，消息内仅保留引用。 */
export interface ChatAttachmentRef {
  type: 'image';
  mimeType: string;
  id: string;
  name?: string;
}

export type StoredChatAttachment = ChatAttachment | ChatAttachmentRef;

export function isAttachmentRef(a: StoredChatAttachment): a is ChatAttachmentRef {
  return 'id' in a && !('base64' in a);
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
  attachments?: StoredChatAttachment[];
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
