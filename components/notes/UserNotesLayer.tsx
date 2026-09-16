"use client";

import { useWindowManager, type UserNotesWindowData } from "@/lib/hooks/useWindowManager";
import UserNotesWorkspace from "@/components/notes/UserNotesWorkspace";

// 渲染所有打开的用户笔记工作区。选中的笔记存在窗口 data 里，所以直接订阅 windows，
// 不需要再养一个 preview store。与 RecordPreviewLayer 并列挂在 AppShell。
export default function UserNotesLayer() {
  const windows = useWindowManager((s) => s.windows);
  return (
    <>
      {windows
        .filter((win) => win.type === "user-notes")
        .map((win) => {
          const data = win.data as UserNotesWindowData;
          return (
            <UserNotesWorkspace
              key={win.id}
              windowId={win.id}
              subjectId={data.subjectId}
              noteId={data.noteId ?? null}
            />
          );
        })}
    </>
  );
}
