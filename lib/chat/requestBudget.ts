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

/**
 * 项目文件正文减量：按"从尾部砍"的顺序丢掉一部分切片。
 * 留着目录（fileId / 标题 / 摘要），模型仍然知道有哪些内容、可以请用户补带。
 */
function shrinkProjectSlices(body: Record<string, unknown>, keep: number): Record<string, unknown> {
  const slices = body.projectSlices;
  if (!Array.isArray(slices)) return body;
  return { ...body, projectSlices: slices.slice(0, Math.max(0, keep)) };
}

/**
 * 把请求压进体积上限。顺序是有讲究的：先丢最不废信息的东西，最后才丢用户的提问内容。
 *
 * 历史图 → 项目正文（目录还在）→ 本轮图 → 较早轮次 → 还是超才报错。
 * 以前少了「项目正文」这一档：带一个大项目时只会一路丢到图片和轮次，都不够就直接抛
 * 「上下文过大」，用户既不知道为什么，也丢掉了本可以只减一半的项目正文。
 */
export function fitChatRequest(
  messages: RequestMessage[],
  body: Record<string, unknown>,
  limit = MAX_CHAT_REQUEST_BYTES,
): { messages: RequestMessage[]; body: Record<string, unknown>; truncated: boolean; info?: string } {
  let next = messages;
  let nextBody = body;
  let staged: string | undefined;
  const withInfo = (extra: string) => (staged ? `${staged} ${extra}` : extra);
  const measure = () => requestPayloadBytes(next, nextBody);
  if (measure() <= limit) return { messages: next, body: nextBody, truncated: false };

  const lastUserId = [...next].reverse().find((message) => message.role === "user")?.id;
  next = next.map((message) => (message.id === lastUserId ? message : dropFileParts(message)));
  if (measure() <= limit) {
    return { messages: next, body: nextBody, truncated: true, info: "已去掉历史图片以控制请求体积。" };
  }

  // 项目切片正文：二分减量，砍到能塞进去为止（最少 0 片）。切片是从文件顺序排的，
  // 尾巴上是后导入的文件，先丢它们对"正在聊的那份材料"伤害最小。
  const sliceCount = Array.isArray(nextBody.projectSlices) ? nextBody.projectSlices.length : 0;
  if (sliceCount > 0) {
    let keep = sliceCount;
    while (keep > 0 && measure() > limit) {
      keep = Math.floor(keep / 2);
      nextBody = shrinkProjectSlices(nextBody, keep);
    }
    if (keep < sliceCount) {
      staged = withInfo(`项目文件正文已按体积裁剪（带入 ${keep}/${sliceCount} 片）。`);
    }
  }
  // 砍完项目正文就装得下了：**必须在这里收手**，否则会顺手把本轮的图也丢掉。
  if (measure() <= limit) {
    return { messages: next, body: nextBody, truncated: true, info: staged ?? "已裁剪项目文件正文以控制请求体积。" };
  }

  next = next.map(dropFileParts);
  if (measure() <= limit) {
    return { messages: next, body: nextBody, truncated: true, info: withInfo("已去掉本轮图片以控制请求体积。") };
  }

  while (next.length > 1 && measure() > limit) {
    const shrunk = dropOlderTurns(next);
    if (shrunk.length >= next.length) break;
    next = shrunk;
  }
  if (measure() > limit) {
    throw new Error(REQUEST_TOO_LARGE_MESSAGE);
  }
  return { messages: next, body: nextBody, truncated: true, info: withInfo("对话上下文过长，已截断较早轮次。") };
}

export function isPayloadTooLargeError(err: unknown): boolean {
  if (err == null) return false;
  const message = err instanceof Error ? err.message : String(err);
  if (/\b413\b/.test(message)) return true;
  return /request entity too large|entity too large|nginx/i.test(message);
}
