"use client";

import { BookOpen, FileDigit, Layers, MonitorPlay, PenLine } from "lucide-react";
import {
  createAndOpenNote,
  openArtifactImportPicker,
  openDocumentImportPicker,
  openFlashcardCitePicker,
  openNoteLibrary,
} from "@/lib/notes/openUserNote";

interface Entry {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  run: () => void;
}

/** 空态引导项与右栏「＋」菜单同一批入口，不新增业务路径。 */
const ENTRIES: Entry[] = [
  { id: "new-note", label: "新建笔记", hint: "Markdown · 公式", icon: <PenLine size={15} />, run: () => createAndOpenNote() },
  { id: "pick-note", label: "选择笔记", hint: "引用我的 / 课程笔记", icon: <BookOpen size={15} />, run: () => openNoteLibrary({ intent: "cite" }) },
  { id: "flashcards", label: "复习闪卡", hint: "管理记忆卡", icon: <Layers size={15} />, run: () => openFlashcardCitePicker() },
  { id: "import-doc", label: "导入长文本", hint: "Agent 讲义", icon: <FileDigit size={15} />, run: () => openDocumentImportPicker() },
  { id: "import-html", label: "导入可交互 HTML", hint: "Agent 演示", icon: <MonitorPlay size={15} />, run: () => openArtifactImportPicker() },
];

/**
 * 右栏空白时的引导（对齐 Codex 空面板的「给你几个可以直接点的入口」）。
 * 只负责把已有入口摆出来，点击后走各自原有业务路径。
 */
export default function AgentDockEmptyState({ hasHiddenWindows = false }: { hasHiddenWindows?: boolean }) {
  return (
    <div
      data-testid="agent-dock-empty"
      className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <p className="text-[13px] font-semibold text-[var(--ink)]">
        {hasHiddenWindows ? "窗口都收起来了" : "工作区还没有内容"}
      </p>
      <p className="max-w-[20rem] text-[12px] leading-relaxed text-[var(--ink-soft)]">
        {hasHiddenWindows
          ? "点上方的标签可以再打开它们。"
          : "从下面选一个开始，或用右上角 ＋ 添加文件、网址。"}
      </p>
      <div className="mt-1 flex w-full max-w-[20rem] flex-col gap-1">
        {ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            data-testid={`agent-dock-empty-${entry.id}`}
            onClick={entry.run}
            className="press flex w-full items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-left transition-colors hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--bg-muted)]"
          >
            <span className="shrink-0 text-[var(--md-sys-color-primary)]">{entry.icon}</span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--ink)]">{entry.label}</span>
            <span className="shrink-0 truncate text-[11px] text-[var(--ink-faint)]">{entry.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
