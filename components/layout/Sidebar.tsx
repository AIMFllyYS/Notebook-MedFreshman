"use client";

import clsx from "clsx";
import { manifest } from "@/content/manifest";
import { useStore } from "@/lib/store";
import type { ContentStatus } from "@/lib/content/types";

function Chevron({ open, dim }: { open: boolean; dim?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx(
        "shrink-0 transition-transform duration-150",
        open ? "rotate-90" : "rotate-0",
        dim ? "text-[var(--ink-faint)] opacity-40" : "text-[var(--ink-faint)]",
      )}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function StatusDot({ status }: { status?: ContentStatus }) {
  const map: Record<ContentStatus, string> = {
    done: "bg-emerald-500",
    draft: "bg-amber-400",
    stub: "border border-[var(--ink-faint)]/50",
  };
  return (
    <span
      className={clsx(
        "ml-auto mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
        map[status ?? "stub"],
      )}
      title={status === "done" ? "已完成" : status === "draft" ? "草稿" : "待生成"}
    />
  );
}

export default function Sidebar() {
  const expanded = useStore((s) => s.expandedChapters);
  const toggleChapter = useStore((s) => s.toggleChapter);
  const activeSectionId = useStore((s) => s.activeSectionId);
  const setActiveSection = useStore((s) => s.setActiveSection);

  return (
    <aside className="flex h-full flex-col border-r border-[var(--line)] bg-[var(--bg-panel)]">
      <div className="scroll-y flex-1 px-2 py-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          课程目录
        </p>
        {manifest.chapters.map((ch) => {
          const open = !!expanded[ch.id];
          const hasSections = ch.sections.length > 0;
          return (
            <div key={ch.id} className="mb-0.5">
              <button
                onClick={() => toggleChapter(ch.id)}
                className="press flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[13.5px] font-semibold hover:bg-[var(--bg-muted)]"
              >
                <Chevron open={open} dim={!hasSections} />
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[var(--accent-weak)] text-[11px] font-bold text-[var(--accent-ink)]">
                  {ch.number}
                </span>
                <span className="truncate">{ch.title}</span>
                {!hasSections && (
                  <span className="ml-auto shrink-0 rounded bg-[var(--bg-muted)] px-1 text-[10px] font-normal text-[var(--ink-faint)]">
                    待建
                  </span>
                )}
              </button>

              {open && hasSections && (
                <div className="animate-expand ml-[14px] mt-0.5 border-l border-[var(--line-soft)] pl-2">
                  {ch.sections.map((sec) => {
                    const active = sec.id === activeSectionId;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSection(ch.id, sec.id)}
                        className={clsx(
                          "press flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors",
                          active
                            ? "bg-[var(--accent-weak)] font-medium text-[var(--accent-ink)]"
                            : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
                        )}
                      >
                        <span
                          className={clsx(
                            "mt-px shrink-0 font-mono text-[11px]",
                            active ? "text-[var(--accent)]" : "text-[var(--ink-faint)]",
                          )}
                        >
                          {sec.id}
                        </span>
                        <span className="leading-snug">{sec.title}</span>
                        <StatusDot status={sec.status} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink-faint)]">
        共 {manifest.chapters.length} 章 · 课堂录音 18 节
      </div>
    </aside>
  );
}
