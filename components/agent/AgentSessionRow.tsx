"use client";

import { Loader2, MessageSquare } from "lucide-react";
import FolderTreeRow from "@/components/layout/FolderTreeRow";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import NotebookFormulaIcon from "@/components/icons/NotebookFormulaIcon";
import { AgentScheduleIcon } from "@/components/icons/AgentIcons";
import { translate, useT } from "@/lib/i18n";
import { useSettings } from "@/lib/stores/settings";
import { useSessionRuns, type SessionRunRecord } from "@/lib/stores/sessionRuns";
import type { SessionMeta } from "@/lib/storage/chatStorage";

/** 会话行的图标：划词助手 / 笔记记录 / 定时任务 / 普通对话各一种，不要互相借。 */
export function sessionIcon(session: SessionMeta) {
  if (session.kind === "floating") return <PencilSparklesIcon size={14} />;
  if (session.kind === "note") return <NotebookFormulaIcon size={14} />;
  if (session.kind === "scheduled") return <AgentScheduleIcon size={14} />;
  return <MessageSquare size={14} />;
}

/** 悬停提示：优先给最近一条用户消息的预览，没有就报消息条数。 */
export function sessionPreview(session: SessionMeta): string {
  if (session.preview?.trim()) return session.preview;
  const count = session.messageCount ?? 0;
  // 非组件代码没有 hook 语境，只能读 store 的当前语言；调用点（会话行）订阅了语言，切换后会重算。
  const locale = useSettings.getState().locale;
  return count > 0
    ? translate(locale, "agent.session.messageCount", { count })
    : translate(locale, "agent.session.empty");
}

/**
 * 会话行的运行态徽标（Codex 式）：跑着呢转圈；跑完/出错且用户还没看过 → 蓝点/红点；
 * 打开过（markViewed）就熄。数据源是本地 sessionRuns store，不上云。
 */
export function SessionRunBadge({ run }: { run: SessionRunRecord | undefined }) {
  const t = useT();
  if (!run) return null;
  if (run.phase === "running") {
    return (
      <span
        className="mr-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center"
        title={t("agent.session.run.running")}
        aria-label={t("agent.session.run.running")}
        data-testid="session-run-running"
      >
        <Loader2 size={12} className="animate-spin text-[var(--md-sys-color-primary)]" />
      </span>
    );
  }
  if (!run.unseen) return null;
  if (run.phase === "error" || run.phase === "interrupted") {
    return (
      <span
        className="mr-2.5 inline-flex h-2 w-2 shrink-0 rounded-full"
        style={{ background: "var(--md-sys-color-error)" }}
        title={run.phase === "error" ? t("agent.session.run.error") : t("agent.session.run.interrupted")}
        aria-label={run.phase === "error" ? t("agent.session.run.error") : t("agent.session.run.interrupted")}
        data-testid="session-run-error"
      />
    );
  }
  return (
    <span
      className="mr-2.5 inline-flex h-2 w-2 shrink-0 rounded-full"
      style={{ background: "var(--md-sys-color-primary)" }}
      title={t("agent.session.run.doneUnread")}
      aria-label={t("agent.session.run.doneUnread")}
      data-testid="session-run-done"
    />
  );
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
  // hook 必须在 renaming 的提前 return 之前调用：两条渲染路径的 hook 顺序要一致。
  const t = useT();
  const title = session.title || t("agent.session.untitled");
  const run = useSessionRuns((state) => state.byId[session.id]);
  if (renaming) {
    return (
      <input
        autoFocus
        defaultValue={title}
        aria-label={t("agent.session.rename")}
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
          title={title}
          isSelected={selected}
          icon={sessionIcon(session)}
          titleAttr={sessionPreview(session)}
          ariaLabel={title}
          onClick={onSelect}
        />
      </div>
      <SessionRunBadge run={run} />
    </div>
  );
}
