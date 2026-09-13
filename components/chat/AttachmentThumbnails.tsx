"use client";

import React, { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import type { AttachmentPreview } from "@/lib/ai/imageUtils";
import type { StoredChatAttachment } from "@/lib/types/chat";
import { isAttachmentRef } from "@/lib/types/chat";
import { loadBlobDataUrl } from "@/lib/storage/chatStorage";

interface AttachmentThumbnailsProps {
  previews?: AttachmentPreview[];
  onRemove?: (idx: number) => void;
  readonlyAttachments?: StoredChatAttachment[];
  size?: number;
  clickable?: boolean;
  /** 输入区使用紧凑横向搁板；历史消息使用可换行展示。 */
  embedded?: boolean;
}

function formatSize(size?: number): string {
  if (size == null || !Number.isFinite(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function typeLabel(name: string | undefined, mimeType: string): string {
  const extension = name?.split(".").pop()?.toUpperCase();
  if (extension === "MARKDOWN") return "MD";
  if (extension === "HTM") return "HTML";
  if (extension === "YML") return "YAML";
  if (extension) return extension;
  if (mimeType === "text/markdown") return "MD";
  if (mimeType.includes("wordprocessingml")) return "DOCX";
  return "TXT";
}

function ReadonlyImage({ attachment }: { attachment: StoredChatAttachment }) {
  const [src, setSrc] = useState<string | null>(() => {
    if (attachment.type !== "image" || isAttachmentRef(attachment)) return null;
    return attachment.base64;
  });

  useEffect(() => {
    if (attachment.type !== "image" || !isAttachmentRef(attachment)) return;
    let cancelled = false;
    void loadBlobDataUrl(attachment.id).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [attachment]);

  if (!src) return <span className="chat-attachment-image-placeholder" aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- IndexedDB blob/data URLs are not supported by next/image.
    <img src={src} alt={attachment.name ?? "已上传图片"} className="chat-attachment-image" />
  );
}

function DocumentCard({ name, mimeType, size, characterCount }: {
  name: string;
  mimeType: string;
  size?: number;
  characterCount?: number;
}) {
  const detail = characterCount != null
    ? `${characterCount.toLocaleString("zh-CN")} 字`
    : formatSize(size);
  return (
    <span className="chat-attachment-document">
      <span className="chat-attachment-document-icon" aria-hidden="true"><FileText size={17} /></span>
      <span className="chat-attachment-document-copy">
        <span className="chat-attachment-name" title={name}>{name}</span>
        <span className="chat-attachment-meta">
          <span>{typeLabel(name, mimeType)}</span>
          {detail ? <><span aria-hidden="true">·</span><span>{detail}</span></> : null}
        </span>
      </span>
    </span>
  );
}

export default function AttachmentThumbnails({
  previews,
  onRemove,
  readonlyAttachments,
  size = 56,
  clickable = false,
  embedded = false,
}: AttachmentThumbnailsProps) {
  const previewItems = previews ?? [];
  const readonlyItems = readonlyAttachments ?? [];
  if (previewItems.length === 0 && readonlyItems.length === 0) return null;

  return (
    <div
      className={`chat-attachment-shelf ${embedded ? "chat-attachment-shelf-embedded" : ""}`}
      style={{ ["--attachment-size" as string]: `${size}px` } as React.CSSProperties}
      aria-label="附件"
    >
      {previewItems.map((attachment, index) => {
        const name = attachment.type === "document" ? attachment.name : attachment.file.name;
        return (
          <span className="chat-attachment-item" key={`${name}:${index}`}>
            {attachment.type === "document" ? (
              <DocumentCard {...attachment} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview.
              <img src={attachment.previewUrl} alt={name} className="chat-attachment-image" />
            )}
            {onRemove ? (
              <button type="button" className="chat-attachment-remove" onClick={() => onRemove(index)} aria-label={`移除附件 ${name}`}>
                <X size={11} />
              </button>
            ) : null}
          </span>
        );
      })}
      {readonlyItems.map((attachment, index) => {
        const key = isAttachmentRef(attachment) ? attachment.id : `${attachment.type}:${attachment.name ?? index}`;
        return (
          <span className={`chat-attachment-item ${clickable ? "chat-attachment-clickable" : ""}`} key={key}>
            {attachment.type === "document" ? (
              <DocumentCard
                name={attachment.name ?? "未命名文档"}
                mimeType={attachment.mimeType}
                size={attachment.size}
                characterCount={attachment.characterCount}
              />
            ) : <ReadonlyImage attachment={attachment} />}
          </span>
        );
      })}
    </div>
  );
}
