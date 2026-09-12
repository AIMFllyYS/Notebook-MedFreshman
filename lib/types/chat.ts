// AI 对话完整类型定义。消息主体采用 AI SDK 的 UIMessage（有序 parts），
// 在其上附加本项目的持久化字段（timestamp / attachments / followUpQuestions）。

import type { FinishReason, UIMessage, UIMessagePart } from 'ai';
import type { StudyTools } from '@/lib/ai/agent/toolTypes';

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  icon?: string;
  media?: string;
  /** imageSearch 专用：Unsplash 图片描述（对应 ImageSearchResult.alt）。 */
  alt?: string;
  /** imageSearch 专用：摄影师名与主页链接（Unsplash 署名要求）。 */
  author?: string;
  authorUrl?: string;
}

/** 单次请求的 token 用量（跨工具轮次已累加）。 */
export interface UsageSummary {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
  /** 实际落地的上游模型；缺省时客户端按所选模型计价。 */
  actualModelId?: string;
}

/** 服务端经 UI Message Stream 下发的自定义 data parts。 */
export type StudyDataParts = {
  /** 瞬时提示（如端点切换），不落库。 */
  info: { message: string };
  'context-breakdown': ContextBreakdown;
  usage: UsageSummary;
  followup: { questions: string[] };
};

/** UIMessage.metadata：本条消息的运行元信息。 */
export interface StudyMessageMetadata {
  thinkingEnabled?: boolean;
  searchEnabled?: boolean;
  /** 上游 prefix cache 是否命中（cachedTokens > 0），不是本地 pageId hash。 */
  cacheHit?: boolean;
  /** 发起本条回复时选中的模型 id。 */
  modelId?: string;
  usage?: UsageSummary;
  /** 从发送到流结束的耗时，供思考链头部展示「已思考 N 秒」。 */
  durationMs?: number;
  /** 本轮生成结束原因。步数触顶时为 tool-calls。 */
  finishReason?: FinishReason;
}

export type ChatMessagePart = UIMessagePart<StudyDataParts, StudyTools>;

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
  /** 未垫高的实际占用。软上限判定必须用这个值。 */
  total: number;
  /** 环显示用，截断态可垫到客户端估算以免假降。 */
  displayTotal?: number;
  /** 当前请求是否因 80% 软上限而走滚动摘要 / 分级裁剪。 */
  truncated?: boolean;
  /** 上游 usage 的 cachedTokens。看板「上下文缓存」绑这个，不再绑本地 pageId hash 槽。 */
  cachedTokens?: number;
  /** 上游 prefix cache 是否命中（cachedTokens > 0）。不是本地全文 MD5 单槽。 */
  cacheHit?: boolean;
  /** 给 UI 持续展示的上下文警示。 */
  warning?: string;
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

/**
 * 会话消息 = AI SDK UIMessage（id / role / parts / metadata）+ 本项目持久化字段。
 * 思考、工具调用、正文都按时间顺序存在 parts 里，渲染层据此生成思考链。
 */
export interface ChatMessage extends UIMessage<StudyMessageMetadata, StudyDataParts, StudyTools> {
  timestamp: number;
  followUpQuestions?: string[];
  attachments?: StoredChatAttachment[];
}

export interface ChatContext {
  subjectId: string;
  categoryId: string;
  itemId: string;
  currentTopic: string;
  /** 当前 UI 学年。智能体默认检索范围；可经工具 crossYear 放开。 */
  academicYear?: string;
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
  props?: Record<string, unknown>;
  childrenText?: string;
}
