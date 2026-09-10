import { consumeStudyStream, createStudyChatTransport } from "@/lib/chat/consumeStudyStream";
import { buildRequestMessages, SOFT_LIMIT_MAX_TURNS } from "@/lib/chat/buildRequestMessages";
import { createStreamUiThrottle } from "@/lib/chat/streamUiThrottle";
import { createStallWatchdog } from "@/lib/chat/createStallWatchdog";
import { hydrateForRequest } from "@/lib/chat/hydrateForRequest";
import { resolveFollowUps } from "@/lib/chat/resolveFollowUps";
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
  try {
    const hydrated = await hydrateForRequest(input.latestMessages, input.abortSignal);
    input.abortSignal.throwIfAborted();
    const { messages: requestMessages } = buildRequestMessages(hydrated, input.budget.softLimitReached ? {
      maxTurns: SOFT_LIMIT_MAX_TURNS, reason: "soft-limit", preserveAttachmentHistory: false,
    } : undefined);
    watchdog = createStallWatchdog(input.onStall);
    const stream = await createStudyChatTransport(() => { watchdog?.touch(); }).sendMessages({
      chatId: input.sessionId, trigger: "submit-message", messageId: input.userMessageId,
      messages: requestMessages, abortSignal: input.abortSignal, body: input.body,
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
    watchdog?.stop();
  }
}
