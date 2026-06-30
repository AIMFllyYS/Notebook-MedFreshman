"use client";

import { useState } from "react";
import { ImagePlus, Sparkles, Check, X, ImageIcon } from "lucide-react";
import { useImageGen } from "@/lib/hooks/useImageGen";
import { MessageContent } from "@/components/chat/MessageContent";

/**
 * AI 生图请求批准卡片：内嵌在助教对话气泡中，展示生图提示词、尺寸、数量，
 * 等待用户「批准」后才打开独立弹窗调用 /api/image-gen 实际生成图片。
 *
 * 与 ArtifactCard（自动生成）不同：生图涉及实际付费（¥0.10/张），故必须用户主动批准。
 */
export default function ImageGenCard({
  imageGenId,
  prompt,
  title,
  size,
  count,
  modelId,
}: {
  imageGenId: string;
  prompt?: string;
  title?: string;
  size?: string;
  count?: number;
  modelId?: string;
}) {
  const session = useImageGen((s) => s.sessions[imageGenId]);
  const openViewer = useImageGen((s) => s.openViewer);
  const bringToFront = useImageGen((s) => s.bringToFront);
  const [cancelled, setCancelled] = useState(false);

  const effectivePrompt = session?.prompt ?? prompt ?? "";
  const effectiveTitle = session?.title ?? title ?? "AI 生图";
  const effectiveSize = session?.size ?? size ?? "1024x1024";
  const effectiveCount = session?.count ?? count ?? 1;

  const status = session?.status ?? "idle";
  const isApproved = status !== "idle";
  const hasImages = session?.images && session.images.length > 0;

  const onApprove = () => {
    setCancelled(false);
    openViewer({
      id: imageGenId,
      prompt: effectivePrompt,
      title: effectiveTitle,
      size: effectiveSize,
      count: effectiveCount,
      modelId,
    });
  };

  const onReopen = () => {
    bringToFront(imageGenId);
  };

  const onCancel = () => {
    setCancelled(true);
  };

  if (cancelled && !isApproved) {
    return (
      <div
        className="my-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px]"
        style={{
          borderColor: "var(--md-sys-color-outline-variant)",
          background: "var(--md-sys-color-surface-container)",
          color: "var(--md-sys-color-on-surface-variant)",
        }}
      >
        <X size={14} />
        <span>已取消生图请求：{effectiveTitle}</span>
      </div>
    );
  }

  return (
    <div
      className="my-2 overflow-hidden rounded-xl border"
      style={{
        borderColor: "var(--md-sys-color-tertiary)",
        background:
          "color-mix(in srgb, var(--md-sys-color-tertiary) 8%, var(--md-sys-color-surface))",
      }}
    >
      {/* 头部 */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <ImagePlus
          size={15}
          className="shrink-0"
          style={{ color: "var(--md-sys-color-tertiary)" }}
        />
        <span
          className="min-w-0 flex-1 truncate text-[12.5px] font-semibold"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          {isApproved ? `生图：${effectiveTitle}` : `AI 想为你生成图片：${effectiveTitle}`}
        </span>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            background:
              "color-mix(in srgb, var(--md-sys-color-tertiary) 15%, transparent)",
            color: "var(--md-sys-color-tertiary)",
          }}
        >
          {effectiveSize} · {effectiveCount} 张
        </span>
      </div>

      {/* 提示词预览（富文本渲染，与 ArtifactCard 一致） */}
      {effectivePrompt && (
        <div
          className="chat-prose px-3 py-2 text-[11.5px]"
          style={{
            color: "var(--md-sys-color-on-surface-variant)",
            background: "color-mix(in srgb, var(--md-sys-color-tertiary) 4%, transparent)",
            borderTop: "1px solid color-mix(in srgb, var(--md-sys-color-tertiary) 18%, transparent)",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            <Sparkles size={11} className="inline align-text-bottom" /> 生图提示词：
          </span>
          <MessageContent content={effectivePrompt} enableVisualizations={false} preserveLineBreaks />
        </div>
      )}

      {/* 操作区 */}
      <div
        className="flex items-center gap-2 border-t px-3 py-2"
        style={{
          borderColor: "color-mix(in srgb, var(--md-sys-color-tertiary) 18%, transparent)",
        }}
      >
        {!isApproved ? (
          <>
            <button
              type="button"
              onClick={onApprove}
              className="press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold"
              style={{
                background: "var(--md-sys-color-tertiary)",
                color: "var(--md-sys-color-on-tertiary)",
              }}
            >
              <Check size={13} /> 批准生成
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="press inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium"
              style={{
                borderColor: "var(--md-sys-color-outline-variant)",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <X size={13} /> 取消
            </button>
            <span
              className="ml-auto text-[10.5px]"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              批准后会打开独立弹窗生成图片
            </span>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onReopen}
              className="press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold"
              style={{
                background: "var(--md-sys-color-tertiary)",
                color: "var(--md-sys-color-on-tertiary)",
              }}
            >
              <ImageIcon size={13} />{" "}
              {status === "loading" && "生成中…"}
              {status === "done" && (hasImages ? "查看图片" : "已生成")}
              {status === "error" && "查看错误"}
            </button>
            <span
              className="ml-auto text-[10.5px]"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              {status === "loading" && "正在生成…"}
              {status === "done" && hasImages && `已生成 ${session?.images.length ?? 0} 张`}
              {status === "error" && "生成失败，可在弹窗内重试"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
