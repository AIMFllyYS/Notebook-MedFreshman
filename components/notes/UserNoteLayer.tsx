"use client";

import { useEffect } from "react";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { applyUpdateUserNoteEvents } from "@/lib/notes/applyUserNoteAgent";
import UserNoteEditorWindow from "@/components/notes/UserNoteEditorWindow";
import ClassroomNoteWindow from "@/components/notes/ClassroomNoteWindow";
import NoteLibraryWindow from "@/components/notes/NoteLibraryWindow";
import { isClassroomNote } from "@/lib/notes/userNote";

function OpenNoteWindow({ noteId }: { noteId: string }) {
  const classroom = useUserNotes((s) => isClassroomNote(s.byId[noteId]));
  return classroom ? <ClassroomNoteWindow noteId={noteId} /> : <UserNoteEditorWindow noteId={noteId} />;
}

// 个人笔记的浮窗层：N 个编辑器 + 单开的笔记库。与 RecordPreviewLayer 并列挂在 AppShell（桌面 + 移动）。
export default function UserNoteLayer() {
  const openEditorIds = useUserNotes((s) => s.openEditorIds);
  const libraryOpen = useUserNotes((s) => s.libraryOpen);
  const messagesById = useChatHistory((s) => s.messagesById);

  useEffect(() => {
    for (const messages of Object.values(messagesById)) {
      if (messages.length) applyUpdateUserNoteEvents(messages);
    }
  }, [messagesById]);

  return (
    <>
      {openEditorIds.map((noteId) => (
        <OpenNoteWindow key={noteId} noteId={noteId} />
      ))}
      {libraryOpen ? <NoteLibraryWindow /> : null}
    </>
  );
}
