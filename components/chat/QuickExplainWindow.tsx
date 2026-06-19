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
  const [isMaximized, setIsMaximized] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

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

  // 拖拽逻辑
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: pos.x,
        initialY: pos.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // 尺寸调节逻辑
  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialWidth: size.width,
        initialHeight: size.height,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [size],
  );

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    const newWidth = Math.max(
      MIN_WIDTH,
      Math.min(MAX_WIDTH, resizeRef.current.initialWidth + dx),
    );
    const newHeight = Math.max(
      MIN_HEIGHT,
      Math.min(MAX_HEIGHT, resizeRef.current.initialHeight + dy),
    );
    setSize({ width: newWidth, height: newHeight });
  }, []);

  const handleResizeEnd = useCallback(
    (e: React.PointerEvent) => {
      if (resizeRef.current) {
        setQuickExplainSize(size);
      }
      resizeRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [size, setQuickExplainSize],
  );

  const handleClose = () => {
    abortRef.current?.abort();
    clearQuickExplain();
  };

  const handleToggleMaximize = () => {
    if (isMaximized) {
      setSize(quickExplainSize);
    } else {
      setSize({ width: MAX_WIDTH, height: MAX_HEIGHT });
    }
    setIsMaximized(!isMaximized);
  };

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
        borderRadius: 12,
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px var(--md-sys-color-outline-variant)",
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
          cursor: dragRef.current ? "grabbing" : "grab",
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
            onClick={handleToggleMaximize}
            title={isMaximized ? "还原" : "最大化"}
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
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={handleClose}
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

      {/* 尺寸调节手柄 */}
      <div
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
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
    </div>,
    document.body,
  );
}
