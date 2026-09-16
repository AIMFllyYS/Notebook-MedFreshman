"use client";

import { useState } from "react";
import { BookOpen, BookmarkCheck, NotebookPen } from "lucide-react";
import NoteCitationPicker, { type CitationPickerKind } from "@/components/notes/NoteCitationPicker";
import { useStore } from "@/lib/store";
import { getSubject } from "@/lib/content-data";
import { appendToNoteAndOpen, createNoteAndOpen } from "@/lib/notes/openNotesEditor";

const ROW_CLASS =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]";

/**
 * 右上角加号菜单里的三行笔记入口。
 *
 * 归属科目取当前活动科目（侧栏/路由维护的 activeSubjectId），所以在概率论页面点「新建笔记」
 * 拿到的就是概率论的笔记，不需要再问一次「记到哪一科」。
 * 两个引用入口不要求先打开编辑器：appendToNoteAndOpen 会把引用追加到该科当前/最近一篇笔记，
 * 一篇都没有时新建《摘录与引用》，然后把编辑器带到前台。
 */
export default function AddNoteMenuItems({ onDone }: { onDone: () => void }) {
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const [picker, setPicker] = useState<CitationPickerKind | null>(null);

  const subjectName = getSubject(activeSubjectId)?.name ?? activeSubjectId;

  function createNote() {
    createNoteAndOpen({ subjectId: activeSubjectId, subjectName });
    onDone();
  }

  function pick(markdown: string) {
    appendToNoteAndOpen({ subjectId: activeSubjectId, subjectName, markdown });
  }

  return (
    <>
      <button type="button" role="menuitem" onClick={createNote} className={ROW_CLASS}>
        <NotebookPen size={14} className="text-[var(--md-sys-color-primary)]" />
        <span>
          <strong className="font-semibold">新建笔记</strong>
          <small className="ml-1 text-[var(--ink-soft)]">Markdown · 公式</small>
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => setPicker("note")}
        className={ROW_CLASS}
      >
        <BookOpen size={14} className="text-[var(--md-sys-color-primary)]" />
        <span>
          <strong className="font-semibold">引用讲义</strong>
          <small className="ml-1 text-[var(--ink-soft)]">选一节课程内容</small>
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => setPicker("card")}
        className={ROW_CLASS}
      >
        <BookmarkCheck size={14} className="text-[var(--md-sys-color-primary)]" />
        <span>
          <strong className="font-semibold">引用闪卡</strong>
          <small className="ml-1 text-[var(--ink-soft)]">选一张复习卡</small>
        </span>
      </button>

      {picker ? (
        <NoteCitationPicker
          kind={picker}
          subjectId={activeSubjectId}
          onPick={pick}
          onClose={() => {
            setPicker(null);
            onDone();
          }}
        />
      ) : null}
    </>
  );
}
