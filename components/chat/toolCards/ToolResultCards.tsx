"use client";

import type { ChatMessage } from "@/lib/types/chat";
import { getToolPartsByName } from "@/lib/chat/messageParts";
import type { StudyToolName } from "@/lib/ai/agent/tools/names";
import { TOOL_RESULT_CARDS } from "@/components/chat/toolCards/registry";

function dedupBy<T>(keyFn: (item: T) => string | null) {
  const seen = new Set<string>();
  return (item: T) => {
    const key = keyFn(item);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

export function ToolResultCards({
  message,
  isStreaming,
  names,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  /** 缺省按 RESULT_CARD_ORDER；传入时只渲染该子集（用来把来源条插回原位）。 */
  names?: readonly StudyToolName[];
}) {
  const cards = names
    ? TOOL_RESULT_CARDS.filter((card) => names.includes(card.name))
    : TOOL_RESULT_CARDS;
  const ctx = { isStreaming: !!isStreaming };

  return (
    <>
      {cards.map(({ name, ResultCard, resultKey, shouldRender }) =>
        getToolPartsByName(message, name)
          .filter((part) => part.state === "output-available" && !part.preliminary && (shouldRender?.(part as never) ?? true))
          .filter(dedupBy((part) => resultKey?.(part as never) ?? null))
          .map((part) => (
            <ResultCard
              key={resultKey?.(part as never) ?? part.toolCallId}
              part={part as never}
              message={message}
              isStreaming={!!isStreaming}
              ctx={ctx}
            />
          )))}
    </>
  );
}
