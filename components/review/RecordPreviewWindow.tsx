"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader, X, Trash2, RefreshCw, Check, BookmarkCheck, AlertTriangle, Wand2 } from "lucide-react";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import { useReviewCards } from "@/lib/hooks/useReviewCards";
import { useRecordPreviews, type RecordPreview } from "@/lib/hooks/useRecordPreviews";
import { retryRecord, reviseRecord } from "@/lib/review/startRecord";
import { getSubject } from "@/lib/content-data";
import { isSubjectId } from "@/lib/types/content";
import FlipCard from "@/components/review/FlipCard";
import CollapsibleSection from "@/components/review/CollapsibleSection";

// 记录预览浮窗：绑定一张卡，复用浮窗外壳（useDraggable 拖拽 + 同款 chrome）。
//   parsing → 「AI 正在解析中…」骨架 + 原文预览
//   error   → 错误 + 重做 / 删除
//   ready   → FlipCard 预览 + 已存入复习板 + 保留 / 重做 / 丢弃

export default function RecordPreviewWindow({ preview }: { preview: RecordPreview }) {
  const card = useReviewCards((s) => s.byId[preview.cardId]);
  const remove = useReviewCards((s) => s.remove);
  const { close, move, resize, bringToFront } = useRecordPreviews();
  const [flipped, setFlipped] = useState(false);

  // 修订态提升到本组件（修订中 card.status 会切到 parsing 让 ready 分支卸载，
  // 错误信息留在这里才能在回到 ready 后继续展示）。
  const [reviseText, setReviseText] = useState("");
  const [revising, setRevising] = useState(false);
  const [reviseError, setReviseError] = useState<string | null>(null);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => move(preview.id, dx, dy));
  const onResizeStart = useResizable(elRef, (w, h) => resize(preview.id, w, h));

  // 卡被外部删除（如复习板）→ 自动关闭本窗
  useEffect(() => {
    if (!card) close(preview.id);
  }, [card, close, preview.id]);

  if (!card) return null;

  const subjectName =
    isSubjectId(card.subjectId) ? getSubject(card.subjectId)?.name ?? card.subjectId : card.subjectId;

  const headerBtn =
    "flex items-center justify-center rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]";

  async function handleRevise() {
    const text = reviseText.trim();
    if (!text || revising) return;
    setRevising(true);
    setReviseError(null);
    const r = await reviseRecord(preview.cardId, text);
    setRevising(false);
    if (r.ok) {
      setReviseText("");
      setFlipped(false);
    } else {
      setReviseError(r.error || "修订失败");
    }
  }

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
        width: preview.size.w,
        height: preview.size.h,
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-primary)", fontSize: 13 }}>
              <Loader size={15} className="animate-spin" />
              <span>AI 正在解析中…（已先保存原文，不会丢失）</span>
            </div>
            <OriginalTextSection text={card.originalText} />
          </div>
        )}

        {card.status === "error" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-error)", fontSize: 13 }}>
              <AlertTriangle size={15} /> {card.error || "成卡失败"}
            </div>
            <OriginalTextSection text={card.originalText} />
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
            <ReviseInput
              value={reviseText}
              onChange={(v) => {
                setReviseText(v);
                if (reviseError) setReviseError(null);
              }}
              onSubmit={handleRevise}
              busy={revising}
              error={reviseError}
            />
            <OriginalTextSection text={card.originalText} defaultOpen={false} />
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

      {/* 右下角缩放手柄 */}
      <div
        data-no-drag
        onPointerDown={onResizeStart}
        title="拖拽缩放窗口"
        style={{
          position: "absolute",
          right: 1,
          bottom: 1,
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          padding: 2,
          color: "var(--md-sys-color-outline)",
          cursor: "nwse-resize",
          touchAction: "none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M11 4 L4 11" />
          <path d="M11 8 L8 11" />
        </svg>
      </div>
    </div>,
    document.body,
  );
}

/** 原文小节：可折叠（长则默认收起），三态共用。 */
function OriginalTextSection({ text, defaultOpen }: { text: string; defaultOpen?: boolean }) {
  return (
    <CollapsibleSection label="原文" meta={`${text.length} 字`} defaultOpen={defaultOpen ?? text.length < 160}>
      <div
        className="scroll-y"
        style={{
          maxHeight: 220,
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
        {text}
      </div>
    </CollapsibleSection>
  );
}

/** ready 态的修订输入：输入一句话让 AI 改写当前卡片 JSON。 */
function ReviseInput({
  value,
  onChange,
  onSubmit,
  busy,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
}) {
  const disabled = busy || !value.trim();
  return (
    <div data-no-drag style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="告诉 AI 怎么改这张卡…（如：答案更详细 / 填空挖错了，应挖 XX）"
          disabled={busy}
          style={{
            flex: 1,
            minWidth: 0,
            height: 34,
            padding: "0 10px",
            borderRadius: 9,
            border: "1px solid var(--line)",
            background: "var(--bg-panel)",
            color: "var(--ink)",
            fontSize: 12.5,
          }}
        />
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="press"
          title="让 AI 修订这张卡"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "0 12px",
            height: 34,
            borderRadius: 9,
            border: "none",
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.55 : 1,
            whiteSpace: "nowrap",
          }}
        >
          <Wand2 size={14} /> 修订
        </button>
      </div>
      {error && <div style={{ fontSize: 11.5, color: "var(--md-sys-color-error)" }}>{error}</div>}
    </div>
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
