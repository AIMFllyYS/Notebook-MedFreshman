"use client";

import { useEffect } from "react";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useNoteChangeProposals } from "@/lib/stores/noteChangeProposals";
import { collectNoteChangeProposals } from "@/lib/notes/noteChangeProposal";
import UserNoteEditorWindow from "@/components/notes/UserNoteEditorWindow";
import ClassroomNoteWindow from "@/components/notes/ClassroomNoteWindow";
import NoteLibraryWindow from "@/components/notes/NoteLibraryWindow";
import { isClassroomNote } from "@/lib/notes/userNote";

function OpenNoteWindow({ noteId }: { noteId: string }) {
  const classroom = useUserNotes((s) => isClassroomNote(s.byId[noteId]));
  return classroom ? <ClassroomNoteWindow noteId={noteId} /> : <UserNoteEditorWindow noteId={noteId} />;
}

// 个人笔记的浮窗层：N 个编辑器 + 单开的笔记库。与 RecordPreviewLayer 并列挂在 AppShell（桌面 + 移动）。
//
// 这里**不再**扫描消息自动写回笔记。Agent 的笔记改动只能经确认卡（NoteChangeConsentCard）
// 由用户点击同意后落地；消息历史只是候选稿的载体，重放历史不会产生任何写入。
export default function UserNoteLayer() {
  const openEditorIds = useUserNotes((s) => s.openEditorIds);
  const libraryOpen = useUserNotes((s) => s.libraryOpen);
  const messagesById = useChatHistory((s) => s.messagesById);
  const ingestAll = useNoteChangeProposals((s) => s.ingestAll);

  // 只登记候选稿到收件箱（幂等，已应用/已取消的只恢复状态）。
  // 真正的写入在用户点确认卡时发生，见 lib/stores/noteChangeProposals.ts。
  useEffect(() => {
    for (const [sessionId, messages] of Object.entries(messagesById)) {
      if (!messages.length) continue;
      ingestAll(collectNoteChangeProposals(messages, sessionId));
    }
  }, [messagesById, ingestAll]);

  return (
    <>
      {openEditorIds.map((noteId) => (
        <OpenNoteWindow key={noteId} noteId={noteId} />
      ))}
      {libraryOpen ? <NoteLibraryWindow /> : null}
    </>
  );
}
