"use client";

import React from "react";
import { X } from "lucide-react";
import type { AttachmentPreview } from "@/lib/ai/imageUtils";
import type { ChatAttachment } from "@/lib/types/chat";

interface AttachmentThumbnailsProps {
  /** 前端预览列表（含 blob URL），用于输入区可删除的缩略图。 */
  previews?: AttachmentPreview[];
  /** 删除回调（仅输入模式可用）。 */
  onRemove?: (idx: number) => void;
  /** 已发送消息的附件（base64 data-url），用于聊天历史只读展示。 */
  readonlyAttachments?: ChatAttachment[];
  /** 缩略图尺寸（px）。 */
  size?: number;
  /** 是否可点击放大。 */
  clickable?: boolean;
}

/**
 * 附件缩略图组件 —— 统一渲染图片附件预览。
 *
 * 两种模式：
 * 1. **输入模式**：传入 `previews` + `onRemove`，显示删除按钮。
 * 2. **只读模式**：传入 `readonlyAttachments`，仅展示缩略图（用于聊天历史）。
 *
 * 可被 ChatInput、ChatMessage、以及其他 AI 对话板块组件复用。
 */
const AttachmentThumbnails: React.FC<AttachmentThumbnailsProps> = ({
  previews,
  onRemove,
  readonlyAttachments,
  size = 56,
  clickable = false,
}) => {
  const items: { src: string; alt: string }[] = [];

  if (previews) {
    previews.forEach((p) => items.push({ src: p.previewUrl, alt: p.file.name }));
  }
  if (readonlyAttachments) {
    readonlyAttachments.forEach((a) => items.push({ src: a.base64, alt: "" }));
  }

  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        padding: "6px 8px",
        borderRadius: "10px 10px 0 0",
        background: "var(--bg-muted)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--line)",
            cursor: clickable ? "pointer" : "default",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- blob/base64 URLs not supported by next/image */}
          <img
            src={item.src}
            alt={item.alt}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {onRemove && (
            <button
              onClick={() => onRemove(i)}
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttachmentThumbnails;
