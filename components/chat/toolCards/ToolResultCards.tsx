"use client";

import { Fragment } from "react";
import type { ChatMessage } from "@/lib/types/chat";
import { getToolPartsByName } from "@/lib/chat/messageParts";
import { dedupeByKey } from "@/lib/chat/traceSources";
import type { StudyToolName } from "@/lib/ai/agent/tools/names";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";
import { TOOL_RESULT_CARDS, type ToolResultCardEntry } from "@/components/chat/toolCards/registry";

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

function uniqueQueries(parts: readonly ToolPart<StudyToolName>[]): string[] {
  return dedupeByKey(
    parts.flatMap((part) => {
      const input = part.input;
      if (!input || typeof input !== "object" || !("query" in input)) return [];
      const query = String((input as { query?: unknown }).query ?? "").trim();
      return query ? [query] : [];
    }),
    (query) => query,
  );
}

function overlayAggregateMeta(
  part: ToolPart<StudyToolName>,
  parts: readonly ToolPart<StudyToolName>[],
): ToolPart<StudyToolName> {
  if (part.state !== "output-available") return part;
  const queries = uniqueQueries(parts);
  const input =
    queries.length && part.input && typeof part.input === "object"
      ? { ...part.input, query: queries.join(" · ") }
      : part.input;
  if (!("cacheHit" in part.output)) return { ...part, input };
  const cacheHit = parts.every(
    (item) => item.state === "output-available" && Boolean((item.output as { cacheHit?: boolean }).cacheHit),
  );
  return { ...part, input, output: { ...part.output, cacheHit } };
}

function mergeAggregatedPart(
  card: ToolResultCardEntry,
  parts: Array<ToolPart<StudyToolName>>,
): ToolPart<StudyToolName> {
  const items = dedupeByKey(
    parts.flatMap((part) => card.itemsOf?.(part) ?? []),
    (item) => card.itemKey?.(item) ?? null,
  );
  const merged = card.withItems ? card.withItems(parts[0], items) : parts[0];
  return overlayAggregateMeta(merged, parts);
}

export function ToolResultCards({
  message,
  isStreaming,
  names,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  /** 缺省按 RESULT_CARD_ORDER；传入时只渲染该子集。 */
  names?: readonly StudyToolName[];
}) {
  const cards = names
    ? TOOL_RESULT_CARDS.filter((card) => names.includes(card.name))
    : TOOL_RESULT_CARDS;
  const ctx = { isStreaming: !!isStreaming };

  return (
    <>
      {cards.map((card) => {
        const { name, ResultCard, resultKey, shouldRender, aggregate } = card;
        const ready = getToolPartsByName(message, name)
          .filter((part) => part.state === "output-available" && !part.preliminary && (shouldRender?.(part as never) ?? true));

        if (aggregate) {
          if (!ready.length) return <Fragment key={name} />;
          const part = mergeAggregatedPart(card, ready as Array<ToolPart<StudyToolName>>);
          return (
            <ResultCard
              key={name}
              part={part as never}
              message={message}
              isStreaming={!!isStreaming}
              ctx={ctx}
            />
          );
        }

        return (
          <Fragment key={name}>
            {ready
              .filter(dedupBy((part) => resultKey?.(part as never) ?? null))
              .map((part) => (
                <ResultCard
                  key={resultKey?.(part as never) ?? part.toolCallId}
                  part={part as never}
                  message={message}
                  isStreaming={!!isStreaming}
                  ctx={ctx}
                />
              ))}
          </Fragment>
        );
      })}
    </>
  );
}
