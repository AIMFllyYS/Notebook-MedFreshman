// 笔记批准的旁路请求：复用当前对话前缀（history + 同一套 body 构造），
// 只在末尾追加撰写指令，不写入主 thread。

import { createAssistantPlaceholder, createUserMessage } from "@/lib/chat/messageParts";
import { buildRequestMessages } from "@/lib/chat/buildRequestMessages";
import {
  buildChatRequestBody,
  estimateContextBudget,
  executeChatRequest,
  resolveRequestSettings,
} from "@/lib/chat/sendMessage";
import { collectRequestArtifacts } from "@/lib/context/compactArtifacts";
import { useAcademicYear } from "@/lib/stores/academicYear";
import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { useBillingStore, createBillingRecord } from "@/lib/stores/billing";
import { useSettings } from "@/lib/stores/settings";
import { useSkills } from "@/lib/hooks/useSkills";
import { useStore } from "@/lib/stores/ui";
import { useTokenTracker } from "@/lib/hooks/useTokenTracker";
import type { ChatContext, ChatMessage, ChatOptions } from "@/lib/types/chat";
import { buildNoteCommitPrompt } from "@/lib/memory/noteCommitPrompt";

export interface NoteCommitSideTurn {
  persistToThread: false;
  memoryCommit: "note";
  commitPrompt: string;
  userMessage: ChatMessage;
  assistant: ChatMessage;
  latestMessages: ChatMessage[];
}

export function buildNoteCommitSideTurn(input: {
  historyMessages: readonly ChatMessage[];
  title?: string;
}): NoteCommitSideTurn {
  const commitPrompt = buildNoteCommitPrompt(input.title);
  const userMessage = createUserMessage(crypto.randomUUID(), commitPrompt);
  const assistant = createAssistantPlaceholder(crypto.randomUUID(), {});
  return {
    persistToThread: false,
    memoryCommit: "note",
    commitPrompt,
    userMessage,
    assistant,
    latestMessages: [...input.historyMessages, userMessage, assistant],
  };
}

export function currentNoteCommitChatContext(): ChatContext {
  const ui = useStore.getState();
  return {
    subjectId: ui.activeSubjectId,
    categoryId: ui.activeCategoryId,
    itemId: ui.activeItemId,
    currentTopic: `${ui.activeSubjectId} ${ui.activeCategoryId} ${ui.activeItemId}`,
    academicYear: useAcademicYear.getState().year,
  };
}

export interface RunNoteCommitInput {
  historyMessages: readonly ChatMessage[];
  title?: string;
  chatContext?: ChatContext;
  sessionId?: string;
  abortController?: AbortController;
  onWrite: (message: ChatMessage) => void;
}

export async function runNoteCommit(input: RunNoteCommitInput): Promise<ChatMessage> {
  const turn = buildNoteCommitSideTurn({
    historyMessages: input.historyMessages,
    title: input.title,
  });
  const chatContext = input.chatContext ?? currentNoteCommitChatContext();
  const settings = useSettings.getState();
  const lastAssistant = [...input.historyMessages].reverse().find((message) => message.role === "assistant");
  const options: ChatOptions = {
    enableThinking: lastAssistant?.metadata?.thinkingEnabled ?? settings.defaultThinking,
    enableSearch: lastAssistant?.metadata?.searchEnabled ?? settings.defaultSearch,
    contextMode: "full",
  };
  const resolved = resolveRequestSettings(settings, options, { memoryCommit: "note" });
  const academicYear = chatContext.academicYear ?? useAcademicYear.getState().year;
  const { messages: estimateMessages } = buildRequestMessages(turn.latestMessages);
  const tracker = useTokenTracker.getState();
  const budget = estimateContextBudget(tracker, resolved.model, estimateMessages, turn.commitPrompt);
  const sessionId = input.sessionId ?? "memory-note";
  const abortController = input.abortController ?? new AbortController();
  let latest = turn.assistant;

  await executeChatRequest({
    latestMessages: turn.latestMessages,
    abortSignal: abortController.signal,
    budget,
    body: buildChatRequestBody(
      chatContext,
      { ...settings, memoryCommit: "note" },
      resolved,
      budget,
      useSkills.getState().skills,
      academicYear,
      collectRequestArtifacts(turn.latestMessages, useArtifacts.getState()),
    ),
    sessionId,
    userMessageId: turn.userMessage.id,
    assistant: turn.assistant,
    userContent: turn.commitPrompt,
    onWrite: (message) => {
      latest = message;
      input.onWrite(message);
    },
    onInfo: () => {},
    onContextBreakdown: (breakdown) => {
      if (input.sessionId) useTokenTracker.getState().setContextBreakdown(breakdown);
    },
    onUsage: (usage) => {
      if (usage.promptTokens <= 0 && usage.completionTokens <= 0) return;
      if (input.sessionId) useTokenTracker.getState().addUsage(usage);
      useBillingStore.getState().addRecord(createBillingRecord({
        type: "chat",
        modelId: usage.actualModelId
          ?? (resolved.model?.type === "image" ? settings.imageModeTextModel : resolved.effectiveModelId),
        sessionId,
        customGroups: settings.customApiGroups,
        usage,
      }));
    },
    onStall: () => {
      abortController.abort();
    },
  });

  return latest;
}

export type NoteCommitRunner = (input: RunNoteCommitInput) => Promise<ChatMessage>;

let noteCommitRunner: NoteCommitRunner = runNoteCommit;

export function runNoteCommitWithRuntime(input: RunNoteCommitInput): Promise<ChatMessage> {
  return noteCommitRunner(input);
}

export function setNoteCommitRunnerForTests(runner: NoteCommitRunner | null): void {
  noteCommitRunner = runner ?? runNoteCommit;
}
