"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles, X, Loader, MessageSquare, Send, Maximize2, Minimize2,
  BrainCircuit, Globe,
} from "lucide-react";
import {
  useFloatingChats, genFloatingId, FLOATING_SIZE_KEY, type FloatingWin,
} from "@/lib/hooks/useFloatingChats";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { useStore } from "@/lib/store";
import { MessageContent } from "@/components/chat/MessageContent";
import ReasoningBlock from "@/components/chat/ReasoningBlock";
import ModelMenu from "@/components/chat/ModelMenu";
import { estimateTokens } from "@/lib/context/estimateTokens";
import { getModelInfo } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/types/chat";

const MIN_WIDTH = 360;
const MAX_WIDTH = 800;
const MIN_HEIGHT = 320;
const MAX_HEIGHT = 600;
const UI_THROTTLE_MS = 60;

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/** 单个划词浮窗：可拖拽/缩放/全屏，独立会话与模型，互不影响。 */
export default function FloatingChatWindow({ win }: { win: FloatingWin }) {
  const {
    closeWindow, updateWindow, bringToFront, appendMessage, patchMessage, setFullscreen,
  } = useFloatingChats();

  const [inputValue, setInputValue] = useState("");
  const [pos, setPos] = useState(win.pos);
  const [size, setSize] = useState(win.size);

  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const resizeBRRef = useRef<{ startX: number; startY: number; initialWidth: number; initialHeight: number } | null>(null);
  const resizeBLRef = useRef<{ startX: number; startY: number; initialX: number; initialWidth: number; initialHeight: number } | null>(null);
  const preExpandRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(0);

  const isExpanded = win.fullscreen;

  // ── 流式请求（节流落库，避免长输出时跨窗 re-render 风暴）──────────────
  function streamReply(apiMessages: { role: string; content: string }[]) {
    const assistantId = genFloatingId();
    appendMessage(win.id, { id: assistantId, role: "assistant", content: "", timestamp: Date.now() });
    updateWindow(win.id, { isLoading: true, error: null });

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = "";
    let reason = "";
    let timer: ReturnType<typeof setTimeout> | null = null;
    const flush = () => {
      timer = null;
      patchMessage(win.id, assistantId, { content: acc, reasoningContent: reason || undefined });
    };
    const schedule = () => { if (!timer) timer = setTimeout(flush, UI_THROTTLE_MS); };

    (async () => {
      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            modelId: win.modelId,
            enableThinking: win.enableThinking,
            enableSearch: win.enableSearch,
          }),
          signal: ctrl.signal,
        });
        if (!resp.ok) throw new Error(`API 请求失败: ${resp.status}`);
        const reader = resp.body?.getReader();
        if (!reader) throw new Error("流读取失败");
        const dec = new TextDecoder("utf-8");
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const ev = JSON.parse(data);
              switch (ev.type) {
                case "content":
                  if (ev.delta) acc += ev.delta;
                  else if (ev.content) acc = ev.content;
                  schedule();
                  break;
                case "reasoning":
                  if (ev.delta) reason += ev.delta;
                  else if (ev.content) reason = ev.content;
                  schedule();
                  break;
                case "done":
                  if (timer) clearTimeout(timer);
                  flush();
                  return;
                case "error":
                  updateWindow(win.id, { error: ev.message || "发生未知错误" });
                  break;
              }
            } catch {
              /* 忽略解析失败行 */
            }
          }
        }
        if (timer) clearTimeout(timer);
        flush();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        updateWindow(win.id, { error: err instanceof Error ? err.message : "获取回复失败" });
      } finally {
        if (timer) clearTimeout(timer);
        flush();
        updateWindow(win.id, { isLoading: false });
        abortRef.current = null;
      }
    })();
  }

  // ── 解释/举例：挂载即自动发问（每个 seedNonce 仅一次）──────────────────
  useEffect(() => {
    if (win.seedNonce === seededRef.current) return;
    seededRef.current = win.seedNonce;
    if (win.seedMode === "explain" || win.seedMode === "example") {
      const modeText = win.seedMode === "explain" ? "解释" : "举例";
      const prompt = `请用最通俗易懂的语言，直接${modeText}以下选中的文本段落（无需铺垫，即答即可）：\n\n<SelectedText>\n${win.seedText}\n</SelectedText>`;
      appendMessage(win.id, { id: genFloatingId(), role: "user", content: win.seedText, timestamp: Date.now() });
      streamReply([{ role: "user", content: prompt }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.seedNonce]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [win.messages]);

  // ── 发送（追问首条自动附选区引用）────────────────────────────────────
  function handleSend() {
    const text = inputValue.trim();
    if (!text || win.isLoading) return;
    let content = text;
    if (win.seedMode === "ask" && win.messages.length === 0 && win.seedText.trim()) {
      const quote = win.seedText.length > 180 ? win.seedText.slice(0, 180) + "…" : win.seedText;
      content = `${text}\n\n（针对当前页面这段原文：> ${quote}）`;
    }
    appendMessage(win.id, { id: genFloatingId(), role: "user", content, timestamp: Date.now() });
    setInputValue("");
    const msgs = useFloatingChats.getState().windows.find((w) => w.id === win.id)?.messages ?? [];
    streamReply(msgs.map((m) => ({ role: m.role, content: m.content })));
  }

  function handleClose() {
    abortRef.current?.abort();
    closeWindow(win.id);
  }

  // 转到主面板：把本窗消息搬进主对话历史
  function handleTransfer() {
    const msgs = useFloatingChats.getState().windows.find((w) => w.id === win.id)?.messages ?? [];
    if (msgs.length > 0) {
      const chs = useChatHistory.getState();
      const sid = chs.activeSessionId || chs.createSession();
      msgs.forEach((m) => {
        const cm: ChatMessage = {
          id: m.id, role: m.role, content: m.content,
          timestamp: m.timestamp, reasoningContent: m.reasoningContent,
        };
        useChatHistory.getState().addMessage(sid, cm);
      });
      useStore.getState().setRightTab("ai");
    }
    handleClose();
  }

  // ── 拖拽（点中按钮/输入则不拖；展开态禁用）─────────────────────────────
  function onTitlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button, input, [data-no-drag]")) return;
    if (isExpanded) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onTitlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: Math.max(0, Math.min(dragRef.current.initialX + dx, window.innerWidth - size.width)),
      y: Math.max(0, Math.min(dragRef.current.initialY + dy, window.innerHeight - size.height)),
    });
  }
  function onTitlePointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // ── 右下角缩放 ───────────────────────────────────────────────────────
  function onBRStart(e: React.PointerEvent) {
    if (isExpanded) return;
    e.preventDefault(); e.stopPropagation();
    resizeBRRef.current = { startX: e.clientX, startY: e.clientY, initialWidth: size.width, initialHeight: size.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onBRMove(e: React.PointerEvent) {
    if (!resizeBRRef.current) return;
    const dx = e.clientX - resizeBRRef.current.startX;
    const dy = e.clientY - resizeBRRef.current.startY;
    const maxW = Math.min(MAX_WIDTH, window.innerWidth - pos.x);
    const maxH = Math.min(MAX_HEIGHT, window.innerHeight - pos.y);
    setSize({
      width: Math.max(MIN_WIDTH, Math.min(maxW, resizeBRRef.current.initialWidth + dx)),
      height: Math.max(MIN_HEIGHT, Math.min(maxH, resizeBRRef.current.initialHeight + dy)),
    });
  }
  function onBREnd(e: React.PointerEvent) {
    if (resizeBRRef.current) persistSize();
    resizeBRRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // ── 左下角缩放（右缘固定）─────────────────────────────────────────────
  function onBLStart(e: React.PointerEvent) {
    if (isExpanded) return;
    e.preventDefault(); e.stopPropagation();
    resizeBLRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialWidth: size.width, initialHeight: size.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onBLMove(e: React.PointerEvent) {
    if (!resizeBLRef.current) return;
    const dx = e.clientX - resizeBLRef.current.startX;
    const dy = e.clientY - resizeBLRef.current.startY;
    const right = resizeBLRef.current.initialX + resizeBLRef.current.initialWidth;
    let newX = resizeBLRef.current.initialX + dx;
    let newWidth = right - newX;
    if (newWidth < MIN_WIDTH) { newWidth = MIN_WIDTH; newX = right - MIN_WIDTH; }
    if (newWidth > MAX_WIDTH) { newWidth = MAX_WIDTH; newX = right - MAX_WIDTH; }
    if (newX < 0) { newX = 0; newWidth = Math.min(right, MAX_WIDTH); }
    const maxH = Math.min(MAX_HEIGHT, window.innerHeight - pos.y);
    setPos({ x: newX, y: pos.y });
    setSize({ width: newWidth, height: Math.max(MIN_HEIGHT, Math.min(maxH, resizeBLRef.current.initialHeight + dy)) });
  }
  function onBLEnd(e: React.PointerEvent) {
    if (resizeBLRef.current) persistSize();
    resizeBLRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function persistSize() {
    updateWindow(win.id, { size });
    try { localStorage.setItem(FLOATING_SIZE_KEY, JSON.stringify(size)); } catch { /* ignore */ }
  }

  // ── 全屏切换：铺满 #notes-panel；两个都全屏时按 z 叠放（相互覆盖）──────
  function toggleExpand() {
    if (isExpanded) {
      const snap = preExpandRef.current;
      if (snap) { setPos({ x: snap.x, y: snap.y }); setSize({ width: snap.width, height: snap.height }); }
      preExpandRef.current = null;
      setFullscreen(win.id, false);
    } else {
      preExpandRef.current = { x: pos.x, y: pos.y, width: size.width, height: size.height };
      const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setPos({ x: rect.left, y: rect.top });
        setSize({ width: rect.width, height: rect.height });
      } else {
        setPos({ x: 0, y: 48 });
        setSize({ width: Math.floor(window.innerWidth / 2), height: window.innerHeight - 48 });
      }
      setFullscreen(win.id, true);
    }
  }

  // 浏览器缩放：全屏跟随 #notes-panel，非全屏夹紧
  useEffect(() => {
    function onResize() {
      if (isExpanded) {
        const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          setPos({ x: rect.left, y: rect.top });
          setSize({ width: rect.width, height: rect.height });
        }
      } else {
        setPos((p) => ({
          x: Math.max(0, Math.min(p.x, window.innerWidth - size.width)),
          y: Math.max(0, Math.min(p.y, window.innerHeight - size.height)),
        }));
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isExpanded, size.width, size.height]);

  // ── 全屏上下文条（本窗自身估算，与主对话看板互不干扰）──────────────────
  const estTokens = useMemo(
    () => estimateTokens(win.messages.map((m) => m.content).join("\n")),
    [win.messages],
  );
  const ctxLimit = (getModelInfo(win.modelId)?.contextK ?? 0) * 1000;

  const headerBtn = "flex items-center justify-center rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]";

  return createPortal(
    <div
      onPointerDownCapture={() => bringToFront(win.id)}
      style={{
        position: "fixed",
        left: pos.x, top: pos.y, width: size.width, height: size.height,
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
      {/* 标题栏 / 拖拽手柄 */}
      <div
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        style={{
          padding: "8px 12px",
          background: "var(--md-sys-color-surface-container-high)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: isExpanded ? "default" : "grab",
          userSelect: "none", touchAction: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--md-sys-color-primary)", minWidth: 0 }}>
          <Sparkles size={15} className="shrink-0" />
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
            {win.seedMode === "explain" ? "AI 解释" : win.seedMode === "example" ? "AI 举例" : "AI 追问"}
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

      {/* 工具条：模型菜单 + 深度思考（始终）；联网搜索 + 上下文（全屏）。复用对应组件。 */}
      <div
        data-no-drag
        style={{
          display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
          padding: "4px 8px", borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <ModelMenu value={win.modelId} onChange={(id) => updateWindow(win.id, { modelId: id })} />
        <button
          onClick={() => updateWindow(win.id, { enableThinking: !win.enableThinking })}
          title="深度思考（展示推理过程）"
          className="press flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium"
          style={{
            color: win.enableThinking ? "var(--md-sys-color-on-primary-container)" : "var(--ink-soft)",
            background: win.enableThinking ? "var(--md-sys-color-primary-container)" : "transparent",
          }}
        >
          <BrainCircuit size={12} /> 深度思考
        </button>
        {isExpanded && (
          <>
            <button
              onClick={() => updateWindow(win.id, { enableSearch: !win.enableSearch })}
              title="联网搜索（需配置搜索 API）"
              className="press flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium"
              style={{
                color: win.enableSearch ? "var(--md-sys-color-on-tertiary-container)" : "var(--ink-soft)",
                background: win.enableSearch ? "var(--md-sys-color-tertiary-container)" : "transparent",
              }}
            >
              <Globe size={12} /> 联网搜索
            </button>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-soft)" }}>
              上下文 {fmtTokens(estTokens)}{ctxLimit > 0 ? ` / ${fmtTokens(ctxLimit)}` : ""}
            </span>
          </>
        )}
      </div>

      {/* 消息列表 */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {win.messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              className={msg.role === "assistant" ? "chat-prose" : undefined}
              style={{
                maxWidth: "88%", padding: "8px 12px",
                background: msg.role === "user" ? "var(--md-sys-color-primary-container)" : "var(--md-sys-color-surface-container)",
                borderRadius: 12,
                borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                borderBottomLeftRadius: msg.role === "user" ? 12 : 4,
                fontSize: 13, lineHeight: 1.5,
                color: msg.role === "user" ? "var(--md-sys-color-on-surface)" : "inherit",
              }}
            >
              {msg.role === "assistant" && msg.reasoningContent && (
                <ReasoningBlock content={msg.reasoningContent} isStreaming={win.isLoading} />
              )}
              {msg.role === "user" ? (
                <MessageContent content={msg.content} enableVisualizations={false} preserveLineBreaks />
              ) : (
                <MessageContent content={msg.content} enableVisualizations={false} onFollowUpSelect={setInputValue} />
              )}
            </div>
          </div>
        ))}
        {win.isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-primary)", fontSize: 13, padding: "4px 12px" }}>
            <Loader size={14} className="animate-spin" />
            <span>AI 正在思考...</span>
          </div>
        )}
        {win.error && (
          <div style={{ color: "var(--md-sys-color-error)", fontSize: 13, padding: "8px 12px" }}>{win.error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div data-no-drag style={{ padding: "8px 12px", borderTop: "1px solid var(--md-sys-color-outline-variant)", display: "flex", gap: 8 }}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={win.seedMode === "ask" && win.messages.length === 0 ? "对这段内容问点什么…" : "继续追问..."}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--md-sys-color-outline-variant)",
            background: "var(--md-sys-color-surface-container-highest)",
            fontSize: 13, color: "var(--md-sys-color-on-surface)", outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || win.isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, border: "none",
            background: inputValue.trim() && !win.isLoading ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container)",
            color: inputValue.trim() && !win.isLoading ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
            cursor: inputValue.trim() && !win.isLoading ? "pointer" : "default",
            fontSize: 13, fontWeight: 500,
          }}
        >
          <Send size={14} /> 发送
        </button>
      </div>

      {/* 转到主面板 */}
      <div data-no-drag style={{ padding: "4px 12px 8px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleTransfer}
          style={{
            display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6,
            border: "1px solid var(--md-sys-color-outline)", background: "var(--md-sys-color-surface-container)",
            color: "var(--md-sys-color-primary)", fontSize: 12, cursor: "pointer",
          }}
        >
          <MessageSquare size={12} /> 添加至对话
        </button>
      </div>

      {/* 缩放手柄（非全屏）*/}
      {!isExpanded && (
        <>
          <div
            onPointerDown={onBRStart} onPointerMove={onBRMove} onPointerUp={onBREnd} data-no-drag
            style={{ position: "absolute", right: 0, bottom: 0, width: 16, height: 16, cursor: "nwse-resize",
              background: "linear-gradient(135deg, transparent 50%, var(--md-sys-color-outline-variant) 50%)", touchAction: "none" }}
          />
          <div
            onPointerDown={onBLStart} onPointerMove={onBLMove} onPointerUp={onBLEnd} data-no-drag
            style={{ position: "absolute", left: 0, bottom: 0, width: 16, height: 16, cursor: "nesw-resize",
              background: "linear-gradient(225deg, transparent 50%, var(--md-sys-color-outline-variant) 50%)", touchAction: "none" }}
          />
        </>
      )}
    </div>,
    document.body,
  );
}
