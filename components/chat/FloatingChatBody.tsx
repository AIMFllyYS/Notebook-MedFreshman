"use client";

import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@/lib/hooks/useChat";
import { useChatHistory, ensureChatHistoryBootstrap } from "@/lib/hooks/useChatHistory";
import { useChatReady } from "@/lib/hooks/useChatReady";
import ChatThread from "@/components/chat/ChatThread";
import ChatInput from "@/components/chat/ChatInput";
import type { ChatContext, ChatAttachment, ChatOptions } from "@/lib/types/chat";
import type { FloatingWin } from "@/lib/hooks/useFloatingChats";

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
  const { messages, isLoading, error, sendMessage, stopGeneration, clearError } = useChat(
    chatContext,
    chatOptions,
    { sessionId: win.sessionId, modelId: win.modelId },
  );
  const chatReady = useChatReady();
  const seededRef = useRef(0);

  useEffect(() => {
    void ensureChatHistoryBootstrap();
    const { pinSession, ensureSessionLoaded } = useChatHistory.getState();
    pinSession(win.sessionId);
    void ensureSessionLoaded(win.sessionId);
    return () => useChatHistory.getState().unpinSession(win.sessionId);
  }, [win.sessionId]);

  useEffect(() => {
    if (win.seedNonce === 0 || win.seedNonce === seededRef.current) return;
    seededRef.current = win.seedNonce;
    if (win.seedMode === "explain") {
      sendMessage("请用最通俗易懂的语言解释这段内容（无需铺垫，即答即可）。", { quotedText: win.seedText });
    } else if (win.seedMode === "example") {
      sendMessage("请用一个具体、贴近的例子来说明这段内容。", { quotedText: win.seedText });
    }
  }, [sendMessage, win.seedMode, win.seedNonce, win.seedText]);

  useEffect(() => () => stopGeneration(), [stopGeneration]);

  function handleSend(content: string, opts?: SendOpts) {
    const isFirst = messages.length === 0;
    const quoted = isFirst && win.seedMode === "ask" && win.seedText.trim() ? win.seedText : opts?.quotedText;
    sendMessage(content, { ...opts, quotedText: quoted });
  }

  return (
    <>
      <ChatThread
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClearError={clearError}
        onFollowUpClick={(question) => sendMessage(question)}
        hydrated={chatReady}
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
        disableQuote
      />
    </>
  );
}
