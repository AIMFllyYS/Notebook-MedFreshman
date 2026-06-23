import { useState, useCallback, useRef } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { CUSTOM_MODEL_ID } from '@/lib/ai/models';
import type { ChatMessage, ChatAttachment, ChatContext, ChatOptions, ToolCallBlock, WebSearchSource } from '@/lib/types/chat';
import { parseXmlTags } from '@/lib/utils/xmlParser';
import { parseSseJsonEvents } from '@/lib/utils/sseEvents';
import { useTokenTracker } from './useTokenTracker';
import { getModelInfo } from '@/lib/ai/models';
import { estimateTokens } from '@/lib/context/estimateTokens';

interface SendMessageOptions {
  quotedText?: string;
  enableThinking?: boolean;
  enableSearch?: boolean;
  attachments?: ChatAttachment[];
}

interface ChatSseEvent {
  type?: string;
  delta?: string;
  content?: string;
  message?: string;
  status?: string;
  id?: string;
  name?: string;
  args?: Record<string, unknown>;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    cachedTokens?: number;
    totalTokens?: number;
  };
  meta?: {
    artifactId?: unknown;
    sources?: WebSearchSource[];
    cacheHit?: unknown;
    hits?: { title: string; path: string; snippet: string }[];
  };
}

export function useChat(chatContext: ChatContext, options?: ChatOptions) {
  const sessions = useChatHistory((s) => s.sessions);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const createSession = useChatHistory((s) => s.createSession);
  const addMessage = useChatHistory((s) => s.addMessage);
  const updateMessage = useChatHistory((s) => s.updateMessage);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const sendMessage = useCallback(
    (content: string, sendOptions?: SendMessageOptions) => {
      if (!content.trim() || loadingRef.current) return;
      // 水合门控双保险：IndexedDB 异步恢复完成前禁止建会话，防止抢跑导致历史丢失
      if (!useChatHistory.persist.hasHydrated()) return;

      // 合并 per-message 与 chat-level 选项
      const enableThinking = sendOptions?.enableThinking ?? options?.enableThinking;
      const enableSearch = sendOptions?.enableSearch ?? options?.enableSearch;
      const contextMode = options?.contextMode ?? 'full';

      // 获取或创建会话
      const state = useChatHistory.getState();
      let sessionId = state.activeSessionId;
      if (!sessionId) {
        sessionId = createSession(chatContext);
      }

      // 构建用户消息
      const userContent = sendOptions?.quotedText
        ? `针对当前页面这段原文：\n\n> ${sendOptions.quotedText}\n\n${content}`
        : content;
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userContent,
        timestamp: Date.now(),
        attachments: sendOptions?.attachments,
      };

      // 首条消息自动生成标题
      const currentSession = useChatHistory.getState().sessions.find((s) => s.id === sessionId);
      const isFirstMessage = !currentSession || currentSession.messages.length === 0;
      const title = isFirstMessage
        ? content.slice(0, 15) + (content.length > 15 ? '...' : '')
        : undefined;

      addMessage(sessionId, userMessage);

      if (title) {
        useChatHistory.setState((prev) => ({
          sessions: prev.sessions.map((s) =>
            s.id === sessionId ? { ...s, title } : s,
          ),
        }));
      }

      // 创建空的助手消息占位
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        reasoningContent: '',
        toolCalls: [],
        metadata: {
          thinkingEnabled: enableThinking,
          searchEnabled: enableSearch,
        },
      };
      addMessage(sessionId, assistantMessage);

      // 构建请求消息（仅 user / assistant 角色），含多模态图片
      const latestSession = useChatHistory.getState().sessions.find((s) => s.id === sessionId);
      const requestMessages = (latestSession?.messages || [])
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => {
          if (m.role === 'user' && m.attachments?.length) {
            const parts: Array<Record<string, unknown>> = [
              { type: 'text', text: m.content || '' },
              ...m.attachments.map((a) => ({
                type: 'image_url',
                image_url: { url: a.base64 },
              })),
            ];
            return { role: m.role as 'user', content: parts };
          }
          return { role: m.role as 'user' | 'assistant', content: m.content || '' };
        });

      // Estimate current context tokens for the dashboard
      const settings0 = useSettings.getState();
      const selectedModel = getModelInfo(settings0.selectedModelId);
      const contextLimitK = selectedModel?.contextK ?? 128;
      const allText = requestMessages.map((m) =>
        typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      ).join('');
      const estContextTokens = estimateTokens(allText) + 3000; // ~3K for system prompts
      useTokenTracker.getState().setCurrentContext(estContextTokens, contextLimitK * 1000);

      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const abortController = new AbortController();
      abortRef.current = abortController;

      // 异步执行流式请求
      (async () => {
        let contentBuf = '';
        let reasoningBuf = '';
        const toolCallsMap = new Map<string, ToolCallBlock>();
        let stallChecker: ReturnType<typeof setInterval> | null = null;

        try {
          const settings = useSettings.getState();
          const isCustom = settings.selectedModelId === CUSTOM_MODEL_ID;
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: requestMessages,
              modelId: settings.selectedModelId,
              customProvider: isCustom
                ? { baseUrl: settings.customBaseUrl, apiKey: settings.customApiKey, model: settings.customModelId }
                : undefined,
              disabledTools: settings.disabledTools,
              subjectId: chatContext.subjectId,
              categoryId: chatContext.categoryId,
              itemId: chatContext.itemId,
              currentTopic: chatContext.currentTopic,
              enableThinking,
              enableSearch,
              contextMode,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(
              `API 请求失败: ${response.status} ${response.statusText}${errorText ? ` - ${errorText.slice(0, 200)}` : ''}`,
            );
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('流读取失败');

          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          // 前端 stall 超时检测：60s 无任何 SSE 事件视为连接断开
          let lastEventTime = Date.now();
          stallChecker = setInterval(() => {
            if (Date.now() - lastEventTime > 60000) {
              abortController.abort();
            }
          }, 5000);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const { events, remaining, hadActivity } = parseSseJsonEvents<ChatSseEvent>(buffer);
            buffer = remaining;

            if (hadActivity) lastEventTime = Date.now();

            for (const event of events) {
              switch (event.type) {
                case 'content':
                  contentBuf += event.delta || event.content || '';
                  updateMessage(sessionId!, assistantId, { content: contentBuf });
                  break;

                case 'reasoning':
                  reasoningBuf += event.delta || event.content || '';
                  updateMessage(sessionId!, assistantId, {
                    reasoningContent: reasoningBuf,
                  });
                  break;

                case 'tool':
                  if (event.status === 'call') {
                    const tc: ToolCallBlock = {
                      id: event.id || Date.now().toString(),
                      name: event.name || 'unknown',
                      arguments: event.args || {},
                      status: 'running',
                    };
                    // renderInteractive 带回 artifactId/title/prompt，卡片随后独立请求 /api/artifact。
                    if (event.meta && typeof event.meta.artifactId === 'string') {
                      tc.artifactId = event.meta.artifactId;
                    }
                    if (event.name === 'renderInteractive') {
                      if (event.args?.title) tc.title = String(event.args.title);
                      if (event.args?.prompt) tc.prompt = String(event.args.prompt);
                    }
                    toolCallsMap.set(tc.id, tc);
                    updateMessage(sessionId!, assistantId, {
                      toolCalls: Array.from(toolCallsMap.values()),
                    });
                  } else if (event.status === 'result') {
                    const existing = event.id ? toolCallsMap.get(event.id) : undefined;
                    if (existing) {
                      existing.status = 'success';
                      const meta = event.meta;
                      if (meta && Array.isArray(meta.sources)) existing.sources = meta.sources;
                      if (meta && typeof meta.cacheHit === 'boolean') existing.cacheHit = meta.cacheHit;
                      if (meta && typeof meta.artifactId === 'string') existing.artifactId = meta.artifactId;
                      if (meta && Array.isArray(meta.hits)) existing.hits = meta.hits;
                      updateMessage(sessionId!, assistantId, {
                        toolCalls: Array.from(toolCallsMap.values()),
                      });
                    }
                  }
                  break;

                case 'usage':
                  if (event.usage) {
                    useTokenTracker.getState().addUsage(event.usage);
                    // Update context estimate with real prompt tokens
                    if (event.usage.promptTokens) {
                      const limit = useTokenTracker.getState().modelContextLimit;
                      useTokenTracker.getState().setCurrentContext(
                        event.usage.promptTokens + (event.usage.completionTokens ?? 0),
                        limit,
                      );
                    }
                  }
                  break;

                case 'error':
                  setError(event.message || '发生未知错误');
                  break;

                case 'done':
                  break;
              }
            }
          }

          // 流结束后提取 FollowUp 追问
          if (contentBuf) {
            try {
              const blocks = parseXmlTags(contentBuf);
              const followUpBlock = blocks.find((b) => b.tagName === 'FollowUp');
              if (followUpBlock?.childrenText) {
                const questions = followUpBlock.childrenText
                  .split('|')
                  .map((q: string) => q.trim())
                  .filter(Boolean);
                updateMessage(sessionId!, assistantId, {
                  followUpQuestions: questions,
                });
              }
            } catch {
              // FollowUp 解析失败不影响主流程
            }
          }
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            // 用户主动取消，不视为错误
          } else {
            const message =
              err instanceof Error ? err.message : '发生未知错误';
            console.error('Chat stream error:', err);
            setError(message);
          }
        } finally {
          if (stallChecker) clearInterval(stallChecker);
          loadingRef.current = false;
          setIsLoading(false);
          abortRef.current = null;
        }
      })();
    },
    [chatContext, options, createSession, addMessage, updateMessage],
  );

  return { messages, isLoading, error, sendMessage, stopGeneration, clearError };
}
