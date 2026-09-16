// 笔记批准旁路：公共实现在 runMemoryCommit，这里保留第 1 项测试仍在用的入口。

import type { ChatMessage } from "@/lib/types/chat";
import {
  buildMemoryCommitSideTurn,
  setMemoryCommitRunnerForTests,
  type MemoryCommitSideTurn,
  type RunMemoryCommitInput,
} from "@/lib/memory/runMemoryCommit";

export type NoteCommitSideTurn = MemoryCommitSideTurn & { memoryCommit: "note" };

export function buildNoteCommitSideTurn(input: {
  historyMessages: readonly ChatMessage[];
  title?: string;
}): NoteCommitSideTurn {
  return buildMemoryCommitSideTurn({
    historyMessages: input.historyMessages,
    memoryCommit: "note",
    title: input.title,
  }) as NoteCommitSideTurn;
}

export type RunNoteCommitInput = Omit<RunMemoryCommitInput, "memoryCommit" | "mode">;
export type NoteCommitRunner = (input: RunNoteCommitInput) => Promise<ChatMessage>;

export function setNoteCommitRunnerForTests(runner: NoteCommitRunner | null): void {
  setMemoryCommitRunnerForTests(runner ? (input) => runner(input) : null);
}
