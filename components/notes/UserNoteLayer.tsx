"use client";

import { useUserNotes } from "@/lib/stores/userNotes";
import UserNoteEditorWindow from "@/components/notes/UserNoteEditorWindow";
import NoteLibraryWindow from "@/components/notes/NoteLibraryWindow";

// 个人笔记的浮窗层：N 个编辑器 + 单开的笔记库。与 RecordPreviewLayer 并列挂在 AppShell（桌面 + 移动）。
export default function UserNoteLayer() {
  const openEditorIds = useUserNotes((s) => s.openEditorIds);
  const libraryOpen = useUserNotes((s) => s.libraryOpen);

  return (
    <>
      {openEditorIds.map((noteId) => (
        <UserNoteEditorWindow key={noteId} noteId={noteId} />
      ))}
      {libraryOpen ? <NoteLibraryWindow /> : null}
    </>
  );
}
