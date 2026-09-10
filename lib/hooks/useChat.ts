import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { useSkills } from './useSkills';
import { useTokenTracker } from './useTokenTracker';
import { useFloatingTokenTracker } from './useFloatingTokenTracker';
import { useBillingStore, createBillingRecord } from './useBillingStore';
import { useAcademicYear } from './useAcademicYear';
import type { ChatMessage, ChatContext, ChatOptions } from '@/lib/types/chat';
import { createAssistantPlaceholder, createUserMessage } from '@/lib/chat/messageParts';
import { buildRequestMessages } from '@/lib/chat/buildRequestMessages';
import {
  canSendNow, resolveRequestSettings, estimateContextBudget, CONTEXT_WARNING,
  buildChatRequestBody, kickoffSessionTitle, classifySendError, executeChatRequest,
  type SendMessageOptions,
} from '@/lib/chat/sendMessage';

const EMPTY_MESSAGES: ChatMessage[] = [];
export function useChat(chatContext: ChatContext, options?: ChatOptions, overrides?: { sessionId?: string; modelId?: string }) {
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
    return () => { mountedRef.current = false; abortRef.current?.abort(); };
  }, []);
  const clearError = useCallback(() => setError(null), []);
  const clearInfo = useCallback(() => setInfo(null), []);
  const stopGeneration = useCallback(() => abortRef.current?.abort(), []);
  const sendMessage = useCallback((content: string, sendOptions?: SendMessageOptions) => {
    if (!content.trim() || loadingRef.current) return false;
    const history = useChatHistory.getState();
    if (!canSendNow(history, ovSessionId)) return false;
    const settings = useSettings.getState();
    const resolved = resolveRequestSettings(settings, options, sendOptions, ovModelId);
    const academicYear = chatContext.academicYear ?? useAcademicYear.getState().year;
    const skills = useSkills.getState().skills;
    const sessionId = (ovSessionId ?? history.activeSessionId) ?? history.createSession(chatContext);
    const userContent = sendOptions?.quotedText
      ? `针对当前页面这段原文：\n\n> ${sendOptions.quotedText}\n\n${content}` : content;
    const userMessage = createUserMessage(crypto.randomUUID(), userContent, { attachments: sendOptions?.attachments });
    const isFirstMessage = !(useChatHistory.getState().messagesById[sessionId]?.length);
    history.addMessage(sessionId, userMessage);
    if (isFirstMessage) {
      history.updateSessionTitle(sessionId, kickoffSessionTitle(sessionId, userContent, chatContext, (id, title) => {
        useChatHistory.getState().updateSessionTitle(id, title);
      }));
    }
    const assistant = createAssistantPlaceholder(crypto.randomUUID(), {
      thinkingEnabled: resolved.enableThinking, searchEnabled: resolved.enableSearch, modelId: resolved.effectiveModelId,
    });
    history.addMessage(sessionId, assistant);
    const latestMessages = useChatHistory.getState().messagesById[sessionId] ?? [];
    const { messages: estimateMessages } = buildRequestMessages(latestMessages);
    const tracker = ovSessionId
      ? useFloatingTokenTracker.getState().getSession(ovSessionId) : useTokenTracker.getState();
    const budget = estimateContextBudget(tracker, resolved.model, estimateMessages, userContent);
    if (ovSessionId) {
      const floating = useFloatingTokenTracker.getState();
      floating.setCurrentContext(ovSessionId, budget.estimated, budget.limit);
      floating.setContextWarning(ovSessionId, budget.softLimitReached, CONTEXT_WARNING);
    } else {
      const tokens = useTokenTracker.getState();
      tokens.setCurrentContext(budget.estimated, budget.limit);
      tokens.setContextWarning(budget.softLimitReached, CONTEXT_WARNING);
    }
    loadingRef.current = true; setIsLoading(true); setError(null); setInfo(null);
    const abortController = new AbortController(); abortRef.current = abortController;
    void (async () => {
      let stalled = false;
      try {
        await executeChatRequest({
          latestMessages, abortSignal: abortController.signal, budget,
          body: buildChatRequestBody(chatContext, settings, resolved, budget, skills, academicYear),
          sessionId, userMessageId: userMessage.id, assistant, userContent,
          onWrite: (message) => useChatHistory.getState().updateMessage(sessionId, assistant.id, {
            parts: message.parts, metadata: message.metadata, followUpQuestions: message.followUpQuestions,
          }),
          onInfo: (message) => { if (mountedRef.current) setInfo(message); },
          onContextBreakdown: (breakdown) => {
            if (ovSessionId) useFloatingTokenTracker.getState().setContextBreakdown(ovSessionId, breakdown);
            else if (useChatHistory.getState().activeSessionId === sessionId) useTokenTracker.getState().setContextBreakdown(breakdown);
          },
          onUsage: (usage) => {
            if (ovSessionId) useFloatingTokenTracker.getState().addUsage(ovSessionId, usage);
            else if (useChatHistory.getState().activeSessionId === sessionId) useTokenTracker.getState().addUsage(usage);
            useBillingStore.getState().addRecord(createBillingRecord({
              type: 'chat', modelId: resolved.effectiveModelId, sessionId,
              customGroups: settings.customApiGroups, usage,
            }));
          },
          onStall: () => { stalled = true; abortController.abort(); },
        });
      } catch (err: unknown) {
        const message = classifySendError(err, { stalled, aborted: abortController.signal.aborted });
        if (message) {
          if (!stalled) console.warn('Chat request failed:', message);
          if (mountedRef.current) setError(message);
        }
      } finally {
        loadingRef.current = false;
        if (mountedRef.current) setIsLoading(false);
        if (abortRef.current === abortController) abortRef.current = null;
      }
    })();
    return true;
  }, [chatContext, options, ovSessionId, ovModelId]);
  return { messages, isLoading, error, info, sendMessage, stopGeneration, clearError, clearInfo, sessionId: resolvedSessionId };
}
