"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader, X, Trash2, RefreshCw, Check, BookmarkCheck, AlertTriangle, BrainCircuit, ChevronDown, ChevronUp, Loader2, Wand2 } from "lucide-react";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import { useReviewCards } from "@/lib/hooks/useReviewCards";
import { useRecordPreviews, type RecordPreview } from "@/lib/hooks/useRecordPreviews";
import { processRecord, retryRecord, reviseRecord, type ProcessCallbacks } from "@/lib/review/startRecord";
import { getSubject } from "@/lib/content-data";
import { isSubjectId } from "@/lib/types/content";
import { useProcessingDisclosure } from "@/lib/hooks/useProcessingDisclosure";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import FlipCard from "@/components/review/FlipCard";
import CollapsibleSection from "@/components/review/CollapsibleSection";
import QuizMarkdown from "@/components/quiz/QuizMarkdown";
import type { RecordMode } from "@/lib/review/types";

// 记录预览浮窗：绑定一张卡，复用浮窗外壳（useDraggable 拖拽 + 同款 chrome）。
//   saved      → 全量富文本原文 + 4 个模式按钮
//   processing → 思考折叠（流式） + 内容流式渲染
//   ready      → FlipCard + 优化输入 + 4 按钮 + 原文折叠
//   error      → 错误 + 原文 + 重试/删除

const MODE_LABELS: { mode: RecordMode; label: string; desc: string }[] = [
  { mode: "excerpt", label: "摘录", desc: "保留全文，补全缺失" },
  { mode: "cloze", label: "挖空", desc: "关键处挖空回忆" },
  { mode: "quiz", label: "出题", desc: "融为一道综合题" },
  { mode: "custom", label: "自定义", desc: "按你的要求处理" },
];

export default function RecordPreviewWindow({ preview }: { preview: RecordPreview }) {
  const card = useReviewCards((s) => s.byId[preview.cardId]);
  const remove = useReviewCards((s) => s.remove);
  const { close, move, resize, bringToFront } = useRecordPreviews();
  const [flipped, setFlipped] = useState(false);

  // 流式态：思考 + 内容缓冲
  const [reasoningBuf, setReasoningBuf] = useState("");
  const [contentBuf, setContentBuf] = useState("");
  const [busy, setBusy] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customExpanded, setCustomExpanded] = useState(false);

  // 优化输入态
  const [reviseText, setReviseText] = useState("");
  const [reviseError, setReviseError] = useState<string | null>(null);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => move(preview.id, dx, dy));
  const onResizeStart = useResizable(elRef, (w, h) => resize(preview.id, w, h));

  useEffect(() => {
    if (!card) close(preview.id);
  }, [card, close, preview.id]);

  // 卡片状态变化时重置流式缓冲
  useEffect(() => {
    if (card?.status === "saved") {
      setReasoningBuf("");
      setContentBuf("");
      setBusy(false);
    }
  }, [card?.status]);

  if (!card) return null;

  const subjectName =
    isSubjectId(card.subjectId) ? getSubject(card.subjectId)?.name ?? card.subjectId : card.subjectId;

  const headerBtn =
    "flex items-center justify-center rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]";

  // 节流 UI 更新（60ms 合并）
  const uiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingReasoning = useRef("");
  const pendingContent = useRef("");
  const flushUi = useCallback(() => {
    if (uiTimerRef.current) { clearTimeout(uiTimerRef.current); uiTimerRef.current = null; }
    setReasoningBuf(pendingReasoning.current);
    setContentBuf(pendingContent.current);
  }, []);
  const scheduleUi = useCallback(() => {
    if (uiTimerRef.current) return;
    uiTimerRef.current = setTimeout(() => { uiTimerRef.current = null; flushUi(); }, 60);
  }, [flushUi]);

  const makeCallbacks = (): ProcessCallbacks => ({
    onReasoning: (delta) => { pendingReasoning.current += delta; scheduleUi(); },
    onContent: (delta) => { pendingContent.current += delta; scheduleUi(); },
  });

  async function handleProcess(mode: RecordMode, userInstruction?: string) {
    if (busy) return;
    setBusy(true);
    setReasoningBuf("");
    setContentBuf("");
    pendingReasoning.current = "";
    pendingContent.current = "";
    setReviseError(null);
    const r = await processRecord(preview.cardId, mode, userInstruction ? { userInstruction } : {}, makeCallbacks());
    flushUi();
    setBusy(false);
    if (!r.ok) setReviseError(r.error || "处理失败");
  }

  async function handleRetry() {
    if (busy) return;
    setBusy(true);
    setReasoningBuf("");
    setContentBuf("");
    pendingReasoning.current = "";
    pendingContent.current = "";
    setReviseError(null);
    const r = await retryRecord(preview.cardId, makeCallbacks());
    flushUi();
    setBusy(false);
    if (!r.ok) setReviseError(r.error || "重试失败");
  }

  async function handleRevise() {
    const text = reviseText.trim();
    if (!text || busy) return;
    setBusy(true);
    setReasoningBuf("");
    setContentBuf("");
    pendingReasoning.current = "";
    pendingContent.current = "";
    setReviseError(null);
    const r = await reviseRecord(preview.cardId, text, makeCallbacks());
    flushUi();
    setBusy(false);
    if (r.ok) {
      setReviseText("");
      setFlipped(false);
    } else {
      setReviseError(r.error || "优化失败");
    }
  }

  function handleDiscard() {
    remove(card.id);
    close(preview.id);
  }

  const isProcessing = card.status === "processing" || busy;

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
      {/* 标题栏 */}
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
        {/* saved 态：原文 + 4 按钮 */}
        {card.status === "saved" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            <OriginalRichText text={card.originalText} />
            <div style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center" }}>
              选择处理方式：
            </div>
            <ModeButtons onPick={(mode) => handleProcess(mode)} onCustomClick={() => setCustomExpanded(true)} disabled={busy} />
            {customExpanded && (
              <CustomInput
                value={customInput}
                onChange={setCustomInput}
                onSubmit={() => {
                  if (customInput.trim()) {
                    handleProcess("custom", customInput.trim());
                    setCustomInput("");
                    setCustomExpanded(false);
                  }
                }}
                onCancel={() => setCustomExpanded(false)}
              />
            )}
          </div>
        )}

        {/* processing 态：思考折叠 + 流式内容 */}
        {(card.status === "processing" || isProcessing) && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
            <ThinkingPanel content={reasoningBuf} isProcessing={isProcessing} />
            {contentBuf && (
              <div
                className="scroll-y chat-prose"
                style={{
                  flex: 1, minHeight: 0, overflowY: "auto",
                  padding: "10px 12px",
                  fontSize: 13, lineHeight: 1.6,
                  background: "var(--bg-muted)", borderRadius: 10,
                  border: "1px solid var(--line)",
                }}
              >
                <QuizMarkdown className="chat-prose">{contentBuf}</QuizMarkdown>
              </div>
            )}
            {!contentBuf && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-primary)", fontSize: 13 }}>
                <Loader size={15} className="animate-spin" />
                <span>AI 正在处理中…（已保存原文，不会丢失）</span>
              </div>
            )}
          </div>
        )}

        {/* error 态 */}
        {card.status === "error" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-error)", fontSize: 13 }}>
              <AlertTriangle size={15} /> {card.error || "处理失败"}
            </div>
            {reviseError && (
              <div style={{ fontSize: 11.5, color: "var(--md-sys-color-error)" }}>{reviseError}</div>
            )}
            <OriginalRichText text={card.originalText} />
          </div>
        )}

        {/* ready 态：FlipCard + 优化 + 4按钮 + 原文折叠 */}
        {card.status === "ready" && !isProcessing && (
          <>
            <div style={{ flex: 1, minHeight: 0 }}>
              <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--accent)" }}>
              <Check size={13} /> 已存入「{subjectName}」复习板
            </div>
            <ReviseInput
              value={reviseText}
              onChange={(v) => { setReviseText(v); if (reviseError) setReviseError(null); }}
              onSubmit={handleRevise}
              busy={busy}
              error={reviseError}
            />
            <ModeButtons onPick={(mode) => handleProcess(mode)} onCustomClick={() => setCustomExpanded(true)} disabled={busy} small />
            {customExpanded && (
              <CustomInput
                value={customInput}
                onChange={setCustomInput}
                onSubmit={() => {
                  if (customInput.trim()) {
                    handleProcess("custom", customInput.trim());
                    setCustomInput("");
                    setCustomExpanded(false);
                  }
                }}
                onCancel={() => setCustomExpanded(false)}
              />
            )}
            <CollapsibleSection label="原文" meta={`${card.originalText.length} 字`} defaultOpen={false}>
              <div className="scroll-y chat-prose" style={{ maxHeight: 200, overflowY: "auto", padding: "10px 12px", background: "var(--bg-muted)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <QuizMarkdown className="chat-prose">{card.originalText}</QuizMarkdown>
              </div>
            </CollapsibleSection>
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
        {card.status === "ready" && !isProcessing ? (
          <>
            <ActionBtn onClick={() => close(preview.id)} icon={Check} label="保留" primary />
            <ActionBtn onClick={() => { setFlipped(false); handleRetry(); }} icon={RefreshCw} label="重做" />
            <ActionBtn onClick={handleDiscard} icon={Trash2} label="丢弃" danger />
          </>
        ) : card.status === "error" ? (
          <>
            <ActionBtn onClick={handleRetry} icon={RefreshCw} label="重试" primary />
            <ActionBtn onClick={handleDiscard} icon={Trash2} label="删除" danger />
          </>
        ) : card.status === "saved" ? (
          <ActionBtn onClick={handleDiscard} icon={X} label="取消" />
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
          right: 1, bottom: 1, width: 18, height: 18,
          display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
          padding: 2, color: "var(--md-sys-color-outline)", cursor: "nwse-resize", touchAction: "none",
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

/** 原文富文本区（可折叠，默认展开）。 */
function OriginalRichText({ text }: { text: string }) {
  return (
    <CollapsibleSection label="原文" meta={`${text.length} 字`} defaultOpen={text.length < 300}>
      <div
        className="scroll-y chat-prose"
        style={{
          maxHeight: 280, overflowY: "auto",
          padding: "10px 12px",
          fontSize: 13, lineHeight: 1.6,
          background: "var(--bg-muted)", borderRadius: 10,
          border: "1px solid var(--line)",
        }}
      >
        <QuizMarkdown className="chat-prose">{text}</QuizMarkdown>
      </div>
    </CollapsibleSection>
  );
}

/** 4 个模式按钮。 */
function ModeButtons({ onPick, onCustomClick, disabled, small }: { onPick: (mode: RecordMode) => void; onCustomClick?: () => void; disabled?: boolean; small?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {MODE_LABELS.map(({ mode, label, desc }) => (
        <button
          key={mode}
          data-no-drag
          disabled={disabled}
          className="press"
          onClick={() => mode === "custom" ? onCustomClick?.() : onPick(mode)}
          title={desc}
          style={{
            flex: small ? "1 1 80px" : "1 1 100px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: small ? "6px 4px" : "10px 6px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "var(--bg-panel)",
            color: "var(--ink)",
            fontSize: small ? 12 : 13,
            fontWeight: 600,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span>{label}</span>
          {small && <span style={{ fontSize: 10, fontWeight: 400, color: "var(--ink-faint)" }}>{desc}</span>}
        </button>
      ))}
    </div>
  );
}

/** 自定义模式输入框。 */
function CustomInput({ value, onChange, onSubmit, onCancel }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div data-no-drag style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onSubmit(); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        placeholder="输入你的处理要求…（如：把公式推导过程写详细）"
        autoFocus
        style={{
          flex: 1, minWidth: 0, height: 34, padding: "0 10px",
          borderRadius: 9, border: "1px solid var(--line)",
          background: "var(--bg-panel)", color: "var(--ink)", fontSize: 12.5,
        }}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="press"
          style={{
            padding: "5px 12px", borderRadius: 9, border: "none",
            background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)",
            fontSize: 12.5, fontWeight: 600, cursor: value.trim() ? "pointer" : "default",
            opacity: value.trim() ? 1 : 0.5,
          }}
        >
          提交
        </button>
        <button
          onClick={onCancel}
          className="press"
          style={{
            padding: "5px 12px", borderRadius: 9, border: "1px solid var(--line)",
            background: "transparent", color: "var(--ink-soft)", fontSize: 12.5, cursor: "pointer",
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
}

/** 思考折叠面板（流式 reasoning）。 */
function ThinkingPanel({ content, isProcessing }: { content: string; isProcessing: boolean }) {
  const [isExpanded, setIsExpanded] = useProcessingDisclosure(isProcessing);
  if (!content || content.trim() === "") return null;
  const lines = content.split("\n");
  const preview = lines.slice(0, 2).join("\n").slice(0, 120);

  return (
    <div style={{
      borderRadius: 8,
      background: "var(--md-sys-color-surface-container-high)",
      border: "1px solid var(--md-sys-color-outline-variant)",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        data-no-drag
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BrainCircuit size={14} style={{ color: "var(--md-sys-color-primary)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-primary)" }}>思考过程</span>
          {isProcessing && <Loader2 size={12} className="animate-spin" style={{ color: "var(--md-sys-color-primary)" }} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, color: "var(--md-sys-color-on-surface-variant)" }}>
            {isExpanded ? "收起" : "展开"}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      <AnimatedCollapse isOpen={isExpanded}>
        <div
          className="scroll-y chat-prose"
          style={{
            padding: "8px 12px 12px", borderTop: "1px solid var(--md-sys-color-outline-variant)",
            fontSize: 12, lineHeight: 1.6, color: "var(--md-sys-color-on-surface-variant)",
            maxHeight: 240, overflowY: "auto", wordBreak: "break-word",
          }}
        >
          <QuizMarkdown className="chat-prose">{content}</QuizMarkdown>
        </div>
      </AnimatedCollapse>
      <AnimatedCollapse isOpen={!isExpanded}>
        <div style={{ padding: "6px 12px", borderTop: "1px solid var(--md-sys-color-outline-variant)", fontSize: 12, color: "var(--md-sys-color-on-surface-variant)", lineHeight: 1.5 }}>
          {preview}{content.length > 120 ? "..." : ""}
        </div>
      </AnimatedCollapse>
    </div>
  );
}

/** ready 态的优化输入：输入一句话让 AI 优化当前卡片。 */
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
