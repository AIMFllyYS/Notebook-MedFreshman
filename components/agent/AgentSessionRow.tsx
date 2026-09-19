"use client";

import { MessageSquare } from "lucide-react";
import FolderTreeRow from "@/components/layout/FolderTreeRow";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import NotebookFormulaIcon from "@/components/icons/NotebookFormulaIcon";
import type { SessionMeta } from "@/lib/storage/chatStorage";

/** 会话行的图标：划词助手 / 笔记记录 / 普通对话各一种，不要互相借。 */
export function sessionIcon(session: SessionMeta) {
  if (session.kind === "floating") return <PencilSparklesIcon size={14} />;
  if (session.kind === "note") return <NotebookFormulaIcon size={14} />;
  return <MessageSquare size={14} />;
}

/** 悬停提示：优先给最近一条用户消息的预览，没有就报消息条数。 */
export function sessionPreview(session: SessionMeta): string {
  if (session.preview?.trim()) return session.preview;
  const count = session.messageCount ?? 0;
  return count > 0 ? `${count} 条消息` : "空对话";
}

/** 会话行：正常状态走 FolderTreeRow（与文件树同款），重命名时就地换成输入框。 */
export default function AgentSessionRow({
  session,
  depth = 1,
  selected = false,
  renaming,
  onSelect,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel,
}: {
  session: SessionMeta;
  depth?: number;
  selected?: boolean;
  renaming: boolean;
  onSelect: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  onRenameSubmit: (title: string) => void;
  onRenameCancel: () => void;
}) {
  if (renaming) {
    return (
      <input
        autoFocus
        defaultValue={session.title || "新对话"}
        aria-label="对话名称"
        data-testid="session-rename-input"
        className="mx-2 my-0.5 w-[calc(100%-1rem)] rounded-md border border-[var(--accent)] bg-[var(--bg-muted)] px-2 py-0.5 text-[12px] text-[var(--ink)] outline-none"
        onPointerDown={(event) => event.stopPropagation()}
        onFocus={(event) => event.currentTarget.select()}
        onContextMenu={(event) => event.stopPropagation()}
        onBlur={(event) => onRenameSubmit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onRenameSubmit(event.currentTarget.value);
          if (event.key === "Escape") onRenameCancel();
        }}
      />
    );
  }
  return (
    <div className="group/session relative flex items-center" onContextMenu={onContextMenu}>
      <div className="min-w-0 flex-1">
        <FolderTreeRow
          depth={depth}
          title={session.title || "新对话"}
          isSelected={selected}
          icon={sessionIcon(session)}
          titleAttr={sessionPreview(session)}
          ariaLabel={session.title || "新对话"}
          onClick={onSelect}
        />
      </div>
    </div>
  );
}