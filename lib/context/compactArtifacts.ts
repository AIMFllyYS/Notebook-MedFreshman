// HTML 产物不进上下文：只留 id + 标题 + 摘要；完整 HTML 经 getArtifact 按需取回。

import { getToolName, isToolUIPart, type ModelMessage } from "ai";
import type { ArtifactCatalogItem } from "@/lib/ai/agent/tools/getArtifact/types";

export type { ArtifactCatalogItem };

export const MAX_REQUEST_ARTIFACTS = 16;

export function htmlToSummary(html: string, max = 120): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, max);
}

export function stubLargeHtml(text: string): string {
  if (!text) return text;
  let out = text.replace(/<html[\s\S]*?<\/html>/gi, (block) => {
    if (block.length < 400) return block;
    const title = block.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || "HTML";
    return `【HTML 产物已省略：${title}。需要时调用 getArtifact 取回全文。】`;
  });
  if (out.length > 1500 && /<html[\s>]/i.test(out) && !/<\/html>/i.test(out)) {
    out = "【HTML 产物已省略。需要时调用 getArtifact 取回全文。】";
  }
  return out;
}

function compactRenderOutput(output: Record<string, unknown>): Record<string, unknown> {
  const id = String(output.artifactId ?? "");
  const title = String(output.title ?? "");
  const summary = String(
    output.summary ?? htmlToSummary(String(output.prompt ?? output.text ?? output.html ?? "")),
  );
  return {
    text: `演示「${title || "未命名"}」（${id}）：${summary}`,
    artifactId: id,
    title,
    summary,
  };
}

/** UIMessage parts：renderInteractive 只留 id/标题/摘要，正文里的大块 HTML 换成占位。 */
export function compactUiParts<T extends { type: string }>(parts: T[]): T[] {
  return parts.map((part) => {
    if (part.type === "text" && "text" in part && typeof (part as { text: unknown }).text === "string") {
      return { ...part, text: stubLargeHtml((part as { text: string }).text) };
    }
    if (!isToolUIPart(part) || getToolName(part) !== "renderInteractive") return part;
    const toolPart = part as T & { state?: string; output?: Record<string, unknown> };
    if (toolPart.state !== "output-available" || !toolPart.output) return part;
    return { ...toolPart, output: compactRenderOutput(toolPart.output) };
  });
}

function compactToolResultPart(part: Record<string, unknown>): Record<string, unknown> {
  const output = part.output;
  if (output && typeof output === "object" && !Array.isArray(output)) {
    const rec = output as Record<string, unknown>;
    if (rec.type === "text" && typeof rec.value === "string") {
      const value = stubLargeHtml(rec.value);
      if (part.toolName === "renderInteractive") {
        return { ...part, output: { type: "text", value: compactRenderOutput({ text: value }).text } };
      }
      return { ...part, output: { ...rec, value } };
    }
    if (part.toolName === "renderInteractive") {
      return { ...part, output: compactRenderOutput(rec) };
    }
  }
  if (typeof output === "string") {
    return { ...part, output: stubLargeHtml(output) };
  }
  return part;
}

/** ModelMessage：大块 HTML / renderInteractive 结果收成 id+标题+摘要。 */
export function compactArtifactMessages(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((message) => {
    if (typeof message.content === "string") {
      return { ...message, content: stubLargeHtml(message.content) };
    }
    if (!Array.isArray(message.content)) return message;
    return {
      ...message,
      content: message.content.map((part) => {
        if (part.type === "text" && "text" in part && typeof part.text === "string") {
          return { ...part, text: stubLargeHtml(part.text) };
        }
        if (part.type === "tool-result") {
          return compactToolResultPart(part as unknown as Record<string, unknown>) as typeof part;
        }
        return part;
      }),
    } as ModelMessage;
  });
}

export function formatArtifactCatalog(items: ArtifactCatalogItem[]): string {
  if (items.length === 0) return "";
  const lines = items.map((item) => {
    const title = item.title || "未命名演示";
    return `- ${item.id}：${title}${item.summary ? ` — ${item.summary}` : ""}`;
  });
  return `\n\n【已生成的演示】只含 id / 标题 / 摘要；需要全文时调用 getArtifact。\n${lines.join("\n")}`;
}

export function collectRequestArtifacts(
  messages: Array<{ parts: Array<{ type: string; state?: string; output?: { artifactId?: string } }> }>,
  store: { order: string[]; byId: Record<string, { id: string; title: string; html: string }> },
): ArtifactCatalogItem[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const push = (id: string) => {
    if (!id || seen.has(id) || ids.length >= MAX_REQUEST_ARTIFACTS) return;
    seen.add(id);
    ids.push(id);
  };
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "tool-renderInteractive" && part.state === "output-available" && part.output?.artifactId) {
        push(part.output.artifactId);
      }
    }
  }
  for (const id of store.order.slice(-MAX_REQUEST_ARTIFACTS)) push(id);
  return ids.map((id) => {
    const artifact = store.byId[id];
    if (!artifact) return { id, title: id, summary: "" };
    return {
      id: artifact.id,
      title: artifact.title,
      summary: htmlToSummary(artifact.html),
      html: artifact.html,
    };
  });
}
