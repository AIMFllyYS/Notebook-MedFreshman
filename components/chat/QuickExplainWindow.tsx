"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, Loader, MessageSquare, Send, Maximize2, Minimize2 } from "lucide-react";
import { useChatUI } from "@/lib/hooks/useChatUI";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { useStore } from "@/lib/store";
import { MessageContent } from "@/components/chat/MessageContent";
import type { ChatMessage } from "@/lib/types/chat";

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 窗口尺寸约束
const MIN_WIDTH = 360;
const MAX_WIDTH = 800;
const MIN_HEIGHT = 320;
const MAX_HEIGHT = 600;

export default function QuickExplainWindow() {
  const {
    quickExplainText,
    quickExplainPosition,
    quickExplainMode,
    quickExplainMessages,
    quickExplainSize,
    clearQuickExplain,
    addQuickExplainMessage,
    clearQuickExplainMessages,
    setQuickExplainSize,
  } = useChatUI();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(quickExplainSize);
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // 右下角手柄（边缘=右下，左上角 pos 不变，改 width/height）
  const resizeBRRef = useRef<{
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // 左下角手柄（边缘=左下，右边缘不动，左边缘 pos.x 跟随鼠标，width 反向，height 正向）
  const resizeBLRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // 扩大前快照（pos+size），用于还原
  const preExpandRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 当 quickExplainText 变化时，初始化消息并发起请求
  useEffect(() => {
    if (!quickExplainText) {
      clearQuickExplainMessages();
      setError(null);
      setIsLoading(false);
      abortRef.current?.abort();
      return;
    }

    // 初始位置：靠近选区（使用 quickExplainSize 避免依赖本地 size 状态）
    if (quickExplainPosition) {
      const x = Math.min(
        quickExplainPosition.x + 20,
        window.innerWidth - quickExplainSize.width - 16,
      );
      const y = Math.min(
        quickExplainPosition.y - 60,
        window.innerHeight - quickExplainSize.height - 16,
      );
      setPos({ x: Math.max(x, 16), y: Math.max(y, 16) });
    }

    // 初始化消息：添加用户消息
    const userMsgId = generateId();
    clearQuickExplainMessages();
    addQuickExplainMessage({
      id: userMsgId,
      role: "user",
      content: quickExplainText,
      timestamp: Date.now(),
    });

    setError(null);
    setIsLoading(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    const modeText = quickExplainMode === "explain" ? "解释" : "举例";
    const prompt = `请用最通俗易懂的语言，直接${modeText}以下选中的文本段落（无需铺垫，即答即可）：\n\n<SelectedText>\n${quickExplainText}\n</SelectedText>`;

    (async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: "flash",
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("流读取失败");

        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let accumulated = "";

        // 添加 assistant 消息占位
        const assistantMsgId = generateId();
        addQuickExplainMessage({
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const event = JSON.parse(data);
              switch (event.type) {
                case "content":
                  // 兼容流式增量(delta)和完整内容(content)两种格式
                  if (event.delta) {
                    accumulated += event.delta;
                  } else if (event.content) {
                    accumulated = event.content;
                  }
                  useChatUI.setState((state) => ({
                    quickExplainMessages: state.quickExplainMessages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: accumulated }
                        : m,
                    ),
                  }));
                  break;
                case "done":
                  // 流结束信号，退出循环
                  return;
                case "error":
                  setError(event.message || "发生未知错误");
                  break;
                case "reasoning":
                case "tool":
                  // 浮窗模式忽略深度思考和工具调用事件
                  break;
              }
            } catch {
              // 忽略解析失败的行
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "获取解释失败");
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickExplainText, quickExplainPosition, quickExplainMode]);

  // 滚动到底部当消息更新时
  useEffect(() => {
    scrollToBottom();
  }, [quickExplainMessages, scrollToBottom]);

  // ── 拖拽逻辑（标题栏）──────────────────────────────────────
  // 点中按钮时不启动拖拽，避免 setPointerCapture 吞掉按钮的 click（根因修复）
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (isExpanded) return; // 展开态禁用拖拽
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: pos.x,
        initialY: pos.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos, isExpanded],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - size.height;
    setPos({
      x: Math.max(0, Math.min(dragRef.current.initialX + dx, maxX)),
      y: Math.max(0, Math.min(dragRef.current.initialY + dy, maxY)),
    });
  }, [size.width, size.height]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // ── 右下角伸缩（边缘=右下，左上角 pos 不变）─────────────────
  const handleResizeBRStart = useCallback(
    (e: React.PointerEvent) => {
      if (isExpanded) return;
      e.preventDefault();
      e.stopPropagation();
      resizeBRRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialWidth: size.width,
        initialHeight: size.height,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [size, isExpanded],
  );

  const handleResizeBRMove = useCallback((e: React.PointerEvent) => {
    if (!resizeBRRef.current) return;
    const dx = e.clientX - resizeBRRef.current.startX;
    const dy = e.clientY - resizeBRRef.current.startY;
    const maxWidth = Math.min(MAX_WIDTH, window.innerWidth - pos.x);
    const maxHeight = Math.min(MAX_HEIGHT, window.innerHeight - pos.y);
    setSize({
      width: Math.max(MIN_WIDTH, Math.min(maxWidth, resizeBRRef.current.initialWidth + dx)),
      height: Math.max(MIN_HEIGHT, Math.min(maxHeight, resizeBRRef.current.initialHeight + dy)),
    });
  }, [pos.x, pos.y]);

  const handleResizeBREnd = useCallback(
    (e: React.PointerEvent) => {
      if (resizeBRRef.current) setQuickExplainSize(size);
      resizeBRRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [size, setQuickExplainSize],
  );

  // ── 左下角伸缩（边缘=左下，右边缘固定，pos.x+width 联动，height 正向）──
  const handleResizeBLStart = useCallback(
    (e: React.PointerEvent) => {
      if (isExpanded) return;
      e.preventDefault();
      e.stopPropagation();
      resizeBLRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: pos.x,
        initialWidth: size.width,
        initialHeight: size.height,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos, size, isExpanded],
  );

  const handleResizeBLMove = useCallback((e: React.PointerEvent) => {
    if (!resizeBLRef.current) return;
    const dx = e.clientX - resizeBLRef.current.startX;
    const dy = e.clientY - resizeBLRef.current.startY;
    // 右边缘固定：right = initialX + initialWidth
    const right = resizeBLRef.current.initialX + resizeBLRef.current.initialWidth;
    // 新宽度 = 右边缘 - 新左边缘；先算未夹紧的新左边缘
    let newX = resizeBLRef.current.initialX + dx;
    let newWidth = right - newX;
    // 夹紧宽度
    if (newWidth < MIN_WIDTH) {
      newWidth = MIN_WIDTH;
      newX = right - MIN_WIDTH;
    }
    if (newWidth > MAX_WIDTH) {
      newWidth = MAX_WIDTH;
      newX = right - MAX_WIDTH;
    }
    // 左边缘不能跑出视口左侧
    if (newX < 0) {
      newX = 0;
      newWidth = right - newX;
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
    }
    const maxHeight = Math.min(MAX_HEIGHT, window.innerHeight - pos.y);
    const newHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, resizeBLRef.current.initialHeight + dy));
    setPos({ x: newX, y: pos.y });
    setSize({ width: newWidth, height: newHeight });
  }, [pos.y]);

  const handleResizeBLEnd = useCallback(
    (e: React.PointerEvent) => {
      if (resizeBLRef.current) setQuickExplainSize(size);
      resizeBLRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [size, setQuickExplainSize],
  );

  // ── 关闭：重置全部本地状态 ──────────────────────────────────
  const handleClose = () => {
    abortRef.current?.abort();
    clearQuickExplain();
    setIsExpanded(false);
    setPos({ x: 0, y: 0 });
    setSize(quickExplainSize); // 回到 store 持久化尺寸（或默认 400×450）
    setInputValue("");
    setError(null);
    preExpandRef.current = null;
  };

  // ── 扩大/还原：铺满中间内容栏（notes-panel）──────────────────
  const handleToggleExpand = () => {
    if (isExpanded) {
      // 还原到扩大前快照
      const snap = preExpandRef.current;
      if (snap) {
        setPos({ x: snap.x, y: snap.y });
        setSize({ width: snap.width, height: snap.height });
      }
      preExpandRef.current = null;
      setIsExpanded(false);
    } else {
      // 记住扩大前快照
      preExpandRef.current = { x: pos.x, y: pos.y, width: size.width, height: size.height };
      const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setPos({ x: rect.left, y: rect.top });
        setSize({ width: rect.width, height: rect.height });
      } else {
        // 兜底：铺满除顶栏(48px)外的左半屏
        setPos({ x: 0, y: 48 });
        setSize({ width: Math.floor(window.innerWidth / 2), height: window.innerHeight - 48 });
      }
      setIsExpanded(true);
    }
  };

  // ── 浏览器窗口缩放：展开态跟随 notes-panel，非展开态夹紧 pos ──
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

  // 转到主面板：把浮窗消息转移到主对话历史
  const handleTransferToMainPanel = () => {
    const messages = useChatUI.getState().quickExplainMessages;
    if (messages.length === 0) {
      handleClose();
      return;
    }

    // 获取或创建主对话会话
    const chatHistoryState = useChatHistory.getState();
    let sessionId = chatHistoryState.activeSessionId;
    if (!sessionId) {
      sessionId = chatHistoryState.createSession();
    }

    // 转换消息格式并添加到主对话历史
    messages.forEach((msg) => {
      const chatMessage: ChatMessage = {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        reasoningContent: msg.reasoningContent,
      };
      useChatHistory.getState().addMessage(sessionId!, chatMessage);
    });

    // 切换到 AI tab
    useStore.getState().setRightTab("ai");

    // 关闭浮窗
    handleClose();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setError(null);

    // 添加用户消息
    addQuickExplainMessage({
      id: generateId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    });

    // 构建完整对话历史（包含刚添加的用户消息）
    const messages = useChatUI.getState().quickExplainMessages;
    const apiMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: "flash",
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("流读取失败");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulated = "";

      // 添加 assistant 消息占位
      const assistantMsgId = generateId();
      addQuickExplainMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const event = JSON.parse(data);
            switch (event.type) {
              case "content":
                // 兼容流式增量(delta)和完整内容(content)两种格式
                if (event.delta) {
                  accumulated += event.delta;
                } else if (event.content) {
                  accumulated = event.content;
                }
                useChatUI.setState((state) => ({
                  quickExplainMessages: state.quickExplainMessages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulated }
                      : m,
                  ),
                }));
                break;
              case "done":
                // 流结束信号，退出循环
                return;
              case "error":
                setError(event.message || "发生未知错误");
                break;
              case "reasoning":
              case "tool":
                // 浮窗模式忽略深度思考和工具调用事件
                break;
            }
          } catch {
            // 忽略解析失败的行
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "获取回复失败");
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleFollowUp = (question: string) => {
    setInputValue(question);
  };

  if (!mounted || !quickExplainText) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRadius: isExpanded ? 0 : 12,
        boxShadow: isExpanded
          ? "0 0 0 1px var(--md-sys-color-outline-variant)"
          : "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px var(--md-sys-color-outline-variant)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "scale-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      {/* 标题栏 / 拖拽手柄 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          padding: "10px 16px",
          background: "var(--md-sys-color-surface-container-high)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: isExpanded ? "default" : (dragRef.current ? "grabbing" : "grab"),
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--md-sys-color-primary)",
          }}
        >
          <Sparkles size={16} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            AI {quickExplainMode === "explain" ? "快捷解释" : "举例说明"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={handleToggleExpand}
            onPointerDown={(e) => e.stopPropagation()}
            title={isExpanded ? "还原" : "展开"}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--md-sys-color-on-surface-variant)",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--md-sys-color-surface-variant)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={handleClose}
            onPointerDown={(e) => e.stopPropagation()}
            title="关闭"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--md-sys-color-on-surface-variant)",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--md-sys-color-surface-variant)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 消息列表区 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {quickExplainMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              className={msg.role === "assistant" ? "chat-prose" : undefined}
              style={{
                maxWidth: "85%",
                padding: "8px 12px",
                background:
                  msg.role === "user"
                    ? "var(--md-sys-color-primary-container)"
                    : "var(--md-sys-color-surface-container)",
                borderRadius: 12,
                borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                borderBottomLeftRadius: msg.role === "user" ? 12 : 4,
                fontSize: 13,
                lineHeight: 1.5,
                color:
                  msg.role === "user"
                    ? "var(--md-sys-color-on-surface)"
                    : "inherit",
              }}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <MessageContent
                  content={msg.content}
                  enableVisualizations={false}
                  onFollowUpSelect={handleFollowUp}
                />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--md-sys-color-primary)",
              fontSize: 13,
              padding: "8px 12px",
            }}
          >
            <Loader size={14} className="animate-spin" />
            <span>AI 正在思考...</span>
          </div>
        )}
        {error && (
          <div
            style={{
              color: "var(--md-sys-color-error)",
              fontSize: 13,
              padding: "8px 12px",
            }}
          >
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div
        style={{
          padding: "8px 12px 12px",
          borderTop: "1px solid var(--md-sys-color-outline-variant)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="继续追问..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--md-sys-color-outline-variant)",
            background: "var(--md-sys-color-surface-container-highest)",
            fontSize: 13,
            color: "var(--md-sys-color-on-surface)",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background:
              inputValue.trim() && !isLoading
                ? "var(--md-sys-color-primary)"
                : "var(--md-sys-color-surface-container)",
            color:
              inputValue.trim() && !isLoading
                ? "var(--md-sys-color-on-primary)"
                : "var(--md-sys-color-on-surface-variant)",
            cursor: inputValue.trim() && !isLoading ? "pointer" : "default",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Send size={14} />
          发送
        </button>
      </div>

      {/* 底部升级按钮 */}
      <div
        style={{
          padding: "4px 12px 8px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleTransferToMainPanel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid var(--md-sys-color-outline)",
            background: "var(--md-sys-color-surface-container)",
            color: "var(--md-sys-color-primary)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <MessageSquare size={12} />
          添加至对话
        </button>
      </div>

      {/* 右下角伸缩手柄（展开态隐藏） */}
      {!isExpanded && (
        <div
          onPointerDown={handleResizeBRStart}
          onPointerMove={handleResizeBRMove}
          onPointerUp={handleResizeBREnd}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            cursor: "nwse-resize",
            background:
              "linear-gradient(135deg, transparent 50%, var(--md-sys-color-outline-variant) 50%)",
            borderRadius: "0 0 12px 0",
            touchAction: "none",
          }}
        />
      )}

      {/* 左下角伸缩手柄（展开态隐藏） */}
      {!isExpanded && (
        <div
          onPointerDown={handleResizeBLStart}
          onPointerMove={handleResizeBLMove}
          onPointerUp={handleResizeBLEnd}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: 16,
            height: 16,
            cursor: "nesw-resize",
            background:
              "linear-gradient(225deg, transparent 50%, var(--md-sys-color-outline-variant) 50%)",
            borderRadius: "0 0 0 12px",
            touchAction: "none",
          }}
        />
      )}
    </div>,
    document.body,
  );
}
