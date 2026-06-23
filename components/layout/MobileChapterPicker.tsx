"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  Check,
  Calculator,
  Atom,
  FlaskConical,
  BookOpen,
  ScrollText,
  Folder,
} from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { contentTree } from "@/lib/content-data/manifest";
import type { SubjectId, ContentItem } from "@/lib/types/content";
import { SUBJECTS } from "@/lib/constants/subjects";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = { Calculator, Atom, FlaskConical, BookOpen, ScrollText, Folder };

const SUBJECT_ICON_NAMES: Record<SubjectId, string> = {
  probability: "Calculator",
  physics: "Atom",
  chemistry: "FlaskConical",
  "modern-history": "BookOpen",
  maogai: "ScrollText",
  other: "Folder",
};

export default function MobileChapterPicker() {
  const router = useRouter();
  const open = useStore((s) => s.mobileChapterPickerOpen);
  const close = useStore((s) => s.setMobileChapterPickerOpen);
  const activeSubject = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);

  const [pickerSubject, setPickerSubject] = useState<SubjectId>(activeSubject);
  const [pickerCategory, setPickerCategory] = useState<string>(
    activeCategoryId || "detail",
  );
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setPickerSubject(activeSubject);
      setPickerCategory(activeCategoryId || "detail");
      requestAnimationFrame(() => {
        activeRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
      });
    }
  }, [open, activeSubject, activeCategoryId]);

  const subject = contentTree.subjects.find((s) => s.id === pickerSubject);
  const category = subject?.categories.find((c) => c.id === pickerCategory);
  const items = category?.items ?? [];

  const handleSelect = useCallback(
    (subjectId: string, categoryId: string, itemId: string) => {
      router.push(`/${subjectId}/${categoryId}/${itemId}`);
      close(false);
    },
    [router, close],
  );

  const availableCategories = subject?.categories.filter(
    (c) => c.items.length > 0,
  ) ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="chapter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => close(false)}
          />

          {/* Sheet */}
          <motion.div
            key="chapter-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 350,
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) close(false);
            }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-[var(--bg-panel)] shadow-lg"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Drag handle */}
            <div className="flex shrink-0 items-center justify-center py-2">
              <span className="h-1 w-8 rounded-full bg-[var(--ink-faint)]/40" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-4 pb-3">
              <h2 className="text-[16px] font-semibold text-[var(--ink)]">
                选择章节
              </h2>
              <button
                onClick={() => close(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--ink-soft)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Subject pills */}
            <div className="hide-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-3">
              {contentTree.subjects
                .map((s) => {
                  const Icon =
                    ICON_MAP[SUBJECT_ICON_NAMES[s.id as SubjectId]] ?? Folder;
                  const active = pickerSubject === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setPickerSubject(s.id as SubjectId);
                        const firstCat =
                          s.categories.find((c) => c.items.length > 0)?.id ?? "detail";
                        setPickerCategory(firstCat);
                      }}
                      className={clsx(
                        "press flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                        active
                          ? "bg-[var(--accent)] text-[var(--md-sys-color-on-primary)]"
                          : "bg-[var(--bg-muted)] text-[var(--ink-soft)]",
                      )}
                    >
                      <Icon size={13} />
                      {SUBJECTS[s.id as SubjectId] ?? s.name}
                    </button>
                  );
                })}
            </div>

            {/* Category tabs */}
            {availableCategories.length > 1 && (
              <div className="hide-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--line)] px-4 pb-2">
                {availableCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setPickerCategory(c.id)}
                    className={clsx(
                      "shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                      pickerCategory === c.id
                        ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                        : "text-[var(--ink-faint)] hover:bg-[var(--bg-muted)]",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Chapter / section list */}
            <div className="scroll-y min-h-0 flex-1 px-2 py-2">
              {items.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-[var(--ink-faint)]">
                  暂无内容
                </p>
              ) : (
                items.map((chapter) => (
                  <ChapterGroup
                    key={chapter.id}
                    chapter={chapter}
                    subjectId={pickerSubject}
                    categoryId={pickerCategory}
                    activeItemId={
                      activeSubject === pickerSubject &&
                      activeCategoryId === pickerCategory
                        ? activeItemId
                        : null
                    }
                    onSelect={handleSelect}
                    activeRef={activeRef}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ChapterGroup({
  chapter,
  subjectId,
  categoryId,
  activeItemId,
  onSelect,
  activeRef,
}: {
  chapter: ContentItem;
  subjectId: SubjectId;
  categoryId: string;
  activeItemId: string | null;
  onSelect: (sub: string, cat: string, id: string) => void;
  activeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const hasChildren = chapter.children && chapter.children.length > 0;
  const [expanded, setExpanded] = useState(() => {
    if (!hasChildren) return false;
    return (
      activeItemId != null &&
      chapter.children!.some((c) => c.id === activeItemId)
    );
  });

  useEffect(() => {
    if (
      hasChildren &&
      activeItemId != null &&
      chapter.children!.some((c) => c.id === activeItemId)
    ) {
      setExpanded(true);
    }
  }, [hasChildren, activeItemId, chapter.children]);

  if (!hasChildren) {
    const isActive = chapter.id === activeItemId;
    return (
      <button
        ref={isActive ? activeRef : undefined}
        onClick={() => onSelect(subjectId, categoryId, chapter.id)}
        className={clsx(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors",
          isActive
            ? "bg-[var(--accent-weak)] font-semibold text-[var(--accent-ink)]"
            : "text-[var(--ink)] active:bg-[var(--bg-muted)]",
        )}
      >
        <span className="flex-1 truncate">{chapter.title}</span>
        {isActive && <Check size={14} className="shrink-0 text-[var(--accent)]" />}
      </button>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[var(--ink)] active:bg-[var(--bg-muted)]"
      >
        <ChevronRight
          size={14}
          className={clsx(
            "shrink-0 text-[var(--ink-faint)] transition-transform duration-200",
            expanded && "rotate-90",
          )}
        />
        <span className="flex-1 truncate">{chapter.title}</span>
      </button>

      {expanded && (
        <div className="ml-3 border-l border-[var(--line)] pl-2">
          {chapter.children!.map((section) => {
            const isActive = section.id === activeItemId;
            return (
              <button
                key={section.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSelect(subjectId, categoryId, section.id)}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                  isActive
                    ? "bg-[var(--accent-weak)] font-medium text-[var(--accent-ink)]"
                    : "text-[var(--ink-soft)] active:bg-[var(--bg-muted)]",
                )}
              >
                <span className="w-7 shrink-0 text-[12px] font-mono text-[var(--ink-faint)]">
                  {section.id}
                </span>
                <span className="flex-1 truncate">{section.title}</span>
                {isActive && (
                  <Check size={14} className="shrink-0 text-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
