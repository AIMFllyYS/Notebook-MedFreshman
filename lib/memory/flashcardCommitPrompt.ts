// 写闪卡的共享文案：确认后的撰写指令只放在旁路请求的最后一条 user 消息里，
// 避免改 system 前缀（原先的 FLASHCARD_COMMIT_RULE）打穿 prompt cache。
// 成卡仍走现有 RecordMode（摘录/挖空/出题/自定义）和复习流水线。

import type { RecordMode } from "@/lib/review/types";

export function buildFlashcardCommitPrompt(mode?: RecordMode): string {
  const resolved = mode ?? "cloze";
  return [
    `用户已确认把这次对话整理成复习闪卡，模式为 ${resolved}。`,
    "请立即调用 commitFlashcards，按约定模式提交 2–6 条可测验原文（originalText）。",
    "不要再调用 proposeMemory，不要在正文里重复卡片内容。",
  ].join("");
}
