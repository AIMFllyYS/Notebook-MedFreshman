"use client";

import clsx from "clsx";
import { Image as ImageIcon, Link2, MessagesSquare } from "lucide-react";
import { useAgentCenter, type AgentCenterTab } from "@/lib/stores/agentCenter";
import { useT } from "@/lib/i18n";

/**
 * Agent 中央区顶部的分段开关（回答 / 来源 / 图片）。
 *
 * 它是**视图开关**而不是第二个导航：三个页签说的是同一件事的不同切面，
 * 所以做成居中的细分段条（Perplexity 那种"微微切换"），而不是左侧栏那种导航行。
 * 计数徽标只在有内容时出现——空对话里挂一个 0 只会噪声。
 */
export default function AgentCenterTabs({
  linksCount,
  imagesCount,
}: {
  linksCount: number;
  imagesCount: number;
}) {
  const t = useT();
  const centerTab = useAgentCenter((state) => state.centerTab);
  const setCenterTab = useAgentCenter((state) => state.setCenterTab);

  const tabs: { id: AgentCenterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "answer", label: t("agent.center.tab.answer"), icon: <MessagesSquare size={15} />, count: 0 },
    { id: "links", label: t("agent.center.tab.links"), icon: <Link2 size={15} />, count: linksCount },
    { id: "images", label: t("agent.center.tab.images"), icon: <ImageIcon size={15} />, count: imagesCount },
  ];

  return (
    <div
      role="tablist"
      aria-label={t("agent.center.tabs.aria")}
      data-testid="agent-center-tabs"
      className="flex h-11 shrink-0 items-center justify-center gap-1 border-b border-[var(--line-soft)]"
    >
      {tabs.map((tab) => {
        const active = tab.id === centerTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`agent-center-tab-${tab.id}`}
            onClick={() => setCenterTab(tab.id)}
            className={clsx(
              "press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 ? (
              <span
                className={clsx(
                  "rounded-full px-1.5 text-[11px] leading-4 tabular-nums",
                  active ? "bg-[var(--accent)]/15" : "bg-[var(--bg-muted)] text-[var(--ink-faint)]",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
