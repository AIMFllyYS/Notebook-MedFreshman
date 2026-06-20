import { useState, useCallback, useRef } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { useArtifacts } from './useArtifacts';
import { CUSTOM_MODEL_ID } from '@/lib/ai/models';
import type { ChatMessage, ChatContext, ChatOptions, ToolCallBlock } from '@/lib/types/chat';
import { parseXmlTags } from '@/lib/utils/xmlParser';

interface SendMessageOptions {
  quotedText?: string;
  enableThinking?: boolean;
  enableSearch?: boolean;
}

/** 解析 SSE 文本行，提取 JSON 事件 */
function parseSseLines(buffer: string): { events: any[]; remaining: string } {
  const lines = buffer.split('\n');
  const remaining = lines.pop() || '';
  const events: any[] = [];

  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') continue;
    try {
      events.push(JSON.parse(data));
    } catch {
      // 忽略解析失败的行
    }
  }
  return { events, remaining };
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
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: sendOptions?.quotedText
          ? `针对当前页面这段原文：\n\n> ${sendOptions.quotedText}\n\n${content}`
          : content,
        timestamp: Date.now(),
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

      // 构建请求消息（仅 user / assistant 角色）
      const latestSession = useChatHistory.getState().sessions.find((s) => s.id === sessionId);
      const requestMessages = (latestSession?.messages || [])
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content || '' }));

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

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const { events, remaining } = parseSseLines(buffer);
            buffer = remaining;

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
                    // renderInteractive 在 call 阶段即带回 artifactId → 消息内卡片可从一开始就流式展示
                    if (event.meta && typeof event.meta.artifactId === 'string') {
                      tc.artifactId = event.meta.artifactId;
                    }
                    toolCallsMap.set(tc.id, tc);
                    updateMessage(sessionId!, assistantId, {
                      toolCalls: Array.from(toolCallsMap.values()),
                    });
                  } else if (event.status === 'result') {
                    const existing = toolCallsMap.get(event.id);
                    if (existing) {
                      existing.status = 'success';
                      const meta = event.meta;
                      if (meta && Array.isArray(meta.sources)) existing.sources = meta.sources;
                      if (meta && typeof meta.cacheHit === 'boolean') existing.cacheHit = meta.cacheHit;
                      if (meta && typeof meta.artifactId === 'string') existing.artifactId = meta.artifactId;
                      updateMessage(sessionId!, assistantId, {
                        toolCalls: Array.from(toolCallsMap.values()),
                      });
                    }
                  }
                  break;

                case 'artifact': {
                  const a = useArtifacts.getState();
                  if (event.status === 'start') a.start(event.id, event.title || '交互演示');
                  else if (event.status === 'delta') a.append(event.id, event.delta || '');
                  else if (event.status === 'done') a.finish(event.id);
                  else if (event.status === 'error') a.fail(event.id);
                  break;
                }

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
