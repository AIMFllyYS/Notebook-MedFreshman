import type { SessionMeta } from "@/lib/storage/chatStorage";
import type { ChatMessage } from "@/lib/types/chat";
import {
  payloadByteSize,
  payloadLooksUnsafe,
  sanitizeChatMessages,
  stripForbiddenFields,
} from "@/lib/sync/payload";
import { MAX_CHAT_SESSION_BYTES } from "@/lib/sync/types";
import type { SharedArtifact, SharedConversationSnapshot } from "./types.ts";

/**
 * 分享载荷上限：与云端会话单条同档（5 MB）。
 * 分享比同步更容易顶到上限（对话 + 演示一起走），所以 API 侧超限就 400，
 * 客户端据此提示「先删掉几个演示再分享」，而不是把一条超大 jsonb 塞进库。
 */
export const MAX_SHARE_PAYLOAD_BYTES = MAX_CHAT_SESSION_BYTES;

export interface SharedSnapshotInput {
  /** meta.id 即 sourceClientId、meta.title 即快照标题——不另设重复入参，避免两处打架。 */
  meta: SessionMeta;
  messages: ChatMessage[];
  artifacts: readonly SharedArtifact[];
}

/**
 * 从一条会话构造分享快照。
 *
 * 媒体在这里被剥掉（sanitizeChatMessages：data URL 抹除、附件只留 id/name/size），
 * 这是设计而非疏漏——图片不随分享走，公开页在图片位置显示占位。
 * artifacts 里的 html 原样带走（客户端本来就期望它可渲染），若其中内嵌了 data URL，
 * 由 API 的 payloadLooksUnsafe() 复核后整单拒收，而不是悄悄改写演示内容。
 */
export function buildSharedSnapshot(input: SharedSnapshotInput): SharedConversationSnapshot {
  // meta 也过一遍剥媒体：标题 / preview 里混进 data URL 不该让整条分享被 400 掉。
  const meta = stripForbiddenFields({ ...input.meta }) as SessionMeta;
  return {
    v: 1,
    // 顶层 title / sourceClientId 一律取自 meta，公开页第一眼不必先解包 payload。
    title: meta.title,
    // 快照生成时刻；会话本身的创建时间在 meta.createdAt 里，两者不要混用。
    createdAt: Date.now(),
    sourceClientId: meta.id,
    meta,
    messages: sanitizeChatMessages(input.messages),
    artifacts: input.artifacts.map((artifact): SharedArtifact => ({
      id: artifact.id,
      title: artifact.title,
      html: artifact.html,
      status: artifact.status,
    })),
  };
}

export type SharePayloadCheck =
  | { ok: true; bytes: number }
  | { ok: false; reason: "unsafe" | "too-large"; bytes: number; limit: number };

/**
 * 落库前的复核：先查危险内容再查体积。
 * 「危险」= data URL / base64 / apiKey（见 lib/sync/payload.ts）——宁可拒收，
 * 也不要把 base64 写进库里，否则公开页会变成任意大文件的搬运工。
 */
export function checkSharePayload(payload: unknown): SharePayloadCheck {
  const bytes = payloadByteSize(payload);
  if (payloadLooksUnsafe(payload)) {
    return { ok: false, reason: "unsafe", bytes, limit: MAX_SHARE_PAYLOAD_BYTES };
  }
  if (bytes > MAX_SHARE_PAYLOAD_BYTES) {
    return { ok: false, reason: "too-large", bytes, limit: MAX_SHARE_PAYLOAD_BYTES };
  }
  return { ok: true, bytes };
}

/** 400 的 error 文案：说清是哪一类问题，但不要回显载荷内容。 */
export function formatSharePayloadError(check: Extract<SharePayloadCheck, { ok: false }>): string {
  if (check.reason === "unsafe") {
    return "分享内容里还有未剥离的媒体数据（base64），已拒绝上传。";
  }
  const kb = Math.max(1, Math.round(check.bytes / 1024));
  const mb = Math.round((check.limit / (1024 * 1024)) * 10) / 10;
  return `这条对话约 ${kb} KB，超过分享上限 ${mb} MB，未生成分享链接。`;
}
