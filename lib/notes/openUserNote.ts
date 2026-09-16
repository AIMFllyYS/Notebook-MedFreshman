// 个人笔记的对外入口：加号菜单 / 书架卡片 / 键盘快捷键都只调这四个函数，
// 不直接摸 store，也不关心窗口 id 怎么拼。

import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { useStore } from "@/lib/stores/ui";
import { useUserNotes } from "@/lib/stores/userNotes";
import type { NoteLibraryIntent } from "@/lib/notes/userNote";

/**
 * 新建一篇笔记并打开编辑器。省略 subjectId 时绑定当前科目；显式传 null 则不归档。
 * 返回新笔记 id。
 */
export function createAndOpenNote(subjectId?: string | null): string {
  const bound = subjectId === undefined ? useStore.getState().activeSubjectId : subjectId;
  const notes = useUserNotes.getState();
  const id = notes.createNote(bound);
  notes.openEditor(id);
  return id;
}

export function openNoteEditor(noteId: string): void {
  useUserNotes.getState().openEditor(noteId);
}

function resolveSubjectId(explicit?: string | null): string | null {
  if (explicit !== undefined) return explicit;
  return useStore.getState().activeSubjectId ?? null;
}

/** browse = 书架「笔记」；cite = 加号菜单「选择笔记」（我的笔记 + 课程笔记两栏）。 */
export function openNoteLibrary(opts?: { subjectId?: string | null; intent?: NoteLibraryIntent }): void {
  useUserNotes.getState().openLibrary({
    intent: opts?.intent,
    subjectId: resolveSubjectId(opts?.subjectId),
  });
}

export function openFlashcardCitePicker(opts?: { subjectId?: string | null }): void {
  useFlashcardCitations.getState().openPicker({
    subjectId: resolveSubjectId(opts?.subjectId),
  });
}
