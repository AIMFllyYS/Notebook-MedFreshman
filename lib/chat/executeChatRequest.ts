import { consumeStudyStream, createStudyChatTransport } from "@/lib/chat/consumeStudyStream";
import { buildRequestMessages, MAX_REQUEST_MESSAGES } from "@/lib/chat/buildRequestMessages";
import { createStreamUiThrottle } from "@/lib/chat/streamUiThrottle";
import { flushPendingWrites } from "@/lib/storage/idbStorage";
import { notifyAccountUsageChanged } from "@/lib/billing/quotaView";
import { createStallWatchdog } from "@/lib/chat/createStallWatchdog";
import { hydrateForRequest, lastUserMessageId } from "@/lib/chat/hydrateForRequest";
import { resolveFollowUps } from "@/lib/chat/resolveFollowUps";
import { fitChatRequest } from "@/lib/chat/requestBudget";
import { slimSkillsForRequest } from "@/lib/chat/slimSkills";
import { scheduleCloudUpsert } from "@/lib/sync/schedule";
import { markSessionStreaming } from "@/lib/sync/streamingSessions";
import type { ChatRequestBody } from "@/lib/chat/buildChatRequestBody";
import type { ContextBudget } from "@/lib/chat/estimateContextBudget";
import type { ChatMessage, ContextBreakdown, UsageSummary } from "@/lib/types/chat";

export async function executeChatRequest(input: {
  latestMessages: ChatMessage[];
  abortSignal: AbortSignal;
  budget: ContextBudget;
  body: ChatRequestBody;
  sessionId: string;
  userMessageId: string;
  assistant: ChatMessage;
  userContent: string;
  onWrite: (message: ChatMessage) => void;
  onInfo: (message: string) => void;
  onContextBreakdown: (breakdown: ContextBreakdown) => void;
  onUsage: (usage: UsageSummary) => void;
  onStall: () => void;
}): Promise<void> {
  let latest = input.assistant;
  const throttle = createStreamUiThrottle();
  const writeUi = () => input.onWrite(latest);
  let watchdog: ReturnType<typeof createStallWatchdog> | undefined;
  markSessionStreaming(input.sessionId, true);
  try {
    const hydrateIds = lastUserMessageId(input.latestMessages);
    const hydrated = await hydrateForRequest(
      input.latestMessages,
      input.abortSignal,
      hydrateIds ? { messageIds: new Set([hydrateIds]) } : undefined,
    );
    input.abortSignal.throwIfAborted();
    const { messages: built } = buildRequestMessages(hydrated, {
      maxTurns: MAX_REQUEST_MESSAGES,
      preserveAttachmentHistory: false,
    });
    const body = {
      ...input.body,
      skills: slimSkillsForRequest(input.body.skills, hydrated),
    };
    const fitted = fitChatRequest(built, body as unknown as Record<string, unknown>);
    if (fitted.info) input.onInfo(fitted.info);
    watchdog = createStallWatchdog(input.onStall);
    const stream = await createStudyChatTransport(() => { watchdog?.touch(); }).sendMessages({
      chatId: input.sessionId, trigger: "submit-message", messageId: input.userMessageId,
      messages: fitted.messages, abortSignal: input.abortSignal, body: fitted.body,
    });
    await consumeStudyStream({
      stream, message: input.assistant, abortSignal: input.abortSignal,
      onMessage(message) { latest = message; throttle.schedule(writeUi); },
      onInfo: input.onInfo,
      onContextBreakdown: input.onContextBreakdown,
      onUsage: input.onUsage,
    });
    const followUps = resolveFollowUps(latest, input.userContent);
    if (followUps) {
      latest = { ...latest, followUpQuestions: followUps };
      throttle.schedule(writeUi);
    }
  } finally {
    throttle.flush();
    flushPendingWrites();
    markSessionStreaming(input.sessionId, false);
    scheduleCloudUpsert("chat-session", input.sessionId);
    watchdog?.stop();
    notifyAccountUsageChanged();
  }
}
