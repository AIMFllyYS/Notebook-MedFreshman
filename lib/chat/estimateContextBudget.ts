import { estimateTokens } from "@/lib/context/estimateTokens";
import type { RequestMessage } from "@/lib/chat/buildRequestMessages";
import type { ContextBreakdown } from "@/lib/types/chat";

export interface ContextTrackerSnapshot {
  sessionContextBudgetTokens: number;
  serverContextTokens: number;
}

export const CONTEXT_WARNING =
  "上下文已达到 80% 软上限，较早对话已压缩为摘要、参考材料按分级裁剪；本地聊天历史仍完整保留。";

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

/** 环显示：截断态取垫高值，避免假降；判定仍用 budget.estimated。 */
export function displayContextTokens(
  tracker: { contextBreakdown: ContextBreakdown | null; currentContextTokens: number },
  budget: ContextBudget,
): number {
  if (!budget.softLimitReached) return budget.estimated;
  const padded = tracker.contextBreakdown?.displayTotal ?? tracker.currentContextTokens;
  return Math.max(budget.estimated, padded);
}
