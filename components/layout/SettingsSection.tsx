"use client";

import { ChevronDown } from "lucide-react";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import { DURATION, EASE } from "@/lib/motion";

const CHEVRON_EASE = `cubic-bezier(${EASE.decelerate.join(",")})`;

function Chevron({ open, size = 16 }: { open: boolean; size?: number }) {
  return (
    <ChevronDown
      size={size}
      className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]"
      style={{
        transition: `transform ${DURATION.sidebar}s ${CHEVRON_EASE}`,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    />
  );
}

export default function SettingsSection({
  title,
  icon,
  summary,
  children,
  open,
  onToggle,
  unbounded = false,
  testId,
  variant = "card",
}: {
  title: string;
  icon: React.ReactNode;
  summary?: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** 手机设置页：不截高度，内容完整并向下推后面的卡片。 */
  unbounded?: boolean;
  testId?: string;
  /**
   * card：手机全屏设置页的卡片外观。
   * menu：桌面弹出面板的扁平菜单项——一行「标题 …… 摘要」，展开内容向下缩进、灰字。
   */
  variant?: "card" | "menu";
}) {
  if (variant === "menu") {
    return (
      <section
        className="shrink-0"
        data-settings-expand={unbounded ? "unbounded" : "bounded"}
        data-settings-variant="menu"
      >
        <button
          type="button"
          aria-expanded={open}
          aria-label={title}
          data-testid={testId}
          onClick={onToggle}
          className="app-menu-item"
        >
          <span className="app-menu-check text-[var(--md-sys-color-on-surface-variant)]">{icon}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate">{title}</span>
              {summary ? (
                <span className="shrink-0 truncate text-[10.5px] font-normal text-[var(--md-sys-color-on-surface-variant)]">
                  {summary}
                </span>
              ) : null}
            </span>
          </span>
          <Chevron open={open} size={14} />
        </button>
        <AnimatedCollapse isOpen={open}>
          <div className="pb-2 pl-[30px] pr-2 text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">
            {children}
          </div>
        </AnimatedCollapse>
      </section>
    );
  }

  return (
    <section
      className="shrink-0 overflow-hidden rounded-[var(--md-sys-shape-corner-large,16px)]"
      data-settings-expand={unbounded ? "unbounded" : "bounded"}
      data-settings-variant="card"
      style={{
        background: "var(--md-sys-color-surface-container)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={title}
        data-testid={testId}
        onClick={onToggle}
        className="flex w-full items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left"
        style={{ color: "var(--md-sys-color-on-surface)", cursor: "pointer" }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold">{title}</span>
          {summary && (
            <span className="mt-0.5 block truncate text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">
              {summary}
            </span>
          )}
        </span>
        <Chevron open={open} />
      </button>
      {unbounded ? (
        open ? (
          <div
            className="border-t px-3.5 py-3"
            style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
          >
            {children}
          </div>
        ) : null
      ) : (
        <AnimatedCollapse isOpen={open}>
          <div
            className="min-h-0 max-h-[50vh] overflow-y-auto overscroll-contain border-t px-3.5 py-3"
            style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
          >
            {children}
          </div>
        </AnimatedCollapse>
      )}
    </section>
  );
}
