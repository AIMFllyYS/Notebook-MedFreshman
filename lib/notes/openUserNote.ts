// 个人笔记的对外入口：加号菜单 / 书架卡片 / 键盘快捷键都只调这四个函数，
// 不直接摸 store，也不关心窗口 id 怎么拼。

import { useAgentProductPicker } from "@/lib/stores/agentProductPicker";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { useStore } from "@/lib/stores/ui";
import { useUserNotes } from "@/lib/stores/userNotes";
import type { NoteLibraryIntent } from "@/lib/notes/userNote";

function onBookshelfHome(): boolean {
  return typeof window !== "undefined" && window.location.pathname === "/";
}

function resolveSubjectId(explicit?: string | null): string | null {
  if (explicit !== undefined) return explicit;
  if (onBookshelfHome()) return null;
  return useStore.getState().activeSubjectId ?? null;
}

/**
 * 新建一篇笔记并打开编辑器。省略 subjectId 时绑定当前科目（首页书架则不归档）；显式传 null 则不归档。
 * `init` 给 Agent commitNotes 写入短提纲用。返回新笔记 id。
 */
export function createAndOpenNote(
  subjectId?: string | null,
  init?: { title?: string; markdown?: string },
): string {
  const bound = resolveSubjectId(subjectId);
  const notes = useUserNotes.getState();
  const id = notes.createNote(bound, init);
  notes.openEditor(id);
  return id;
}

export function openNoteEditor(noteId: string): void {
  useUserNotes.getState().openEditor(noteId);
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

/** 加号菜单：从本机 documents store 挑一篇 Agent 长文本。 */
export function openDocumentImportPicker(): void {
  useAgentProductPicker.getState().openPicker("document");
}

/** 加号菜单：从本机 artifacts store 挑一份可交互 HTML。 */
export function openArtifactImportPicker(): void {
  useAgentProductPicker.getState().openPicker("artifact");
}
