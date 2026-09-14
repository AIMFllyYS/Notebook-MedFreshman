import { utf8ByteLength } from "@/lib/sync/payload";
import type { RequestMessage } from "@/lib/chat/buildRequestMessages";

/** 客户端序列化硬顶。低于 nginx 默认 1m，留约 200KB 余量。 */
export const MAX_CHAT_REQUEST_BYTES = 800 * 1024;
/** 本轮进 POST 的图片 data URL 合计上限。 */
export const MAX_REQUEST_IMAGE_CHARS = 400 * 1024;
export const MAX_REQUEST_IMAGES = 1;

export const REQUEST_TOO_LARGE_MESSAGE =
  "这次对话上下文过大，已保留本机。请少带历史图或开新会话。";

export function requestPayloadBytes(messages: unknown, body: unknown): number {
  try {
    const extra = body && typeof body === "object" ? body as Record<string, unknown> : {};
    return utf8ByteLength(JSON.stringify({ ...extra, messages }));
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function dropFileParts(message: RequestMessage): RequestMessage {
  const parts = message.parts.filter((part) => part.type !== "file");
  return parts.length === message.parts.length ? message : { ...message, parts };
}

function dropOlderTurns(messages: RequestMessage[]): RequestMessage[] {
  if (messages.length <= 2) return messages;
  let next = messages.slice(1);
  if (next[0]?.role === "assistant") next = next.slice(1);
  return next.length > 0 ? next : messages.slice(-1);
}

export function fitChatRequest(
  messages: RequestMessage[],
  body: Record<string, unknown>,
  limit = MAX_CHAT_REQUEST_BYTES,
): { messages: RequestMessage[]; body: Record<string, unknown>; truncated: boolean; info?: string } {
  let next = messages;
  const nextBody = body;
  const measure = () => requestPayloadBytes(next, nextBody);
  if (measure() <= limit) return { messages: next, body: nextBody, truncated: false };

  const lastUserId = [...next].reverse().find((message) => message.role === "user")?.id;
  next = next.map((message) => (message.id === lastUserId ? message : dropFileParts(message)));
  if (measure() <= limit) {
    return { messages: next, body: nextBody, truncated: true, info: "已去掉历史图片以控制请求体积。" };
  }

  next = next.map(dropFileParts);
  if (measure() <= limit) {
    return { messages: next, body: nextBody, truncated: true, info: "已去掉本轮图片以控制请求体积。" };
  }

  while (next.length > 1 && measure() > limit) {
    const shrunk = dropOlderTurns(next);
    if (shrunk.length >= next.length) break;
    next = shrunk;
  }
  if (measure() > limit) {
    throw new Error(REQUEST_TOO_LARGE_MESSAGE);
  }
  return { messages: next, body: nextBody, truncated: true, info: "对话上下文过长，已截断较早轮次。" };
}

export function isPayloadTooLargeError(err: unknown): boolean {
  if (err == null) return false;
  const message = err instanceof Error ? err.message : String(err);
  if (/\b413\b/.test(message)) return true;
  return /request entity too large|entity too large|nginx/i.test(message);
}
