import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatHistory } from './useChatHistory';
import { useSettings } from './useSettings';
import { useSkills } from './useSkills';
import { useTokenTracker } from './useTokenTracker';
import { useFloatingTokenTracker } from './useFloatingTokenTracker';
import { useBillingStore, createBillingRecord } from './useBillingStore';
import { useAcademicYear } from './useAcademicYear';
import { AUTO_MODEL_ID } from '@/lib/ai/models';
import { useArtifacts } from './useArtifacts';
import { collectRequestArtifacts } from '@/lib/context/compactArtifacts';
import type { ChatMessage, ChatContext, ChatOptions } from '@/lib/types/chat';
import { createAssistantPlaceholder, createUserMessage } from '@/lib/chat/messageParts';
import { buildRequestMessages } from '@/lib/chat/buildRequestMessages';
import {
  canSendNow, resolveRequestSettings, estimateContextBudget, displayContextTokens, CONTEXT_WARNING,
  buildChatRequestBody, kickoffSessionTitle, classifySendError, executeChatRequest,
  type SendMessageOptions,
} from '@/lib/chat/sendMessage';
import { selectEditingUserNote } from '@/lib/notes/selectEditingNote';
import { collectFlashcardCatalog, collectUserNoteCatalog } from '@/lib/ai/agent/tools/memoryCatalog';
import { useUserNotes } from '@/lib/stores/userNotes';
import { useReviewCards } from '@/lib/stores/reviewCards';
import { useProjectFiles, listProjectFiles } from '@/lib/stores/projectFiles';
import type { StallReason } from '@/lib/chat/createStallWatchdog';
import { buildProjectCatalog, buildProjectSliceBodies, planCarry, withRememberedSlices } from '@/lib/project/catalog';
import { collectReadSliceIds } from '@/lib/project/sessionSlices';
import { useReincludedAttachments } from '@/lib/stores/reincludedAttachments';

const EMPTY_MESSAGES: ChatMessage[] = [];
export function useChat(chatContext: ChatContext, options?: ChatOptions, overrides?: {
  sessionId?: string;
  modelId?: string;
  /** 窗内笔记对话锁定这篇笔记；主对话不传，仍读 cite 写入的 agentEditingNoteId。 */
  editingUserNoteId?: string;
}) {
  const ovSessionId = overrides?.sessionId;
  const ovModelId = overrides?.modelId;
  const ovEditingUserNoteId = overrides?.editingUserNoteId;
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
      }, resolved.effectiveModelId === AUTO_MODEL_ID));
    }
    const assistant = createAssistantPlaceholder(crypto.randomUUID(), {
      thinkingEnabled: resolved.enableThinking, searchEnabled: resolved.enableSearch, modelId: resolved.effectiveModelId,
    });
    history.addMessage(sessionId, assistant);
    const storedLatestMessages = useChatHistory.getState().messagesById[sessionId] ?? [];
    // addMessage immediately replaces large inline attachments with IndexedDB refs.
    // Keep this turn's original in-memory payload for the request so a just-started
    // blob write can never race the following hydration read.
    const latestMessages = storedLatestMessages.map((entry) => entry.id === userMessage.id ? userMessage : entry);
    const { messages: estimateMessages } = buildRequestMessages(latestMessages);
    const tracker = ovSessionId
      ? useFloatingTokenTracker.getState().getSession(ovSessionId) : useTokenTracker.getState();
    const budget = estimateContextBudget(tracker, resolved.model, estimateMessages, userContent);
    const ringTokens = displayContextTokens(tracker, budget);
    if (ovSessionId) {
      const floating = useFloatingTokenTracker.getState();
      floating.setCurrentContext(ovSessionId, ringTokens, budget.limit);
      floating.setContextWarning(ovSessionId, budget.softLimitReached, CONTEXT_WARNING);
    } else {
      const tokens = useTokenTracker.getState();
      tokens.setCurrentContext(ringTokens, budget.limit);
      tokens.setContextWarning(budget.softLimitReached, CONTEXT_WARNING);
    }
    loadingRef.current = true; setIsLoading(true); setError(null); setInfo(null);
    const abortController = new AbortController(); abortRef.current = abortController;
    const isNoteWindow = Boolean(ovEditingUserNoteId);
    const notesState = useUserNotes.getState();
    const cardsState = useReviewCards.getState();
    const userNotes = isNoteWindow
      ? []
      : collectUserNoteCatalog(notesState.order.map((id) => notesState.byId[id]).filter(Boolean));
    const flashcards = isNoteWindow
      ? []
      : collectFlashcardCatalog(cardsState.order.map((id) => cardsState.byId[id]).filter(Boolean));
    // 项目文件：主对话才带。归属看**会话自己所在的项目**（folderId），不是侧栏当前选中的那个——
    // 否则从历史里打开一条旧对话继续聊，会突然带上另一个项目的文件（会话"换户口"）。
    // 会话还没归到任何项目时才回落到当前选中项目。
    const historySnapshot = useChatHistory.getState();
    const sessionMeta = historySnapshot.sessionsMeta.find((meta) => meta.id === sessionId);
    const sessionProjectId = isNoteWindow
      ? null
      : sessionMeta?.folderId ?? historySnapshot.activeProjectId;
    const projectFileList = sessionProjectId
      ? listProjectFiles(useProjectFiles.getState(), sessionProjectId)
      : [];
    // 目录（索引）永远带；正文按携带计划带：项目不大默认全带，超预算才带勾选 + 本会话读过的片。
    const carryPlan = withRememberedSlices(
      planCarry(projectFileList, sessionProjectId ?? undefined),
      sessionMeta?.readSliceIds ?? [],
    );
    const projectFiles = sessionProjectId
      ? buildProjectCatalog(projectFileList, sessionProjectId).files
      : [];
    const projectSlices = sessionProjectId
      ? buildProjectSliceBodies(projectFileList, carryPlan, sessionProjectId).payloads
      : [];
    void (async () => {
      // null = 未触发；否则记录是哪种超时，用来给不同文案。
      let stalled: StallReason | null = null;
      try {
        await executeChatRequest({
          latestMessages, abortSignal: abortController.signal, budget,
          body: buildChatRequestBody(
            chatContext,
            {
              ...settings,
              memoryCommit: sendOptions?.memoryCommit,
              editingUserNote: selectEditingUserNote(ovEditingUserNoteId) ?? undefined,
              noteWindowAgent: isNoteWindow,
              userNotes,
              flashcards,
              projectFiles,
              projectSlices,
              maxToolRounds: settings.maxToolRounds,
              planMode: sendOptions?.planMode,
              forcedTool: sendOptions?.forcedTool,
              attachedFiles: sendOptions?.attachedFiles,
            },
            resolved,
            budget,
            skills,
            academicYear,
            collectRequestArtifacts(latestMessages, useArtifacts.getState()),
          ),
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
            if (usage.promptTokens <= 0 && usage.completionTokens <= 0) return;
            if (ovSessionId) useFloatingTokenTracker.getState().addUsage(ovSessionId, usage);
            else if (useChatHistory.getState().activeSessionId === sessionId) useTokenTracker.getState().addUsage(usage);
            useBillingStore.getState().addRecord(createBillingRecord({
              type: 'chat',
              modelId: usage.actualModelId
                ?? (resolved.model?.type === 'image' ? settings.imageModeTextModel : resolved.effectiveModelId),
              sessionId,
              customGroups: settings.customApiGroups, usage,
            }));
          },
          onStall: (reason) => { stalled = reason; abortController.abort(); },
          maxWaitMs: settings.maxWaitMs,
          // 「重新带入本轮」是一次性意图：在这里消费掉，成败都不留痕。
          reincludedMessageIds: useReincludedAttachments.getState().takeForRequest(sessionId),
        });
        // 记住这一轮真读到的项目切片：项目超预算后携带计划只带勾选/已读的片，
        // 不回填的话模型第 3 轮读得到的东西第 5 轮就"找不着了"。
        const finished = useChatHistory.getState().messagesById[sessionId]
          ?.find((message) => message.id === assistant.id);
        const readSliceIds = collectReadSliceIds(finished?.parts);
        if (readSliceIds.length > 0) useChatHistory.getState().rememberReadSlices(sessionId, readSliceIds);
      } catch (err: unknown) {
        const message = classifySendError(err, {
          stalled: stalled ?? false,
          aborted: abortController.signal.aborted,
          maxWaitMs: settings.maxWaitMs,
        });
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
  }, [chatContext, options, ovSessionId, ovModelId, ovEditingUserNoteId]);
  return { messages, isLoading, error, info, sendMessage, stopGeneration, clearError, clearInfo, sessionId: resolvedSessionId };
}
