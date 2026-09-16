// 笔记批准旁路：公共实现在 runMemoryCommit，这里保留第 1 项的入口与测试注入点。

import type { ChatMessage } from "@/lib/types/chat";
import {
  buildMemoryCommitSideTurn,
  currentMemoryCommitChatContext,
  runMemoryCommit,
  runMemoryCommitWithRuntime,
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

export const currentNoteCommitChatContext = currentMemoryCommitChatContext;

export type RunNoteCommitInput = Omit<RunMemoryCommitInput, "memoryCommit" | "mode">;

export async function runNoteCommit(input: RunNoteCommitInput): Promise<ChatMessage> {
  return runMemoryCommit({ ...input, memoryCommit: "note" });
}

export type NoteCommitRunner = (input: RunNoteCommitInput) => Promise<ChatMessage>;

export function runNoteCommitWithRuntime(input: RunNoteCommitInput): Promise<ChatMessage> {
  return runMemoryCommitWithRuntime({ ...input, memoryCommit: "note" });
}

export function setNoteCommitRunnerForTests(runner: NoteCommitRunner | null): void {
  setMemoryCommitRunnerForTests(runner ? (input) => runner(input) : null);
}
