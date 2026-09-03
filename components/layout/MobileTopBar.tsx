"use client";

import { useEffect } from "react";
import { ChevronDown, Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/hooks/useTheme";
import { getContentItem } from "@/lib/content-data";
import { subjectShortName } from "@/lib/content-data/subjects.registry";
import SubjectIcon from "@/components/shared/SubjectIcon";
import BrandLogo from "./BrandLogo";

export default function MobileTopBar() {
  const subjectId = useStore((s) => s.activeSubjectId);
  const categoryId = useStore((s) => s.activeCategoryId);
  const itemId = useStore((s) => s.activeItemId);
  const toggle = useStore((s) => s.toggleMobileChapterPicker);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const hydrateTheme = useTheme((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  const item = getContentItem(subjectId, categoryId, itemId);
  const shortSubject = subjectShortName(subjectId);
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
