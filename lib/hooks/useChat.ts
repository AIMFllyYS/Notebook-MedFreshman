import { useState, useCallback, useRef } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { useSkills } from './useSkills';
import { CUSTOM_PREFIX, getModelInfoWithCustom } from '@/lib/ai/models';
import type { ChatMessage, ChatAttachment, ChatContext, ChatOptions, ToolCallBlock, WebSearchSource, ContextBreakdown } from '@/lib/types/chat';
import {
  extractFollowUpQuestionsFromContent,
  splitThinkContent,
} from '@/lib/chat/rendering/parseChatContent';
import { parseSseJsonEvents } from '@/lib/utils/sseEvents';
import { useTokenTracker } from './useTokenTracker';
import { useFloatingTokenTracker } from './useFloatingTokenTracker';
import { estimateTokens } from '@/lib/context/estimateTokens';
import { buildRequestMessages, SOFT_LIMIT_MAX_TURNS } from '@/lib/chat/buildRequestMessages';
import { createStreamUiThrottle } from '@/lib/chat/streamUiThrottle';
import { hydrateAttachmentsForApi } from '@/lib/storage/chatStorage';
import { buildFallbackSessionTitle, sanitizeSessionTitle } from '@/lib/chat/sessionTitle';
import { useBillingStore, createBillingRecord } from './useBillingStore';
import { useFloatingChats } from './useFloatingChats';

interface SendMessageOptions {
  quotedText?: string;
  enableThinking?: boolean;
  thinkingEffort?: 'low' | 'medium' | 'high' | 'max';
  enableSearch?: boolean;
  attachments?: ChatAttachment[];
}

interface ChatSseEvent {
  type?: string;
  delta?: string;
  content?: string;
  questions?: string[];
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
    artifactModelId?: unknown;
    artifactUnsupportedReason?: unknown;
    imageGenId?: unknown;
    imageModelId?: unknown;
    sources?: WebSearchSource[];
    cacheHit?: unknown;
    hits?: { title: string; path: string; snippet: string }[];
    skill?: unknown;
  };
}

// overrides 让划词浮窗复用同一套流式引擎：
//  - sessionId：读写指定会话（而非全局 activeSessionId），实现每窗独立且持久化的对话；
//  - modelId：该窗自选模型（不改全局选择）。
// 传 overrides.sessionId 时，本 hook 不向全局 token 看板写入（避免多窗/主面板互相污染）。
export function useChat(
  chatContext: ChatContext,
  options?: ChatOptions,
  overrides?: { sessionId?: string; modelId?: string },
) {
  const ovSessionId = overrides?.sessionId;
  const ovModelId = overrides?.modelId;
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const createSession = useChatHistory((s) => s.createSession);
  const addMessage = useChatHistory((s) => s.addMessage);
  const updateMessage = useChatHistory((s) => s.updateMessage);
  const updateSessionTitle = useChatHistory((s) => s.updateSessionTitle);

  const resolvedSessionId = ovSessionId ?? activeSessionId;
  const messages = useChatHistory(
    (s) => {
      const sid = ovSessionId ?? s.activeSessionId;
      if (!sid) return undefined;
      return s.messagesById[sid];
    }
  ) ?? [];

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
      if (!useChatHistory.getState()._hasHydrated) return;
      const st = useChatHistory.getState();
      const sid = ovSessionId ?? st.activeSessionId;
      if (sid && !st.messagesById[sid] && st.sessionLoadState[sid] !== 'loaded') return;

      // 该次请求使用的模型：划词窗传入 ovModelId，否则用全局选择。
      const effectiveModelId = ovModelId ?? useSettings.getState().selectedModelId;
      const effectiveModelInfo = getModelInfoWithCustom(effectiveModelId, useSettings.getState().customApiGroups);

      // 合并 per-message 与 chat-level 选项；thinking 还要受当前模型能力约束。
      const requestedThinking = sendOptions?.enableThinking ?? options?.enableThinking;
      const enableThinking = requestedThinking === true && effectiveModelInfo?.thinking === true;
      const thinkingEffort = enableThinking
        ? (sendOptions?.thinkingEffort ?? useSettings.getState().defaultThinkingEffort)
        : undefined;
      const enableSearch = sendOptions?.enableSearch ?? options?.enableSearch;
      const contextMode = options?.contextMode ?? 'full';

      // 获取或创建会话（划词窗已自带 ovSessionId，绝不在此新建主会话）
      const state = useChatHistory.getState();
      let sessionId = ovSessionId ?? state.activeSessionId;
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

      // 首条消息发送后后台生成标题；主对话和划词浮窗共用同一套轻量标题机制。
      const currentMessages = useChatHistory.getState().messagesById[sessionId!];
      const isFirstMessage = !currentMessages || currentMessages.length === 0;
      const fallbackTitle = isFirstMessage ? buildFallbackSessionTitle(userContent) : undefined;

      addMessage(sessionId, userMessage);

      if (fallbackTitle) {
        updateSessionTitle(sessionId, fallbackTitle);
        void fetch('/api/chat-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: userContent,
            subjectId: chatContext.subjectId,
            categoryId: chatContext.categoryId,
            itemId: chatContext.itemId,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((payload: unknown) => {
            if (!payload || typeof payload !== 'object') return;
            const title = (payload as { title?: unknown }).title;
            if (typeof title !== 'string') return;
            useChatHistory.getState().updateSessionTitle(sessionId!, sanitizeSessionTitle(title, fallbackTitle));
          })
          .catch(() => {
            // 标题生成失败不影响主对话；fallback 已经落库。
          });
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
      const latestMessages = useChatHistory.getState().messagesById[sessionId!] ?? [];
      const { messages: requestMessagesForEstimate } = buildRequestMessages(latestMessages);
      const requestSourceMessagesPromise = hydrateAttachmentsForApi(latestMessages);

      const selectedModel = getModelInfoWithCustom(effectiveModelId, useSettings.getState().customApiGroups);
      const selectedModelLimit = (selectedModel?.contextK ?? 128) * 1000;
      const trackerSnapshot = ovSessionId
        ? useFloatingTokenTracker.getState().getSession(ovSessionId)
        : useTokenTracker.getState();
      const fixedContextLimit =
        trackerSnapshot.sessionContextBudgetTokens > 0
          ? trackerSnapshot.sessionContextBudgetTokens
          : selectedModelLimit;
      const serverCtx = trackerSnapshot.serverContextTokens;
      const estimatedContextTokens = serverCtx > 0
        ? serverCtx + estimateTokens(typeof userMessage.content === 'string'
          ? userMessage.content
          : JSON.stringify(userMessage.content ?? ''))
        : estimateTokens(requestMessagesForEstimate.map((m) =>
          typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        ).join('')) + 3000;
      const contextSoftLimitReached =
        fixedContextLimit > 0 && estimatedContextTokens / fixedContextLimit >= 0.8;
      const contextWarning = contextSoftLimitReached
        ? '上下文已达到 80% 软上限，本次请求只发送最近消息；本地聊天历史仍完整保留。'
        : null;
      if (ovSessionId) {
        useFloatingTokenTracker.getState().setCurrentContext(ovSessionId, estimatedContextTokens, fixedContextLimit);
        useFloatingTokenTracker.getState().setContextWarning(ovSessionId, contextSoftLimitReached, contextWarning);
      } else {
        useTokenTracker.getState().setCurrentContext(estimatedContextTokens, fixedContextLimit);
        useTokenTracker.getState().setContextWarning(contextSoftLimitReached, contextWarning);
      }

      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const abortController = new AbortController();
      abortRef.current = abortController;

      // 异步执行流式请求
      (async () => {
        let contentBuf = '';
        let reasoningBuf = '';
        let followUpQuestionsFromStream: string[] = [];
        const toolCallsMap = new Map<string, ToolCallBlock>();
        let stallChecker: ReturnType<typeof setInterval> | null = null;

        const uiThrottle = createStreamUiThrottle();
        const writeUi = () => {
          // contentBuf 是上游原始增量的累积（可能混有 <think> 标签）；每次刷新都重新拆分，
          // 让内嵌在正文里的思考内容也能像独立 reasoning_content 字段一样实时进思考面板，
          // 而不是等 </think> 闭合后才一次性甩出来。
          const { content: visibleContent, reasoning: pseudoReasoning } = splitThinkContent(contentBuf, {
            streaming: true,
          });
          const mergedReasoning = [reasoningBuf.trim(), pseudoReasoning].filter(Boolean).join('\n\n');
          updateMessage(sessionId!, assistantId, {
            content: visibleContent,
            reasoningContent: mergedReasoning,
            ...(toolCallsMap.size > 0 ? { toolCalls: Array.from(toolCallsMap.values()) } : {}),
          });
        };
        const scheduleUi = () => uiThrottle.schedule(writeUi);
        const flushUiNow = () => {
          uiThrottle.flush();
        };

        try {
          const settings = useSettings.getState();
          const requestSourceMessages = await requestSourceMessagesPromise;
          const { messages: hydratedMessages } = contextSoftLimitReached
            ? buildRequestMessages(requestSourceMessages, {
                maxTurns: SOFT_LIMIT_MAX_TURNS,
                reason: 'soft-limit',
                preserveAttachmentHistory: false,
              })
            : buildRequestMessages(requestSourceMessages);
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: hydratedMessages,
              modelId: effectiveModelId,
              customApiGroups: settings.customApiGroups,
              defaultImageModelId: settings.defaultImageModelId,
              imageModeTextModel: settings.imageModeTextModel,
              imageModeTextModelFallback: settings.imageModeTextModelFallback,
              disabledTools: settings.disabledTools,
              subjectId: chatContext.subjectId,
              categoryId: chatContext.categoryId,
              itemId: chatContext.itemId,
              currentTopic: chatContext.currentTopic,
              enableThinking,
              thinkingEffort,
              enableSearch,
              contextMode,
              contextTruncated: contextSoftLimitReached,
              sessionContextBudgetTokens: fixedContextLimit,
              clientContextTokens: estimatedContextTokens,
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
                    if (event.meta && typeof event.meta.artifactModelId === 'string') {
                      tc.artifactModelId = event.meta.artifactModelId;
                    }
                    if (event.meta && typeof event.meta.artifactUnsupportedReason === 'string') {
                      tc.artifactUnsupportedReason = event.meta.artifactUnsupportedReason;
                    }
                    if (event.name === 'renderInteractive') {
                      if (event.args?.title) tc.title = String(event.args.title);
                      if (event.args?.prompt) tc.prompt = String(event.args.prompt);
                    }
                    // generateImage 带回 imageGenId 和参数，卡片展示批准 UI，批准后独立请求 /api/image-gen。
                    if (event.meta && typeof event.meta.imageGenId === 'string') {
                      tc.imageGenId = event.meta.imageGenId;
                    }
                    if (event.meta && typeof event.meta.imageModelId === 'string') {
                      tc.imageModelId = event.meta.imageModelId;
                    }
                    if (event.name === 'generateImage') {
                      if (event.args?.title) tc.imageGenTitle = String(event.args.title);
                      if (event.args?.prompt) tc.imageGenPrompt = String(event.args.prompt);
                      if (event.args?.size) tc.imageGenSize = String(event.args.size);
                      if (event.args?.count) tc.imageGenCount = Number(event.args.count);
                    }
                    toolCallsMap.set(tc.id, tc);
                    scheduleUi();
                  } else if (event.status === 'result') {
                    const existing = event.id ? toolCallsMap.get(event.id) : undefined;
                    if (existing) {
                      existing.status = 'success';
                      const meta = event.meta;
                      if (meta && Array.isArray(meta.sources)) existing.sources = meta.sources;
                      if (meta && typeof meta.cacheHit === 'boolean') existing.cacheHit = meta.cacheHit;
                      if (meta && typeof meta.artifactId === 'string') existing.artifactId = meta.artifactId;
                      if (meta && typeof meta.artifactModelId === 'string') existing.artifactModelId = meta.artifactModelId;
                      if (meta && typeof meta.artifactUnsupportedReason === 'string') existing.artifactUnsupportedReason = meta.artifactUnsupportedReason;
                      if (meta && typeof meta.imageGenId === 'string') existing.imageGenId = meta.imageGenId;
                      if (meta && typeof meta.imageModelId === 'string') existing.imageModelId = meta.imageModelId;
                      if (meta && Array.isArray(meta.hits)) existing.hits = meta.hits;
                      if (meta && typeof meta.skill === 'string') existing.skill = meta.skill;
                      scheduleUi();
                    }
                  }
                  break;

                case 'context_breakdown':
                  if (event.breakdown) {
                    if (ovSessionId) {
                      useFloatingTokenTracker.getState().setContextBreakdown(ovSessionId, event.breakdown);
                    } else {
                      useTokenTracker.getState().setContextBreakdown(event.breakdown);
                    }
                  }
                  break;

                case 'usage':
                  if (event.usage) {
                    const settings = useSettings.getState();
                    if (ovSessionId) {
                      useFloatingTokenTracker.getState().addUsage(ovSessionId, event.usage);

                      // 记录计费
                      const fState = useFloatingChats.getState();
                      const chatModelId = fState.windows.find((c: any) => c.sessionId === ovSessionId)?.modelId || settings.selectedModelId;
                      useBillingStore.getState().addRecord(createBillingRecord({
                        type: 'chat',
                        modelId: chatModelId,
                        sessionId: ovSessionId,
                        customGroups: settings.customApiGroups,
                        usage: {
                          promptTokens: event.usage.promptTokens ?? 0,
                          completionTokens: event.usage.completionTokens ?? 0,
                          cachedTokens: event.usage.cachedTokens ?? 0,
                          totalTokens: event.usage.totalTokens ?? 0
                        }
                      }));
                    } else {
                      useTokenTracker.getState().addUsage(event.usage);

                      // 记录计费
                      useBillingStore.getState().addRecord(createBillingRecord({
                        type: 'chat',
                        modelId: settings.selectedModelId,
                        sessionId: sessionId!,
                        customGroups: settings.customApiGroups,
                        usage: {
                          promptTokens: event.usage.promptTokens ?? 0,
                          completionTokens: event.usage.completionTokens ?? 0,
                          cachedTokens: event.usage.cachedTokens ?? 0,
                          totalTokens: event.usage.totalTokens ?? 0
                        }
                      }));
                    }
                  }
                  break;

                case 'followup': {
                  const questions = Array.isArray(event.questions)
                    ? event.questions.map((q) => String(q).trim()).filter(Boolean).slice(0, 3)
                    : [];
                  if (questions.length > 0) {
                    followUpQuestionsFromStream = questions;
                    updateMessage(sessionId!, assistantId, {
                      followUpQuestions: questions,
                    });
                  }
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

          // 流正常结束：落定最后一帧（节流可能还压着一次未刷新的更新）
          flushUiNow();

          const { content: finalContent, reasoning: pseudoReasoning } = splitThinkContent(contentBuf, {
            streaming: false,
          });
          if (pseudoReasoning) {
            contentBuf = finalContent;
            reasoningBuf = [reasoningBuf.trim(), pseudoReasoning].filter(Boolean).join('\n\n');
            updateMessage(sessionId!, assistantId, {
              content: contentBuf,
              reasoningContent: reasoningBuf,
            });
          }

          // 流结束后提取 FollowUp 追问
          if (contentBuf) {
            try {
              let questions: string[] = followUpQuestionsFromStream;
              // 兼容旧模型输出：正文里已有 <FollowUp> 时只提取 metadata，不依赖正文渲染。
              if (questions.length === 0) {
                questions = extractFollowUpQuestionsFromContent(contentBuf);
              }
              // 前端兜底：服务端和模型都没生成 FollowUp 时，根据用户提问生成通用追问
              if (questions.length === 0) {
                const lastUser = requestMessagesForEstimate.filter((m) => m.role === 'user').pop();
                const userQ = typeof lastUser?.content === 'string'
                  ? lastUser.content
                  : Array.isArray(lastUser?.content)
                    ? lastUser!.content.filter((p) => p.type === 'text').map((p) => (p as { text?: string }).text ?? '').join(' ')
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
    [chatContext, options, ovSessionId, ovModelId, createSession, addMessage, updateMessage, updateSessionTitle],
  );

  return { messages, isLoading, error, sendMessage, stopGeneration, clearError, sessionId: resolvedSessionId };
}
