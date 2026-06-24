import { useState, useCallback, useRef } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { useSkills } from './useSkills';
import { CUSTOM_MODEL_ID } from '@/lib/ai/models';
import type { ChatMessage, ChatAttachment, ChatContext, ChatOptions, ToolCallBlock, WebSearchSource, ContextBreakdown } from '@/lib/types/chat';
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
  breakdown?: ContextBreakdown;
  meta?: {
    artifactId?: unknown;
    sources?: WebSearchSource[];
    cacheHit?: unknown;
    hits?: { title: string; path: string; snippet: string }[];
    skill?: unknown;
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

        // 流式 UI 节流：把每 token 的 updateMessage 合并为 ~60ms 一次（尾随节流）。
        // 既减少重渲染（markdown/KaTeX 全量重解析），又降低 persist 写盘触发频率；
        // 配合 idbStorage 写防抖，把流式 O(n²) 降到 ~O(n)。流结束/中断时强制落定最后一帧。
        const UI_THROTTLE_MS = 60;
        let uiTimer: ReturnType<typeof setTimeout> | null = null;
        const writeUi = () => {
          updateMessage(sessionId!, assistantId, { content: contentBuf, reasoningContent: reasoningBuf });
        };
        const scheduleUi = () => {
          if (uiTimer) return;
          uiTimer = setTimeout(() => {
            uiTimer = null;
            writeUi();
          }, UI_THROTTLE_MS);
        };
        const flushUiNow = () => {
          if (uiTimer) {
            clearTimeout(uiTimer);
            uiTimer = null;
          }
          writeUi();
        };

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
              globalContext: settings.globalContext,
              skills: useSkills.getState().skills,
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
                  scheduleUi();
                  break;

                case 'reasoning':
                  reasoningBuf += event.delta || event.content || '';
                  scheduleUi();
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
                      if (meta && typeof meta.skill === 'string') existing.skill = meta.skill;
                      updateMessage(sessionId!, assistantId, {
                        toolCalls: Array.from(toolCallsMap.values()),
                      });
                    }
                  }
                  break;

                case 'context_breakdown':
                  if (event.breakdown) {
                    useTokenTracker.getState().setContextBreakdown(event.breakdown);
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

          // 流正常结束：落定最后一帧（节流可能还压着一次未刷新的更新）
          flushUiNow();

          // 流结束后提取 FollowUp 追问
          if (contentBuf) {
            try {
              let questions: string[] = [];
              // 优先用 parseXmlTags（处理大小写归一化）
              const blocks = parseXmlTags(contentBuf);
              const followUpBlock = blocks.find((b) => b.tagName === 'FollowUp');
              if (followUpBlock?.childrenText) {
                questions = followUpBlock.childrenText
                  .split('|')
                  .map((q: string) => q.trim())
                  .filter(Boolean);
              }
              // 兜底：正则直接提取（parseXmlTags 可能因标签格式偏差未匹配）
              if (questions.length === 0) {
                const m = contentBuf.match(/<FollowUp>([\s\S]*?)<\/FollowUp>/i);
                if (m) {
                  questions = m[1].split('|').map((q) => q.trim()).filter(Boolean);
                }
              }
              // 前端兜底：服务端和模型都没生成 FollowUp 时，根据用户提问生成通用追问
              if (questions.length === 0) {
                const lastUser = requestMessages.filter((m) => m.role === 'user').pop();
                const userQ = typeof lastUser?.content === 'string'
                  ? lastUser.content
                  : Array.isArray(lastUser?.content)
                    ? lastUser!.content.filter((p) => p.type === 'text').map((p: any) => p.text).join(' ')
                    : '';
                // 根据用户提问类型生成针对性追问
                if (/解释|什么是|讲讲|说说|为什么/.test(userQ)) {
                  questions = ['能举个例子说明吗？', '这个知识点考试怎么考？', '给我出一道练习题检验一下'];
                } else if (/出题|练习|做题|题目/.test(userQ)) {
                  questions = ['直接给我答案和解析吧', '这道题的考点是什么？', '再出一道类似的题'];
                } else if (/推导|证明|公式/.test(userQ)) {
                  questions = ['每一步的依据是什么？', '有没有更简单的推导方法？', '这个公式怎么记忆？'];
                } else if (/区别|比较|对比|异同/.test(userQ)) {
                  questions = ['能举个具体例子对比吗？', '它们有什么联系？', '考试容易怎么考？'];
                } else {
                  questions = ['能再详细解释一下吗？', '这个知识点考试怎么考？', '给我出一道练习题'];
                }
              }
              if (questions.length > 0) {
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
          flushUiNow(); // 错误/中断路径也落定已流式的内容，避免丢字
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
