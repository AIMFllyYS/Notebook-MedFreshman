import { isToolUIPart } from 'ai';
import type { ChatAttachment, ChatMessage, ChatMessagePart, StoredChatAttachment } from '@/lib/types/chat';
import { compactStudyParts } from '@/lib/chat/compactStudyParts';
import { MAX_REQUEST_IMAGE_CHARS, MAX_REQUEST_IMAGES } from '@/lib/chat/requestBudget';
import { hasVisibleContent } from '@/lib/chat/messageParts';

export const DEFAULT_MAX_TURNS = Number.MAX_SAFE_INTEGER;
/** @deprecated 软上限改为服务端滚动摘要，不再用 16 条硬切。仍导出以免旧测试/import 断裂。 */
export const SOFT_LIMIT_MAX_TURNS = 16;
/** 与 chatRequestSchema messages 上限对齐，防止 400。 */
export const MAX_REQUEST_MESSAGES = 200;

/** 发给 /api/chat 的消息：UIMessage 形状，本轮图片附件已转成 file part（data URL）。 */
export type RequestMessage = Pick<ChatMessage, 'id' | 'role' | 'parts'>;

export interface BuildRequestMessagesResult {
  messages: RequestMessage[];
  truncated: boolean;
  truncationReason?: 'max-turns' | 'soft-limit';
}

export interface BuildRequestMessagesOptions {
  maxTurns?: number;
  reason?: BuildRequestMessagesResult['truncationReason'];
  /** 默认 false：历史图不进 POST，只给本轮最多 1 张。 */
  preserveAttachmentHistory?: boolean;
}

function keepRequestPart(p: ChatMessagePart): boolean {
  if (p.type === 'text') return p.text.trim().length > 0;
  if (p.type === 'file') return true;
  if (isToolUIPart(p)) return p.state === 'output-available' || p.state === 'input-available';
  return false;
}

function attachmentLabel(attachment: StoredChatAttachment): string {
  return ('name' in attachment && attachment.name?.trim()) || (attachment.type === 'image' ? '图片' : '文件');
}

function historyAttachmentNote(attachments: StoredChatAttachment[] | undefined): string | null {
  const notes = (attachments ?? []).flatMap((attachment) => {
    if (attachment.type === 'image') return [`用户曾附图片「${attachmentLabel(attachment)}」，字节在本机。`];
    if (attachment.type === 'document') return [`用户曾附文档「${attachmentLabel(attachment)}」，字节在本机。`];
    return [];
  });
  return notes.length > 0 ? notes.join(' ') : null;
}

function imageFileParts(attachments: StoredChatAttachment[] | undefined): ChatMessagePart[] {
  const images = (attachments ?? []).filter(
    (a): a is Extract<ChatAttachment, { type: 'image' }> => a.type === 'image' && 'base64' in a && !!a.base64,
  );
  const parts: ChatMessagePart[] = [];
  let chars = 0;
  for (const image of images) {
    if (parts.length >= MAX_REQUEST_IMAGES) break;
    const url = image.base64;
    if (chars + url.length > MAX_REQUEST_IMAGE_CHARS) continue;
    parts.push({ type: 'file', mediaType: image.mimeType, url });
    chars += url.length;
  }
  return parts;
}

function documentTextPart(attachments: StoredChatAttachment[] | undefined): ChatMessagePart | null {
  const documents = (attachments ?? [])
    .filter((a): a is Extract<ChatAttachment, { type: 'document' }> => a.type === 'document' && 'text' in a)
    .map((attachment) => {
      const safeName = attachment.name.replace(/[<>\r\n]/g, '_');
      return `<attached-document name="${safeName}" type="${attachment.mimeType}">\n${attachment.text}\n</attached-document>`;
    });
  if (documents.length === 0) return null;
  return { type: 'text', text: `以下是用户随本轮消息提供的文档正文：\n\n${documents.join('\n\n')}` };
}

export function toRequestMessage(m: ChatMessage, options?: { includeAttachments?: boolean }): RequestMessage {
  const parts: ChatMessagePart[] = compactStudyParts(m.parts.filter(keepRequestPart), 'ui-request');
  if (m.role === 'user') {
    if (options?.includeAttachments) {
      parts.push(...imageFileParts(m.attachments));
      const document = documentTextPart(m.attachments);
      if (document) parts.push(document);
    } else {
      const note = historyAttachmentNote(m.attachments);
      if (note) parts.push({ type: 'text', text: note });
    }
  }
  return { id: m.id, role: m.role, parts };
}

/**
 * 从会话尾部取最近 N 条 user/assistant 消息用于 API 请求。
 * 默认不回放窗口外历史附件；本轮最多带 1 张图。
 */
export function buildRequestMessages(
  sessionMessages: ChatMessage[],
  maxTurnsOrOptions: number | BuildRequestMessagesOptions = DEFAULT_MAX_TURNS,
): BuildRequestMessagesResult {
  const opts: BuildRequestMessagesOptions =
    typeof maxTurnsOrOptions === 'number' ? { maxTurns: maxTurnsOrOptions } : maxTurnsOrOptions;
  const maxTurns = opts.maxTurns ?? DEFAULT_MAX_TURNS;
  const preserveAttachmentHistory = opts.preserveAttachmentHistory === true;
  const eligible = sessionMessages.filter((m) => {
    if (m.role !== 'user' && m.role !== 'assistant') return false;
    if (m.role === 'assistant' && !hasVisibleContent(m)) return false;
    return true;
  });
  const lastUserId = [...eligible].reverse().find((m) => m.role === 'user')?.id;
  const toRequest = (m: ChatMessage) => toRequestMessage(m, {
    includeAttachments: preserveAttachmentHistory || m.id === lastUserId,
  });
  if (eligible.length <= maxTurns) {
    return { messages: eligible.map(toRequest), truncated: false };
  }

  const withAttachments = preserveAttachmentHistory
    ? eligible.filter((m) => m.role === 'user' && m.attachments?.length)
    : [];
  const tail = eligible.slice(-maxTurns);
  const merged = new Map<string, ChatMessage>();
  for (const m of withAttachments) merged.set(m.id, m);
  for (const m of tail) merged.set(m.id, m);
  const ordered = eligible.filter((m) => merged.has(m.id));

  return {
    messages: ordered.map(toRequest),
    truncated: ordered.length < eligible.length,
    truncationReason: opts.reason ?? 'max-turns',
  };
}
