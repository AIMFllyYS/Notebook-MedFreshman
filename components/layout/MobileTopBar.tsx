"use client";

import {
  ChevronDown,
  Sun,
  Moon,
  Calculator,
  Atom,
  FlaskConical,
  BookOpen,
  ScrollText,
  Folder,
} from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/hooks/useTheme";
import { getSubject, getContentItem } from "@/lib/content-data";
import type { SubjectId } from "@/lib/types/content";
import BrandLogo from "./BrandLogo";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = { Calculator, Atom, FlaskConical, BookOpen, ScrollText, Folder };

const SHORT_NAMES: Partial<Record<SubjectId, string>> = {
  probability: "概率论",
  physics: "物理",
  chemistry: "有机",
  "modern-history": "近代史",
  maogai: "毛概",
};

function SubjectIcon({
  subjectId,
  size = 16,
}: {
  subjectId: SubjectId;
  size?: number;
}) {
  const mapping: Record<SubjectId, string> = {
    probability: "Calculator",
    physics: "Atom",
    chemistry: "FlaskConical",
    "modern-history": "BookOpen",
    maogai: "ScrollText",
    other: "Folder",
  };
  const Icon = ICON_MAP[mapping[subjectId]] ?? Folder;
  return <Icon size={size} />;
}

export default function MobileTopBar() {
  const subjectId = useStore((s) => s.activeSubjectId);
  const categoryId = useStore((s) => s.activeCategoryId);
  const itemId = useStore((s) => s.activeItemId);
  const toggle = useStore((s) => s.toggleMobileChapterPicker);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);

  const item = getContentItem(subjectId, categoryId, itemId);
  const shortSubject = SHORT_NAMES[subjectId] ?? getSubject(subjectId)?.name ?? subjectId;
  const sectionLabel = item
    ? `${itemId} ${item.title}`
    : itemId;

  return (
    <header
      className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] bg-[var(--bg-panel)] px-3"
      style={{
        height: 48,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--accent)]">
        <BrandLogo size={20} />
      </span>

      <button
        onClick={toggle}
        className={clsx(
          "press flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5",
          "bg-[var(--bg-muted)] text-[var(--ink)] transition-colors active:bg-[var(--bg-elevated)]",
        )}
      >
        <SubjectIcon subjectId={subjectId} size={14} />
        <span className="text-[12px] font-semibold text-[var(--accent)] shrink-0">
          {shortSubject}
        </span>
        <span className="mx-0.5 text-[var(--ink-faint)]">/</span>
        <span className="truncate text-[13px] font-medium">{sectionLabel}</span>
        <ChevronDown size={14} className="ml-auto shrink-0 text-[var(--ink-faint)]" />
      </button>

      <button
        onClick={toggleTheme}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] active:bg-[var(--bg-muted)]"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </header>
  );
}
