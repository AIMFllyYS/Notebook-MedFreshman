import { create } from "zustand";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useStore } from "@/lib/stores/ui";
import { useChatHistory } from "@/lib/stores/chatHistory";
import {
  buildCommitPrompt,
  collectMemoryToolEvents,
  memoryCommitOf,
  shouldAcceptProposal,
  type MemoryCommitEvent,
  type MemoryProposalEvent,
} from "@/lib/memory/memoryLoop";
import { applyCommitFlashcards, applyCommitNotes } from "@/lib/memory/applyMemoryTools";
import {
  currentNoteCommitChatContext,
  runNoteCommitWithRuntime,
} from "@/lib/memory/runNoteCommit";
import { classifySendError } from "@/lib/chat/classifySendError";
import { memoryProposalWindowId } from "@/lib/notes/userNote";
import type { MemoryKind } from "@/lib/ai/agent/tools/proposeMemory/types";
import type { ChatMessage } from "@/lib/types/chat";
import type { RecordMode } from "@/lib/review/types";

export type MemoryProposalStatus = "proposed" | "committing" | "done" | "dismissed";

export interface MemoryProposal {
  id: string;
  kind: MemoryKind;
  reason: string;
  titleHint?: string;
  suggestedMode?: RecordMode;
  messageId: string;
  toolCallId: string;
  status: MemoryProposalStatus;
  titleDraft: string;
  modeDraft: RecordMode;
  commitToolCallId?: string;
  createdNoteId?: string;
  createdCardIds?: string[];
  error?: string;
  /** 笔记旁路请求的本地 assistant，不进主 thread。 */
  commitMessage?: ChatMessage;
}

interface MemoryInboxState {
  byId: Record<string, MemoryProposal>;
  order: string[];
  appliedCommitIds: string[];
  ingestProposal: (event: MemoryProposalEvent) => void;
  ingestCommit: (event: MemoryCommitEvent) => void;
  setDraft: (id: string, patch: { titleDraft?: string; modeDraft?: RecordMode }) => void;
  confirm: (id: string) => void;
  dismiss: (id: string) => void;
}

function liveKinds(state: MemoryInboxState): MemoryKind[] {
  return state.order
    .map((id) => state.byId[id])
    .filter((item): item is MemoryProposal => Boolean(item) && (item.status === "proposed" || item.status === "committing"))
    .map((item) => item.kind);
}

function cloudGeometry(index: number) {
  if (typeof window === "undefined") {
    return { pos: { x: 48, y: 96 + index * 28 }, size: { width: 360, height: 240 } };
  }
  const width = 360;
  const height = 248;
  const right = document.getElementById("right-panel");
  const rect = right?.getBoundingClientRect();
  const x = rect
    ? Math.max(16, rect.left - width - 12)
    : Math.max(16, window.innerWidth - width - 28);
  const y = Math.max(64, (rect?.top ?? 72) + 40 + index * 28);
  return { pos: { x, y }, size: { width, height } };
}

const noteCommitAborts = new Map<string, AbortController>();

function sessionForMessage(messageId: string): { sessionId: string | null; messages: ChatMessage[] } {
  const history = useChatHistory.getState();
  for (const [sessionId, messages] of Object.entries(history.messagesById)) {
    if (messages.some((message) => message.id === messageId)) {
      return { sessionId, messages };
    }
  }
  const sessionId = history.activeSessionId;
  return { sessionId, messages: sessionId ? history.messagesById[sessionId] ?? [] : [] };
}

async function startNoteCommit(id: string): Promise<void> {
  const prev = useMemoryInbox.getState().byId[id];
  if (!prev || prev.kind !== "note" || prev.status !== "committing") return;

  noteCommitAborts.get(id)?.abort();
  const abortController = new AbortController();
  noteCommitAborts.set(id, abortController);
  const { sessionId, messages } = sessionForMessage(prev.messageId);

  try {
    const result = await runNoteCommitWithRuntime({
      historyMessages: messages,
      title: prev.titleDraft,
      chatContext: currentNoteCommitChatContext(),
      sessionId: sessionId ?? undefined,
      abortController,
      onWrite: (message) => {
        const live = useMemoryInbox.getState().byId[id];
        if (!live || live.status !== "committing") return;
        useMemoryInbox.setState((s) => ({
          byId: { ...s.byId, [id]: { ...s.byId[id]!, commitMessage: message } },
        }));
      },
    });
    if (abortController.signal.aborted || useMemoryInbox.getState().byId[id]?.status !== "committing") return;

    const { commits } = collectMemoryToolEvents([result]);
    const noteCommit = commits.find((item) => item.kind === "note" && item.notes);
    if (!noteCommit) {
      useMemoryInbox.setState((s) => {
        const live = s.byId[id];
        if (!live) return s;
        return {
          byId: {
            ...s.byId,
            [id]: { ...live, status: "proposed", error: "没有写出笔记，请再试一次。" },
          },
        };
      });
      return;
    }
    useMemoryInbox.getState().ingestCommit(noteCommit);
    const after = useMemoryInbox.getState().byId[id];
    if (after?.createdNoteId) {
      useMemoryInbox.getState().dismiss(id);
      return;
    }
    if (after?.error) {
      useMemoryInbox.setState((s) => {
        const live = s.byId[id];
        if (!live) return s;
        return { byId: { ...s.byId, [id]: { ...live, status: "proposed" } } };
      });
    }
  } catch (error) {
    if (abortController.signal.aborted) return;
    const message = classifySendError(error, { stalled: false, aborted: abortController.signal.aborted });
    useMemoryInbox.setState((s) => {
      const live = s.byId[id];
      if (!live) return s;
      return {
        byId: {
          ...s.byId,
          [id]: { ...live, status: "proposed", error: message ?? "整理失败，请再试一次。" },
        },
      };
    });
  } finally {
    if (noteCommitAborts.get(id) === abortController) noteCommitAborts.delete(id);
  }
}

function openCloud(proposal: MemoryProposal, index: number) {
  const { pos, size } = cloudGeometry(index);
  useWindowManager.getState().openWindow({
    id: memoryProposalWindowId(proposal.id),
    type: "memory-proposal",
    title: proposal.kind === "note" ? "整理成笔记？" : "整理成闪卡？",
    pos,
    size,
    data: { proposalId: proposal.id },
  });
}

export const useMemoryInbox = create<MemoryInboxState>((set, get) => ({
  byId: {},
  order: [],
  appliedCommitIds: [],

  ingestProposal: (event) => {
    const state = get();
    if (!shouldAcceptProposal(liveKinds(state), event, Boolean(state.byId[event.proposalId]))) return;
    const proposal: MemoryProposal = {
      id: event.proposalId,
      kind: event.kind,
      reason: event.reason,
      titleHint: event.titleHint,
      suggestedMode: event.suggestedMode,
      messageId: event.messageId,
      toolCallId: event.toolCallId,
      status: "proposed",
      titleDraft: event.titleHint || "",
      modeDraft: event.suggestedMode || "cloze",
    };
    set((s) => ({
      byId: { ...s.byId, [proposal.id]: proposal },
      order: s.order.includes(proposal.id) ? s.order : [...s.order, proposal.id],
    }));
    openCloud(proposal, get().order.length - 1);
  },

  ingestCommit: (event) => {
    if (get().appliedCommitIds.includes(event.toolCallId)) return;
    const committing = get()
      .order
      .map((id) => get().byId[id])
      .find((item) => item && item.status === "committing" && item.kind === event.kind);

    try {
      if (event.kind === "note" && event.notes) {
        const noteId = applyCommitNotes(event.notes);
        if (committing) {
          set((s) => ({
            appliedCommitIds: [...s.appliedCommitIds, event.toolCallId],
            byId: {
              ...s.byId,
              [committing.id]: {
                ...committing,
                status: "done",
                commitToolCallId: event.toolCallId,
                createdNoteId: noteId,
              },
            },
          }));
        } else {
          set((s) => ({ appliedCommitIds: [...s.appliedCommitIds, event.toolCallId] }));
        }
        return;
      }
      if (event.kind === "flashcard" && event.flashcards) {
        const cardIds = applyCommitFlashcards(event.flashcards);
        if (committing) {
          set((s) => ({
            appliedCommitIds: [...s.appliedCommitIds, event.toolCallId],
            byId: {
              ...s.byId,
              [committing.id]: {
                ...committing,
                status: "done",
                commitToolCallId: event.toolCallId,
                createdCardIds: cardIds,
              },
            },
          }));
        } else {
          set((s) => ({ appliedCommitIds: [...s.appliedCommitIds, event.toolCallId] }));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "写入失败";
      if (committing) {
        set((s) => ({
          byId: { ...s.byId, [committing.id]: { ...committing, error: message } },
        }));
      }
    }
  },

  setDraft: (id, patch) => {
    const prev = get().byId[id];
    if (!prev) return;
    set((s) => ({ byId: { ...s.byId, [id]: { ...prev, ...patch } } }));
  },

  confirm: (id) => {
    const prev = get().byId[id];
    if (!prev || prev.status !== "proposed") return;
    set((s) => ({
      byId: {
        ...s.byId,
        [id]: { ...prev, status: "committing", error: undefined, commitMessage: undefined },
      },
    }));
    useWindowManager.getState().updateWindow(memoryProposalWindowId(id), {
      title: prev.kind === "note" ? "正在整理笔记" : "正在整理闪卡",
      size: { width: 380, height: prev.kind === "note" ? 420 : 360 },
    });
    if (prev.kind === "note") {
      void startNoteCommit(id);
      return;
    }
    useStore.getState().sendToChat(
      buildCommitPrompt(prev.kind, { title: prev.titleDraft, mode: prev.modeDraft }),
      { memoryCommit: memoryCommitOf(prev.kind) },
    );
  },

  dismiss: (id) => {
    noteCommitAborts.get(id)?.abort();
    noteCommitAborts.delete(id);
    useWindowManager.getState().closeWindow(memoryProposalWindowId(id));
    const prev = get().byId[id];
    if (!prev) return;
    set((s) => ({ byId: { ...s.byId, [id]: { ...prev, status: "dismissed" } } }));
  },
}));
