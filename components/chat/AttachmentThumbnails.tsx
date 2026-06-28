"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AttachmentPreview } from "@/lib/ai/imageUtils";
import type { ChatAttachment, StoredChatAttachment } from "@/lib/types/chat";
import { isAttachmentRef } from "@/lib/types/chat";
import { loadBlobDataUrl } from "@/lib/storage/chatStorage";

interface AttachmentThumbnailsProps {
  /** 前端预览列表（含 blob URL），用于输入区可删除的缩略图。 */
  previews?: AttachmentPreview[];
  /** 删除回调（仅输入模式可用）。 */
  onRemove?: (idx: number) => void;
  /** 已发送消息的附件，用于聊天历史只读展示。 */
  readonlyAttachments?: StoredChatAttachment[];
  /** 缩略图尺寸（px）。 */
  size?: number;
  /** 是否可点击放大。 */
  clickable?: boolean;
}

function ReadonlyAttachmentImg({
  attachment,
  size,
  clickable,
}: {
  attachment: StoredChatAttachment;
  size: number;
  clickable: boolean;
}) {
  const [src, setSrc] = useState<string | null>(
    isAttachmentRef(attachment) ? null : attachment.base64,
  );

  useEffect(() => {
    if (!isAttachmentRef(attachment)) return;
    let cancelled = false;
    void loadBlobDataUrl(attachment.id).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [attachment]);

  if (!src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: "var(--bg-muted)",
          border: "1px solid var(--line)",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob/base64 URLs not supported by next/image
    <img
      src={src}
      alt=""
      style={{ width: "100%", height: "100%", objectFit: "cover", cursor: clickable ? "pointer" : "default" }}
    />
  );
}

/**
 * 附件缩略图组件 —— 统一渲染图片附件预览。
 */
const AttachmentThumbnails: React.FC<AttachmentThumbnailsProps> = ({
  previews,
  onRemove,
  readonlyAttachments,
  size = 56,
  clickable = false,
}) => {
  const items: { src: string; alt: string; key: string }[] = [];

  if (previews) {
    previews.forEach((p, i) =>
      items.push({ src: p.previewUrl, alt: p.file.name, key: `preview-${i}` }),
    );
  }

  const readonly = readonlyAttachments ?? [];
  const hasReadonly = readonly.length > 0;

  if (items.length === 0 && !hasReadonly) return null;

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
          key={item.key}
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
      {readonly.map((a, i) => (
        <div
          key={isAttachmentRef(a) ? a.id : `inline-${i}`}
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--line)",
          }}
        >
          <ReadonlyAttachmentImg attachment={a} size={size} clickable={clickable} />
        </div>
      ))}
    </div>
  );
};

export default AttachmentThumbnails;
