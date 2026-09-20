import type { SessionMeta } from "@/lib/storage/chatStorage";
import type { ChatMessage } from "@/lib/types/chat";

/** 分享快照带走的 HTML 演示：只留这四列，reasoning 等生成过程不公开。 */
export interface SharedArtifact {
  id: string;
  title: string;
  html: string;
  status: string;
}

/**
 * 公开分享页的唯一数据来源（字段名是冻结契约，不要改）。
 *
 * 与 lib/sync/types.ts 的 ChatSessionSyncPayload 的区别只有两处：
 *   1. 多带 sourceClientId 与 artifacts——对话引用过的演示不带走的话，分享页上那张卡是死的；
 *   2. title / createdAt 提到顶层，公开页第一眼不必先解包 payload。
 */
export interface SharedConversationSnapshot {
  v: 1;
  title: string;
  createdAt: number;
  sourceClientId: string;
  /** 已经过 sanitizeChatMessages 的会话元信息（媒体字段已被剥掉）。 */
  meta: SessionMeta;
  messages: ChatMessage[];
  /** 对话引用过的 HTML 演示：不带走的话分享页上那张卡是死的。 */
  artifacts: SharedArtifact[];
}

/**
 * 「我的资产 → 分享的链接」列表里的一行。
 * 不带 payload：列表只要够渲染标题与开关，把整份对话拖回来纯属浪费。
 */
export interface SharedLinkSummary {
  id: string;
  title: string;
  /** ISO 字符串（Postgres timestamptz）。 */
  createdAt: string;
  /** 已撤回 = 链接打不开；这是用户唯一的开关语义。 */
  revoked: boolean;
}

/**
 * 运行时形状校验：RPC 回来的是 jsonb，类型在那一跳就断了，进渲染前必须自己验一遍。
 * 只验「能不能安全渲染」的骨架，不深挖每条 message 的结构（那由消息组件自己容错）。
 */
export function isSharedConversationSnapshot(value: unknown): value is SharedConversationSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const snapshot = value as Partial<SharedConversationSnapshot>;
  return (
    snapshot.v === 1 &&
    typeof snapshot.title === "string" &&
    typeof snapshot.createdAt === "number" &&
    Number.isFinite(snapshot.createdAt) &&
    typeof snapshot.sourceClientId === "string" &&
    snapshot.sourceClientId.length > 0 &&
    Boolean(snapshot.meta) &&
    typeof snapshot.meta === "object" &&
    Array.isArray(snapshot.messages) &&
    Array.isArray(snapshot.artifacts)
  );
}
