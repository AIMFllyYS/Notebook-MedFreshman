"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface AgentPlaceholderPageProps {
  title: string;
  description: string;
  /** 计划中的能力，只作说明用；这里没有假数据、也没有假开关。 */
  plans: readonly string[];
  icon: ReactNode;
}

/**
 * Agent 板块里尚未开发的落点页（定时任务 / 插件市场）。
 * 口径：宁缺毋滥——只讲清楚「这是什么、以后能做什么」，不摆占位表格、不放可点的假按钮。
 */
export default function AgentPlaceholderPage({ title, description, plans, icon }: AgentPlaceholderPageProps) {
  return (
    <section
      data-testid="agent-placeholder-page"
      data-agent-page={title}
      className="flex h-full min-h-0 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-10 text-center"
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-muted)] text-[var(--md-sys-color-primary)]"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h1 className="text-[19px] font-semibold text-[var(--ink)]">{title}</h1>
        <span className="rounded-full border border-[var(--line-soft)] px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-[var(--ink-soft)]">
          未开发
        </span>
      </div>
      <p className="max-w-[440px] text-[13px] leading-relaxed text-[var(--ink-soft)]">{description}</p>
      <ul className="flex max-w-[460px] flex-col gap-1.5 text-left text-[12.5px] leading-relaxed text-[var(--ink-faint)]">
        {plans.map((plan) => (
          <li key={plan} className="flex items-start gap-2">
            <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--md-sys-color-outline)]" />
            <span>{plan}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/agent"
        className="press rounded-full bg-[var(--md-sys-color-primary)] px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-on-primary)]"
      >
        先去用 Agent
      </Link>
    </section>
  );
}
