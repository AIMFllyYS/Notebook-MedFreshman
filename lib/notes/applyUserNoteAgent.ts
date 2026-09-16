import { getToolPartsByName } from "@/lib/chat/messageParts";
import type { ChatMessage } from "@/lib/types/chat";
import type { UpdateUserNoteOutput } from "@/lib/ai/agent/tools/updateUserNote/types";
import { useUserNotes } from "@/lib/stores/userNotes";
import type { EditingUserNoteContext } from "@/lib/notes/editingUserNote";

const appliedToolCallIds = new Set<string>();

export function resetAppliedUserNoteEdits(): void {
  appliedToolCallIds.clear();
}

/** 正在交给 Agent 的已打开个人笔记；关掉编辑器后返回 null。 */
export function selectEditingUserNote(noteId?: string | null): EditingUserNoteContext | null {
  const state = useUserNotes.getState();
  const id = noteId === undefined ? state.agentEditingNoteId : noteId;
  if (!id || !state.openEditorIds.includes(id)) return null;
  const note = state.byId[id];
  if (!note) return null;
  return { id: note.id, title: note.title, markdown: note.markdown };
}

export interface UpdateUserNoteEvent {
  toolCallId: string;
  output: UpdateUserNoteOutput;
}

export function collectUpdateUserNoteEvents(messages: readonly ChatMessage[]): UpdateUserNoteEvent[] {
  const events: UpdateUserNoteEvent[] = [];
  for (const message of messages) {
    for (const part of getToolPartsByName(message, "updateUserNote")) {
      if (part.state !== "output-available" || part.preliminary) continue;
      const output = part.output as UpdateUserNoteOutput;
      if (!output?.applied || !output.noteId) continue;
      if (output.action !== "delete" && !output.markdown) continue;
      events.push({ toolCallId: part.toolCallId, output });
    }
  }
  return events;
}

/**
 * 把 Agent 产出写回 `userNotes.updateNote`。
 * 只改用户已经打开的个人笔记，忽略模型自造的 id。
 */
export function applyUpdateUserNote(output: UpdateUserNoteOutput, toolCallId?: string): boolean {
  if (toolCallId && appliedToolCallIds.has(toolCallId)) return false;
  if (!output.applied || !output.noteId) return false;
  const state = useUserNotes.getState();
  if (!state.byId[output.noteId]) return false;
  if (output.action === "delete") {
    state.removeNote(output.noteId);
    if (toolCallId) appliedToolCallIds.add(toolCallId);
    return true;
  }
  if (!output.markdown) return false;
  state.updateNote(output.noteId, {
    markdown: output.markdown,
    ...(output.title !== undefined ? { title: output.title } : {}),
  });
  if (toolCallId) appliedToolCallIds.add(toolCallId);
  return true;
}

export function applyUpdateUserNoteEvents(messages: readonly ChatMessage[]): string[] {
  const written: string[] = [];
  for (const event of collectUpdateUserNoteEvents(messages)) {
    if (applyUpdateUserNote(event.output, event.toolCallId)) written.push(event.output.noteId);
  }
  return written;
}
