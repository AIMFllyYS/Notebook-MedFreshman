"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
import {
  useFloatingChats, persistFloatingSize, FLOATING_MIN_W, FLOATING_MIN_H, type FloatingWin,
} from "@/lib/hooks/useFloatingChats";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { useStore } from "@/lib/store";
import { useChat } from "@/lib/hooks/useChat";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import ChatThread from "@/components/chat/ChatThread";
import ChatInput from "@/components/chat/ChatInput";
import type { ChatContext, ChatAttachment } from "@/lib/types/chat";

type SendOpts = { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean; attachments?: ChatAttachment[] };

/**
 * 划词浮窗（薄壳）：复用主对话的流式引擎（useChat + 指定 sessionId）、转录视图（ChatThread）
 * 与输入区（ChatInput：模型/思考/联网在底部，发送↔停止内建）。消息持久化于 useChatHistory，
 * 关窗不丢、可从历史「划词」栏还原。拖拽/缩放走 useDraggable/useResizable（rAF 改 style，零重渲）。
 */
export default function FloatingChatWindow({ win }: { win: FloatingWin }) {
  const { closeWindow, updateWindow, bringToFront, commitGeometry, setFullscreen } = useFloatingChats();
  const sessionTitle = useChatHistory((s) => s.sessions.find((x) => x.id === win.sessionId)?.title);

  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const chatContext: ChatContext = useMemo(
    () => ({
      subjectId: activeSubjectId,
      categoryId: activeCategoryId,
      itemId: activeItemId,
      currentTopic: `${activeSubjectId} ${activeCategoryId} ${activeItemId}`,
    }),
    [activeSubjectId, activeCategoryId, activeItemId],
  );

  const chatOptions = useMemo(() => ({ contextMode: "full" as const }), []);
  const { messages, isLoading, error, sendMessage, stopGeneration, clearError } = useChat(
    chatContext,
    chatOptions,
    { sessionId: win.sessionId, modelId: win.modelId },
  );

  const isExpanded = win.fullscreen;
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const seededRef = useRef(0);

  // 拖拽（标题栏）/缩放（右下角）共用同一个根元素 ref；移动期间直接改 style，松手才落库。
  const { elRef, onPointerDown: onDragStart } = useDraggable((dx, dy) => {
    const x = Math.max(0, Math.min(win.pos.x + dx, window.innerWidth - win.size.width));
    const y = Math.max(0, Math.min(win.pos.y + dy, window.innerHeight - win.size.height));
    commitGeometry(win.id, { pos: { x, y } });
  });
  const onResizeStart = useResizable(
    elRef,
    (w, h) => {
      const size = { width: w, height: h };
      persistFloatingSize(size);
      commitGeometry(win.id, { size });
    },
    { minW: FLOATING_MIN_W, minH: FLOATING_MIN_H },
  );

  // 解释/举例：挂载即自动发问（每个 seedNonce 仅一次；还原窗 seedNonce=0 不触发）。
  useEffect(() => {
    if (win.seedNonce === 0 || win.seedNonce === seededRef.current) return;
    seededRef.current = win.seedNonce;
    if (win.seedMode === "explain") {
      sendMessage("请用最通俗易懂的语言解释这段内容（无需铺垫，即答即可）。", { quotedText: win.seedText });
    } else if (win.seedMode === "example") {
      sendMessage("请用一个具体、贴近的例子来说明这段内容。", { quotedText: win.seedText });
    }
    // ask：不自动发问，等用户输入（首条自动附选区引用，见 handleSend）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.seedNonce]);

  // 浏览器缩放：全屏跟随 #notes-panel；非全屏把窗夹回视口内。
  useEffect(() => {
    function onResize() {
      if (isExpanded) {
        const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          commitGeometry(win.id, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
        }
      } else {
        commitGeometry(win.id, {
          pos: {
            x: Math.max(0, Math.min(win.pos.x, window.innerWidth - win.size.width)),
            y: Math.max(0, Math.min(win.pos.y, window.innerHeight - win.size.height)),
          },
        });
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isExpanded, win.id, win.pos.x, win.pos.y, win.size.width, win.size.height, commitGeometry]);

  function handleSend(content: string, opts?: SendOpts) {
    // 追问首条自动附选区引用（之后正常对话）；复用 useChat 的引用格式化。
    const isFirst = messages.length === 0;
    const quoted = isFirst && win.seedMode === "ask" && win.seedText.trim() ? win.seedText : opts?.quotedText;
    sendMessage(content, { ...opts, quotedText: quoted });
  }

  function handleClose() {
    stopGeneration();
    closeWindow(win.id);
  }

  function toggleExpand() {
    if (isExpanded) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(win.id, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(win.id, false);
    } else {
      preExpandRef.current = { pos: win.pos, size: win.size };
      const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        commitGeometry(win.id, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
      } else {
        commitGeometry(win.id, { pos: { x: 0, y: 48 }, size: { width: Math.floor(window.innerWidth / 2), height: window.innerHeight - 48 } });
      }
      setFullscreen(win.id, true);
    }
  }

  const titleLabel =
    sessionTitle && sessionTitle !== "新对话"
      ? sessionTitle
      : win.seedMode === "explain"
        ? "AI 解释"
        : win.seedMode === "example"
          ? "AI 举例"
          : "AI 追问";
  const headerBtn =
    "flex items-center justify-center rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]";

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(win.id)}
      style={{
        position: "fixed",
        left: win.pos.x, top: win.pos.y, width: win.size.width, height: win.size.height,
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRadius: isExpanded ? 0 : 12,
        boxShadow: isExpanded
          ? "0 0 0 1px var(--md-sys-color-outline-variant)"
          : "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px var(--md-sys-color-outline-variant)",
        zIndex: win.z,
        display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "scale-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      {/* 标题栏 / 拖拽手柄（仅显示标题与全屏/关闭；设置·历史·新对话留在右侧主面板）*/}
      <div
        onPointerDown={isExpanded ? undefined : onDragStart}
        style={{
          padding: "8px 12px",
          background: "var(--md-sys-color-surface-container-high)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: isExpanded ? "default" : "grab", userSelect: "none", touchAction: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--md-sys-color-primary)", minWidth: 0 }}>
          <Sparkles size={15} className="shrink-0" />
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {titleLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button onClick={toggleExpand} title={isExpanded ? "还原" : "全屏"} className={headerBtn} data-no-drag>
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={handleClose} title="关闭" className={headerBtn} data-no-drag>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 转录视图：与主面板同款渲染（公式 / 工具 / 交互演示 / 检索引用 / FollowUp 全支持）*/}
      <ChatThread
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClearError={clearError}
        onFollowUpClick={(q) => sendMessage(q)}
        emptyState={
          <div style={{ padding: 16, textAlign: "center", color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.6 }}>
            {win.seedText ? "就这段选中的内容，问点什么吧。" : "开始你的提问。"}
          </div>
        }
      />

      {/* 输入区：复用主面板 ChatInput（模型/深度思考/联网搜索在底部；隐藏看板、禁用全局引用）*/}
      <ChatInput
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading}
        chatContext={chatContext}
        modelId={win.modelId}
        onModelChange={(id) => updateWindow(win.id, { modelId: id })}
        showTokenDashboard={false}
        disableQuote
      />

      {/* 右下角缩放手柄（非全屏）*/}
      {!isExpanded && (
        <div
          onPointerDown={onResizeStart}
          data-no-drag
          style={{
            position: "absolute", right: 0, bottom: 0, width: 16, height: 16, cursor: "nwse-resize",
            background: "linear-gradient(135deg, transparent 50%, var(--md-sys-color-outline-variant) 50%)",
            touchAction: "none",
          }}
        />
      )}
    </div>,
    document.body,
  );
}
