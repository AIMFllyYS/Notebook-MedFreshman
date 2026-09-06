import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { useSkills } from './useSkills';
import { getModelInfoWithCustom } from '@/lib/ai/models';
import type { ChatMessage, ChatAttachment, ChatContext, ChatOptions } from '@/lib/types/chat';
import { extractFollowUpQuestionsFromContent } from '@/lib/chat/rendering/parseChatContent';
import { createAssistantPlaceholder, createUserMessage, getAnswerText, getMessageText } from '@/lib/chat/messageParts';
import { consumeStudyStream, createStudyChatTransport } from '@/lib/chat/consumeStudyStream';
import { useTokenTracker } from './useTokenTracker';
import { useFloatingTokenTracker } from './useFloatingTokenTracker';
import { estimateTokens } from '@/lib/context/estimateTokens';
import { buildRequestMessages, SOFT_LIMIT_MAX_TURNS } from '@/lib/chat/buildRequestMessages';
import { createStreamUiThrottle } from '@/lib/chat/streamUiThrottle';
import { hydrateAttachmentsForApi } from '@/lib/storage/chatStorage';
import { buildFallbackSessionTitle, sanitizeSessionTitle } from '@/lib/chat/sessionTitle';
import { useBillingStore, createBillingRecord } from './useBillingStore';
import { useAcademicYear } from './useAcademicYear';

interface SendMessageOptions {
  quotedText?: string;
  enableThinking?: boolean;
  thinkingEffort?: 'low' | 'medium' | 'high' | 'max';
  enableSearch?: boolean;
  attachments?: ChatAttachment[];
}

const EMPTY_MESSAGES: ChatMessage[] = [];
const CONTEXT_WARNING = '上下文已达到 80% 软上限，本次请求只发送最近消息；本地聊天历史仍完整保留。';

/** IDB 水合本身不可取消，但停止后无需继续等待它；仍为原 Promise 安装拒绝处理器。 */
function hydrateForRequest(messages: ChatMessage[], signal: AbortSignal): Promise<ChatMessage[]> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason ?? new DOMException('生成被中断', 'AbortError'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    hydrateAttachmentsForApi(messages).then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

function fallbackQuestions(userQuestion: string): string[] {
  if (/解释|什么是|讲讲|说说|为什么/.test(userQuestion)) {
    return ['能举个例子说明吗？', '这个知识点考试怎么考？', '给我出一道练习题检验一下'];
  }
  if (/出题|练习|做题|题目/.test(userQuestion)) {
    return ['直接给我答案和解析吧', '这道题的考点是什么？', '再出一道类似的题'];
  }
  if (/推导|证明|公式/.test(userQuestion)) {
    return ['每一步的依据是什么？', '有没有更简单的推导方法？', '这个公式怎么记忆？'];
  }
  if (/区别|比较|对比|异同/.test(userQuestion)) {
    return ['能举个具体例子对比吗？', '它们有什么联系？', '考试容易怎么考？'];
  }
  return ['能再详细解释一下吗？', '这个知识点考试怎么考？', '给我出一道练习题'];
}

// overrides.sessionId/modelId 保证各划词浮窗拥有独立的会话、模型、计费和 token 看板。
export function useChat(
  chatContext: ChatContext,
  options?: ChatOptions,
  overrides?: { sessionId?: string; modelId?: string },
) {
  const ovSessionId = overrides?.sessionId;
  const ovModelId = overrides?.modelId;
  const resolvedSessionId = useChatHistory((s) => ovSessionId ?? s.activeSessionId);
  const messages = useChatHistory((s) => {
    const sid = ovSessionId ?? s.activeSessionId;
    return sid ? s.messagesById[sid] ?? EMPTY_MESSAGES : EMPTY_MESSAGES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearInfo = useCallback(() => setInfo(null), []);
  const stopGeneration = useCallback(() => abortRef.current?.abort(), []);

  const sendMessage = useCallback((content: string, sendOptions?: SendMessageOptions) => {
    if (!content.trim() || loadingRef.current) return false;
    const history = useChatHistory.getState();
    // IndexedDB 水合前绝不创建/覆盖会话；浮窗不允许退回主会话。
    if (!history._hasHydrated) return false;
    const existingSessionId = ovSessionId ?? history.activeSessionId;
    if (existingSessionId && !history.messagesById[existingSessionId]
      && history.sessionLoadState[existingSessionId] !== 'loaded') return false;

    // 请求全程使用发起时配置：中途切模型不能改变本轮请求或账单归属。
    const settings = useSettings.getState();
    const effectiveModelId = ovModelId ?? settings.selectedModelId;
    const model = getModelInfoWithCustom(effectiveModelId, settings.customApiGroups);
    const requestedThinking = sendOptions?.enableThinking ?? options?.enableThinking;
    const enableThinking = requestedThinking === true && model?.thinking === true;
    const thinkingEffort = enableThinking
      ? sendOptions?.thinkingEffort ?? options?.thinkingEffort ?? settings.defaultThinkingEffort : undefined;
    const enableSearch = sendOptions?.enableSearch ?? options?.enableSearch;
    const contextMode = options?.contextMode ?? 'full';
    const academicYear = chatContext.academicYear ?? useAcademicYear.getState().year;
    const skills = useSkills.getState().skills;
    const sessionId = existingSessionId ?? history.createSession(chatContext);
    const userContent = sendOptions?.quotedText
      ? `针对当前页面这段原文：\n\n> ${sendOptions.quotedText}\n\n${content}` : content;
    const userMessage = createUserMessage(crypto.randomUUID(), userContent, { attachments: sendOptions?.attachments });
    const isFirstMessage = !(useChatHistory.getState().messagesById[sessionId]?.length);
    history.addMessage(sessionId, userMessage);

    if (isFirstMessage) {
      const fallbackTitle = buildFallbackSessionTitle(userContent);
      history.updateSessionTitle(sessionId, fallbackTitle);
      void fetch('/api/chat-title', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userContent, subjectId: chatContext.subjectId,
          categoryId: chatContext.categoryId, itemId: chatContext.itemId }),
      }).then((res) => res.ok ? res.json() : null).then((payload: unknown) => {
        const title = payload && typeof payload === 'object' ? (payload as { title?: unknown }).title : undefined;
        if (typeof title === 'string') {
          useChatHistory.getState().updateSessionTitle(sessionId, sanitizeSessionTitle(title, fallbackTitle));
        }
      }).catch(() => { /* 标题失败不影响主请求；本地标题已落库。 */ });
    }

    const assistant = createAssistantPlaceholder(crypto.randomUUID(), {
      thinkingEnabled: enableThinking, searchEnabled: enableSearch, modelId: effectiveModelId,
    });
    history.addMessage(sessionId, assistant);
    const latestMessages = useChatHistory.getState().messagesById[sessionId] ?? [];
    const { messages: estimateMessages } = buildRequestMessages(latestMessages);
    const tracker = ovSessionId
      ? useFloatingTokenTracker.getState().getSession(ovSessionId) : useTokenTracker.getState();
    const fixedContextLimit = tracker.sessionContextBudgetTokens > 0
      ? tracker.sessionContextBudgetTokens : (model?.contextK ?? 128) * 1000;
    const estimatedContextTokens = tracker.serverContextTokens > 0
      ? tracker.serverContextTokens + estimateTokens(userContent)
      : estimateTokens(estimateMessages.map((m) => m.parts.map((p) =>
        p.type === 'text' ? p.text : JSON.stringify(p)).join('')).join('')) + 3000;
    const contextSoftLimitReached = fixedContextLimit > 0 && estimatedContextTokens / fixedContextLimit >= 0.8;
    if (ovSessionId) {
      useFloatingTokenTracker.getState().setCurrentContext(ovSessionId, estimatedContextTokens, fixedContextLimit);
      useFloatingTokenTracker.getState().setContextWarning(ovSessionId, contextSoftLimitReached, CONTEXT_WARNING);
    } else {
      useTokenTracker.getState().setCurrentContext(estimatedContextTokens, fixedContextLimit);
      useTokenTracker.getState().setContextWarning(contextSoftLimitReached, CONTEXT_WARNING);
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setInfo(null);
    const abortController = new AbortController();
    abortRef.current = abortController;
    void (async () => {
      let latest = assistant;
      let stallChecker: ReturnType<typeof setInterval> | undefined;
      let stalled = false;
      const throttle = createStreamUiThrottle();
      const writeUi = () => useChatHistory.getState().updateMessage(sessionId, assistant.id, {
        parts: latest.parts, metadata: latest.metadata, followUpQuestions: latest.followUpQuestions,
      });
      try {
        const hydrated = await hydrateForRequest(latestMessages, abortController.signal);
        abortController.signal.throwIfAborted();
        const { messages: requestMessages } = buildRequestMessages(hydrated, contextSoftLimitReached ? {
          maxTurns: SOFT_LIMIT_MAX_TURNS, reason: 'soft-limit', preserveAttachmentHistory: false,
        } : undefined);
        let lastActivity = Date.now();
        stallChecker = setInterval(() => {
          if (Date.now() - lastActivity > 60_000) {
            stalled = true;
            abortController.abort();
          }
        }, 5000);
        const transport = createStudyChatTransport(() => { lastActivity = Date.now(); });
        const stream = await transport.sendMessages({
          chatId: sessionId, trigger: 'submit-message', messageId: userMessage.id,
          messages: requestMessages, abortSignal: abortController.signal,
          body: {
            modelId: effectiveModelId,
            customApiGroups: settings.customApiGroups,
            customProvider: settings.customApiGroups.length === 0 && settings.customBaseUrl
              ? { baseUrl: settings.customBaseUrl, apiKey: settings.customApiKey, model: settings.customModelId } : undefined,
            defaultImageModelId: settings.defaultImageModelId,
            imageModeTextModel: settings.imageModeTextModel,
            imageModeTextModelFallback: settings.imageModeTextModelFallback,
            disabledTools: settings.disabledTools,
            subjectId: chatContext.subjectId, categoryId: chatContext.categoryId,
            itemId: chatContext.itemId, currentTopic: chatContext.currentTopic, academicYear,
            enableThinking, thinkingEffort, enableSearch, contextMode,
            contextTruncated: contextSoftLimitReached, sessionContextBudgetTokens: fixedContextLimit,
            clientContextTokens: estimatedContextTokens, globalContext: settings.globalContext, skills,
          },
        });
        await consumeStudyStream({
          stream, message: assistant, abortSignal: abortController.signal,
          onMessage(message) { latest = message; throttle.schedule(writeUi); },
          onInfo(message) { if (mountedRef.current) setInfo(message); },
          onContextBreakdown(breakdown) {
            if (ovSessionId) useFloatingTokenTracker.getState().setContextBreakdown(ovSessionId, breakdown);
            else if (useChatHistory.getState().activeSessionId === sessionId) {
              useTokenTracker.getState().setContextBreakdown(breakdown);
            }
          },
          onUsage(usage) {
            if (ovSessionId) useFloatingTokenTracker.getState().addUsage(ovSessionId, usage);
            else if (useChatHistory.getState().activeSessionId === sessionId) useTokenTracker.getState().addUsage(usage);
            useBillingStore.getState().addRecord(createBillingRecord({
              type: 'chat', modelId: effectiveModelId, sessionId,
              customGroups: settings.customApiGroups, usage,
            }));
          },
        });
        // data-followup 优先，其次兼容正文标签，最后保留本地通用追问兜底。
        const answer = getAnswerText(latest);
        if (answer && !latest.followUpQuestions?.length) {
          const extracted = extractFollowUpQuestionsFromContent(getMessageText(latest));
          latest = { ...latest, followUpQuestions: extracted.length ? extracted : fallbackQuestions(userContent) };
          throttle.schedule(writeUi);
        }
      } catch (err: unknown) {
        // 包括 SDK、fetch 及取消水合后的同名 AbortError（不依赖 DOMException realm）。
        if (stalled) {
          if (mountedRef.current) setError('连接超过 60 秒没有响应，请重试。');
        } else if (!abortController.signal.aborted
          && !(err != null && typeof err === 'object' && 'name' in err && err.name === 'AbortError')) {
          // Expected request failures belong in the accessible chat error banner;
          // console.error would also raise Next's development error overlay.
          console.warn('Chat request failed:', err instanceof Error ? err.message : '发生未知错误');
          if (mountedRef.current) setError(err instanceof Error ? err.message : '发生未知错误');
        }
      } finally {
        throttle.flush(); // 最后不足 60ms 的增量在成功、错误和停止路径都落库。
        if (stallChecker) clearInterval(stallChecker);
        loadingRef.current = false;
        if (mountedRef.current) setIsLoading(false);
        if (abortRef.current === abortController) abortRef.current = null;
      }
    })();
    // 外部自动发送队列据此确认请求确实已被接收，避免忙碌/水合门控时吞掉待发送项。
    return true;
  }, [chatContext, options, ovSessionId, ovModelId]);

  return { messages, isLoading, error, info, sendMessage, stopGeneration, clearError, clearInfo, sessionId: resolvedSessionId };
}
