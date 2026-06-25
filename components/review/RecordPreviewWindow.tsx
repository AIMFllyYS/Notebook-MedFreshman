"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader, X, Trash2, RefreshCw, Check, BookmarkCheck, AlertTriangle } from "lucide-react";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useReviewCards } from "@/lib/hooks/useReviewCards";
import { useRecordPreviews, RECORD_PREVIEW_SIZE, type RecordPreview } from "@/lib/hooks/useRecordPreviews";
import { retryRecord } from "@/lib/review/startRecord";
import { getSubject } from "@/lib/content-data";
import { isSubjectId } from "@/lib/types/content";
import FlipCard from "@/components/review/FlipCard";

// 记录预览浮窗：绑定一张卡，复用浮窗外壳（useDraggable 拖拽 + 同款 chrome）。
//   parsing → 「AI 正在解析中…」骨架 + 原文预览
//   error   → 错误 + 重做 / 删除
//   ready   → FlipCard 预览 + 已存入复习板 + 保留 / 重做 / 丢弃

export default function RecordPreviewWindow({ preview }: { preview: RecordPreview }) {
  const card = useReviewCards((s) => s.byId[preview.cardId]);
  const remove = useReviewCards((s) => s.remove);
  const { close, move, bringToFront } = useRecordPreviews();
  const [flipped, setFlipped] = useState(false);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => move(preview.id, dx, dy));

  // 卡被外部删除（如复习板）→ 自动关闭本窗
  useEffect(() => {
    if (!card) close(preview.id);
  }, [card, close, preview.id]);

  if (!card) return null;

  const subjectName =
    isSubjectId(card.subjectId) ? getSubject(card.subjectId)?.name ?? card.subjectId : card.subjectId;

  const headerBtn =
    "flex items-center justify-center rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]";

  function handleDiscard() {
    remove(card.id);
    close(preview.id);
  }

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(preview.id)}
      style={{
        position: "fixed",
        left: preview.pos.x,
        top: preview.pos.y,
        width: RECORD_PREVIEW_SIZE.width,
        height: RECORD_PREVIEW_SIZE.height,
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRadius: 14,
        boxShadow: "0 12px 32px rgba(0,0,0,0.18), 0 0 0 1px var(--md-sys-color-outline-variant)",
        zIndex: preview.z,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "scale-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      {/* 标题栏 / 拖拽手柄 */}
      <div
        onPointerDown={onPointerDown}
        style={{
          padding: "8px 12px",
          background: "var(--md-sys-color-surface-container-high)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "grab",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--md-sys-color-primary)", minWidth: 0 }}>
          <BookmarkCheck size={15} className="shrink-0" />
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>记录到复习板</span>
          <span style={{ fontSize: 11.5, color: "var(--ink-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            · {subjectName}
          </span>
        </div>
        <button onClick={() => close(preview.id)} title="关闭" className={headerBtn} data-no-drag>
          <X size={15} />
        </button>
      </div>

      {/* 正文区 */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: 12, gap: 10 }}>
        {card.status === "parsing" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-primary)", fontSize: 13 }}>
              <Loader size={15} className="animate-spin" />
              <span>AI 正在解析中…（已先保存原文，不会丢失）</span>
            </div>
            <div
              className="scroll-y"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "10px 12px",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--ink-soft)",
                background: "var(--bg-muted)",
                borderRadius: 10,
                border: "1px solid var(--line)",
                whiteSpace: "pre-wrap",
              }}
            >
              {card.originalText}
            </div>
          </div>
        )}

        {card.status === "error" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-error)", fontSize: 13 }}>
              <AlertTriangle size={15} /> {card.error || "成卡失败"}
            </div>
            <div
              className="scroll-y"
              style={{
                flex: 1, minHeight: 0, overflowY: "auto", padding: "10px 12px",
                fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-soft)",
                background: "var(--bg-muted)", borderRadius: 10, border: "1px solid var(--line)",
                whiteSpace: "pre-wrap",
              }}
            >
              {card.originalText}
            </div>
          </div>
        )}

        {card.status === "ready" && (
          <>
            <div style={{ flex: 1, minHeight: 0 }}>
              <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--accent)" }}>
              <Check size={13} /> 已存入「{subjectName}」复习板
            </div>
          </>
        )}
      </div>

      {/* 底部操作 */}
      <div
        data-no-drag
        style={{
          display: "flex",
          gap: 8,
          padding: "8px 12px",
          borderTop: "1px solid var(--md-sys-color-outline-variant)",
          background: "var(--md-sys-color-surface-container-low)",
        }}
      >
        {card.status === "ready" ? (
          <>
            <ActionBtn onClick={() => close(preview.id)} icon={Check} label="保留" primary />
            <ActionBtn onClick={() => { setFlipped(false); retryRecord(card.id); }} icon={RefreshCw} label="重做" />
            <ActionBtn onClick={handleDiscard} icon={Trash2} label="丢弃" danger />
          </>
        ) : card.status === "error" ? (
          <>
            <ActionBtn onClick={() => retryRecord(card.id)} icon={RefreshCw} label="重试" primary />
            <ActionBtn onClick={handleDiscard} icon={Trash2} label="删除" danger />
          </>
        ) : (
          <ActionBtn onClick={handleDiscard} icon={X} label="取消" />
        )}
      </div>
    </div>,
    document.body,
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  primary,
  danger,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  primary?: boolean;
  danger?: boolean;
}) {
  const color = danger
    ? "var(--md-sys-color-error)"
    : primary
      ? "var(--md-sys-color-on-primary)"
      : "var(--ink-soft)";
  const bg = primary ? "var(--md-sys-color-primary)" : "transparent";
  const border = primary ? "none" : "1px solid var(--line)";
  return (
    <button
      onClick={onClick}
      className="press"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "7px 0",
        borderRadius: 9,
        border,
        background: bg,
        color,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
}
