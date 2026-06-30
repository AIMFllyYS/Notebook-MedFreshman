import type { ChatAttachment, ChatMessage } from '@/lib/types/chat';

export const DEFAULT_MAX_TURNS = Number.MAX_SAFE_INTEGER;
export const SOFT_LIMIT_MAX_TURNS = 16;

export interface RequestMessage {
  role: 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

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

function toRequestMessage(m: ChatMessage): RequestMessage {
  if (m.role === 'user' && m.attachments?.length) {
    const imageParts = m.attachments
      .filter((a): a is ChatAttachment => 'base64' in a && !!a.base64)
      .map((a) => ({
        type: 'image_url',
        image_url: { url: a.base64 },
      }));
    const parts: Array<Record<string, unknown>> = [
      { type: 'text', text: m.content || '' },
      ...imageParts,
    ];
    return { role: 'user', content: parts };
  }
  return { role: m.role as 'user' | 'assistant', content: m.content || '' };
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
    if (m.role === 'assistant' && !m.content?.trim() && !m.toolCalls?.length && !m.reasoningContent?.trim()) {
      return false;
    }
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
