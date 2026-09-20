// 会话级「已读切片」记忆：这一轮模型读过哪些项目切片，下一轮还要读得到。
//
// 来源是流式回来的 tool-readProjectSlices 工具结果（output.sliceIds），不是客户端猜的：
// 只有真的进了上下文、模型真的读过的切片才值得继续携带。
//
// 上限 200 条：够覆盖几个文件的全部切片，又不至于把 manifest 撑到需要分片存储。

import type { ChatMessagePart } from "@/lib/types/chat";

/** 每条会话最多记住多少片（超出丢最旧的）。 */
export const MAX_REMEMBERED_SLICES = 200;

function recordOf(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function toolName(part: { type: string; toolName?: unknown }): string | null {
  if (part.type === "dynamic-tool") return typeof part.toolName === "string" ? part.toolName : null;
  if (part.type.startsWith("tool-")) return part.type.slice("tool-".length);
  return null;
}

/** 从一条助手消息的 parts 里收集 readProjectSlices 真正读到的切片 id（按出现顺序去重）。 */
export function collectReadSliceIds(parts: readonly ChatMessagePart[] | undefined): string[] {
  if (!parts?.length) return [];
  const out: string[] = [];
  for (const part of parts) {
    // 旧版本落盘的消息里可能出现残缺 part：一个不识别的形状跳过就好，不能让整条链炸掉。
    if (!part || typeof part !== "object" || typeof part.type !== "string") continue;
    if (toolName(part) !== "readProjectSlices") continue;
    const output = recordOf((part as { output?: unknown }).output);
    if (!output) continue;
    const ids = output.sliceIds;
    if (!Array.isArray(ids)) continue;
    for (const id of ids) {
      if (typeof id !== "string" || !id) continue;
      if (!out.includes(id)) out.push(id);
    }
  }
  return out;
}

/** 旧的在前、新读的在后；超出上限丢最旧的。空输入返回原数组引用，方便调用方跳过落盘。 */
export function mergeRememberedSlices(
  current: readonly string[] | undefined,
  incoming: readonly string[],
): string[] {
  const base = current ?? [];
  const fresh = incoming.filter((id) => id && !base.includes(id));
  if (fresh.length === 0) return base as string[];
  const merged = [...base, ...fresh];
  return merged.length > MAX_REMEMBERED_SLICES ? merged.slice(merged.length - MAX_REMEMBERED_SLICES) : merged;
}
