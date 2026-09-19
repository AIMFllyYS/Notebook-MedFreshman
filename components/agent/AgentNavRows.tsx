"use client";

import { usePathname, useRouter } from "next/navigation";
import { AgentAssetsIcon, AgentComposeIcon, AgentPluginsIcon, AgentScheduleIcon } from "@/components/icons/AgentIcons";

export type AgentNavId = "new-chat" | "assets" | "scheduled" | "plugins";

interface NavRow {
  id: Exclude<AgentNavId, "new-chat">;
  label: string;
  href: string;
  icon: React.ReactNode;
}

/** 三个落点页；「新对话」不是路由（它是动作），所以单独一行放在最前。 */
const NAV_ROWS: readonly NavRow[] = [
  { id: "assets", label: "我的资产", href: "/agent/assets", icon: <AgentAssetsIcon size={16} /> },
  { id: "scheduled", label: "定时任务", href: "/agent/scheduled", icon: <AgentScheduleIcon size={16} /> },
  { id: "plugins", label: "插件市场", href: "/agent/plugins", icon: <AgentPluginsIcon size={16} /> },
];

const ROW_CLASS =
  "press flex w-full items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]";

/**
 * 左栏固定区的四行导航（Codex 式「图标 + 名称」）。
 * 四行图标互不相同：新对话=气泡+加号，资产=层叠卡片，定时=时钟+刻度，插件=插头。
 */
export default function AgentNavRows({ onNewChat, newChatActive = false }: { onNewChat: () => void; newChatActive?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav data-testid="agent-nav" aria-label="Agent 板块导航" className="flex shrink-0 flex-col gap-0.5 px-1 pt-1.5">
      <button
        type="button"
        data-testid="agent-nav-new-chat"
        data-active={newChatActive || undefined}
        onClick={onNewChat}
        className={ROW_CLASS}
      >
        <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[var(--md-sys-color-primary)]">
          <AgentComposeIcon size={16} />
        </span>
        新对话
      </button>
      {NAV_ROWS.map((row) => {
        const active = pathname === row.href || pathname.startsWith(`${row.href}/`);
        return (
          <button
            key={row.id}
            type="button"
            data-testid={`agent-nav-${row.id}`}
            data-active={active || undefined}
            aria-current={active ? "page" : undefined}
            onClick={() => router.push(row.href)}
            className={ROW_CLASS}
          >
            <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[var(--md-sys-color-outline)]">
              {row.icon}
            </span>
            {row.label}
          </button>
        );
      })}
    </nav>
  );
}