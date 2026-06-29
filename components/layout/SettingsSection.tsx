"use client";

import { ChevronDown } from "lucide-react";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import { DURATION, EASE } from "@/lib/motion";

const CHEVRON_EASE = `cubic-bezier(${EASE.decelerate.join(",")})`;

export default function SettingsSection({
  title,
  icon,
  summary,
  children,
  open,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  summary?: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      className="overflow-hidden rounded-[var(--md-sys-shape-corner-large,16px)]"
      style={{
        background: "var(--md-sys-color-surface-container)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={title}
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
        <ChevronDown
          size={16}
          className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]"
          style={{
            transition: `transform ${DURATION.sidebar}s ${CHEVRON_EASE}`,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <AnimatedCollapse isOpen={open}>
        <div
          className="min-h-0 max-h-[50vh] overflow-y-auto overscroll-contain border-t px-3.5 py-3"
          style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
        >
          {children}
        </div>
      </AnimatedCollapse>
    </section>
  );
}
