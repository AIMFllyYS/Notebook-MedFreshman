"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/hooks/useTheme";
import { usesStudioChrome } from "@/lib/constants/app-mode";
import { getContentItem } from "@/lib/content-data";
import { subjectShortName } from "@/lib/content-data/subjects.registry";
import SubjectIcon from "@/components/shared/SubjectIcon";
import ModeSwitcher from "./ModeSwitcher";

export default function MobileTopBar() {
  const pathname = usePathname() ?? "/";
  const studioChrome = usesStudioChrome(pathname);
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
        minHeight: 52,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <ModeSwitcher compact />

      {studioChrome ? (
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
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <button
        onClick={toggleTheme}
        aria-label={theme === "light" ? "切换到深色" : "切换到浅色"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] active:bg-[var(--bg-muted)]"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </header>
  );
}
