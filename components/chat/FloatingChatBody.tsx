"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/lib/hooks/useChat";
import { useChatHistory, ensureChatHistoryBootstrap } from "@/lib/hooks/useChatHistory";
import { useChatReady } from "@/lib/hooks/useChatReady";
import ChatThread from "@/components/chat/ChatThread";
import ChatInput from "@/components/chat/ChatInput";
import type { ChatContext, ChatAttachment, ChatOptions } from "@/lib/types/chat";
import { useFloatingChats, type FloatingWin } from "@/lib/hooks/useFloatingChats";

type SendOpts = {
  quotedText?: string;
  enableThinking?: boolean;
  enableSearch?: boolean;
  attachments?: ChatAttachment[];
};

interface FloatingChatBodyProps {
  win: FloatingWin;
  chatContext: ChatContext;
  onModelChange: (modelId: string) => void;
}

/** 划词浮窗可见时挂载；内含 useChat，最小化时卸载以切断 store 订阅。 */
export default function FloatingChatBody({ win, chatContext, onModelChange }: FloatingChatBodyProps) {
  const chatOptions = useMemo<ChatOptions>(() => ({ contextMode: "full" }), []);
  const { messages, isLoading, error, info, sendMessage, stopGeneration, clearError, clearInfo } = useChat(
    chatContext,
    chatOptions,
    { sessionId: win.sessionId, modelId: win.modelId },
  );
  const chatReady = useChatReady(win.sessionId);
  const seededRef = useRef<string | null>(null);
  const [composerInset, setComposerInset] = useState(150);

  useEffect(() => {
    void ensureChatHistoryBootstrap();
    const { pinSession, ensureSessionLoaded } = useChatHistory.getState();
    pinSession(win.sessionId);
    void ensureSessionLoaded(win.sessionId);
    return () => useChatHistory.getState().unpinSession(win.sessionId);
  }, [win.sessionId]);

  useEffect(() => {
    if (win.seedNonce === 0) { seededRef.current = null; return; }
    const seedKey = `${win.sessionId}:${win.seedNonce}`;
    if (!chatReady || isLoading || win.seedMode === "ask" || seededRef.current === seedKey) return;
    let cancelled = false;
    // StrictMode 的首次 setup 会马上 cleanup；延后到微任务后才真正创建消息和网络请求。
    queueMicrotask(() => {
      if (cancelled || seededRef.current === seedKey) return;
      const current = useFloatingChats.getState().windows.find((item) => item.id === win.id);
      if (!current || current.sessionId !== win.sessionId || current.seedNonce !== win.seedNonce
        || current.seedMode !== win.seedMode || current.seedText !== win.seedText) return;
      const prompt = win.seedMode === "explain"
        ? "请用最通俗易懂的语言解释这段内容（无需铺垫，即答即可）。"
        : "请用一个具体、贴近的例子来说明这段内容。";
      if (!sendMessage(prompt, { quotedText: win.seedText })) return;
      seededRef.current = seedKey;
      // 只确认真正被 hook 接收的 seed；存进窗口状态，最小化后重挂载也不会重复发送。
      if (useFloatingChats.getState().windows.find((item) => item.id === win.id) === current) {
        useFloatingChats.getState().updateWindow(win.id, { seedNonce: 0 });
      }
    });
    return () => { cancelled = true; };
  }, [chatReady, isLoading, sendMessage, win.id, win.sessionId, win.seedMode, win.seedNonce, win.seedText]);

  useEffect(() => () => stopGeneration(), [stopGeneration]);

  function handleSend(content: string, opts?: SendOpts) {
    const isFirst = messages.length === 0;
    const quoted = isFirst && win.seedMode === "ask" && win.seedText.trim() ? win.seedText : opts?.quotedText;
    sendMessage(content, { ...opts, quotedText: quoted });
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col" data-chat-surface="floating">
      <ChatThread
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClearError={clearError}
        info={info}
        onClearInfo={clearInfo}
        onFollowUpClick={(question) => sendMessage(question)}
        hydrated={chatReady}
        bottomInset={composerInset}
        sessionId={win.sessionId}
        repairModelId={win.modelId}
        topic={chatContext.currentTopic}
        emptyState={
          <div style={{ padding: 16, textAlign: "center", color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.6 }}>
            {win.seedText ? "就这段选中的内容，问点什么吧。" : "开始你的提问。"}
          </div>
        }
      />
      <ChatInput
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading || !chatReady}
        chatContext={chatContext}
        modelId={win.modelId}
        onModelChange={onModelChange}
        floatingSessionId={win.sessionId}
        onComposerInsetChange={setComposerInset}
        disableQuote
      />
    </div>
  );
}
