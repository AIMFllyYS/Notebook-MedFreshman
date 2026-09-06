import type { ChatAttachment, ChatMessage, ChatMessagePart } from '@/lib/types/chat';
import { hasVisibleContent } from '@/lib/chat/messageParts';

export const DEFAULT_MAX_TURNS = Number.MAX_SAFE_INTEGER;
export const SOFT_LIMIT_MAX_TURNS = 16;

/** 发给 /api/chat 的消息：UIMessage 形状，图片附件已转成 file part（data URL）。 */
export type RequestMessage = Pick<ChatMessage, 'id' | 'role' | 'parts'>;

export interface BuildRequestMessagesResult {
  messages: RequestMessage[];
  truncated: boolean;
  truncationReason?: 'max-turns' | 'soft-limit';
}

export interface BuildRequestMessagesOptions {
  maxTurns?: number;
  reason?: BuildRequestMessagesResult['truncationReason'];
  preserveAttachmentHistory?: boolean;
}

/**
 * 历史消息只保留 text / file parts：思考、工具调用、data 等不回灌模型，
 * 与迁移前「只发 user/assistant 文本」的 token 行为一致，也利于 prefix 缓存。
 */
function toRequestMessage(m: ChatMessage): RequestMessage {
  const parts: ChatMessagePart[] = m.parts.filter(
    (p) => (p.type === 'text' && p.text.trim().length > 0) || p.type === 'file',
  );
  if (m.role === 'user') {
    const imageParts: ChatMessagePart[] = (m.attachments ?? [])
      .filter((a): a is ChatAttachment => 'base64' in a && !!a.base64)
      .map((a) => ({ type: 'file', mediaType: a.mimeType, url: a.base64 }));
    parts.push(...imageParts);
  }
  return { id: m.id, role: m.role, parts };
}

/**
 * 从会话尾部取最近 N 条 user/assistant 消息用于 API 请求。
 * 含附件的 user 消息始终保留（不截断多模态上下文）。
 */
export function buildRequestMessages(
  sessionMessages: ChatMessage[],
  maxTurnsOrOptions: number | BuildRequestMessagesOptions = DEFAULT_MAX_TURNS,
): BuildRequestMessagesResult {
  const opts: BuildRequestMessagesOptions =
    typeof maxTurnsOrOptions === 'number' ? { maxTurns: maxTurnsOrOptions } : maxTurnsOrOptions;
  const maxTurns = opts.maxTurns ?? DEFAULT_MAX_TURNS;
  const preserveAttachmentHistory = opts.preserveAttachmentHistory !== false;
  const eligible = sessionMessages.filter((m) => {
    if (m.role !== 'user' && m.role !== 'assistant') return false;
    if (m.role === 'assistant' && !hasVisibleContent(m)) return false;
    return true;
  });
  if (eligible.length <= maxTurns) {
    return { messages: eligible.map(toRequestMessage), truncated: false };
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
    messages: ordered.map(toRequestMessage),
    truncated: ordered.length < eligible.length,
    truncationReason: opts.reason ?? 'max-turns',
  };
}
