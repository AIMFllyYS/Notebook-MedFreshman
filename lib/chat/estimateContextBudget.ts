import { estimateTokens } from "@/lib/context/estimateTokens";
import type { RequestMessage } from "@/lib/chat/buildRequestMessages";

export interface ContextTrackerSnapshot {
  sessionContextBudgetTokens: number;
  serverContextTokens: number;
}

export const CONTEXT_WARNING = "上下文已达到 80% 软上限，本次请求只发送最近消息；本地聊天历史仍完整保留。";

export interface ContextBudget {
  limit: number;
  estimated: number;
  softLimitReached: boolean;
}

export function estimateContextBudget(
  tracker: ContextTrackerSnapshot,
  model: { contextK?: number } | undefined,
  messages: RequestMessage[],
  userContent: string,
): ContextBudget {
  const limit = tracker.sessionContextBudgetTokens > 0
    ? tracker.sessionContextBudgetTokens
    : (model?.contextK ?? 128) * 1000;
  const estimated = tracker.serverContextTokens > 0
    ? tracker.serverContextTokens + estimateTokens(userContent)
    : estimateTokens(
        messages
          .map((m) =>
            m.parts
              .map((p) => (p.type === "text" ? p.text : JSON.stringify(p)))
              .join(""),
          )
          .join(""),
      ) + 3000;
  const softLimitReached = limit > 0 && estimated / limit >= 0.8;
  return { limit, estimated, softLimitReached };
}
