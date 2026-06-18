"use client";

import clsx from "clsx";
import Link from "next/link";
import { contentTree, getSubject, getCategory } from "@/content";
import type { SubjectId, CategoryId, ContentItem } from "@/lib/types/content";

interface SidebarProps {
  subjectId: SubjectId;
  categoryId: CategoryId;
  itemId: string;
}

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

function StatusDot({ status }: { status?: string }) {
  const map: Record<string, string> = {
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

/** 递归渲染内容项（含子项展开） */
function ContentItemNode({
  item,
  subjectId,
  categoryId,
  activeItemId,
  depth = 0,
}: {
  item: ContentItem;
  subjectId: SubjectId;
  categoryId: CategoryId;
  activeItemId: string;
  depth?: number;
}) {
  const isActive = item.id === activeItemId;
  const hasChildren = item.children && item.children.length > 0;
  // 判断当前项或其子项是否处于激活路径
  const isAncestor =
    !isActive &&
    hasChildren &&
    item.children!.some(
      (c) => c.id === activeItemId || isAncestorOf(c, activeItemId),
    );

  return (
    <div>
      <Link
        href={`/${subjectId}/${categoryId}/${item.id}`}
        className={clsx(
          "press flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors",
          isActive
            ? "bg-[var(--accent-weak)] font-medium text-[var(--accent-ink)]"
            : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
          depth > 0 && "ml-3",
        )}
      >
        <span
          className={clsx(
            "mt-px shrink-0 font-mono text-[11px]",
            isActive ? "text-[var(--accent)]" : "text-[var(--ink-faint)]",
          )}
        >
          {item.id}
        </span>
        <span className="leading-snug">{item.title}</span>
        <StatusDot status={item.status} />
      </Link>
      {/* 子项：当自身激活或为祖先时展开 */}
      {hasChildren && (isActive || isAncestor) && (
        <div className="animate-expand ml-[14px] border-l border-[var(--line-soft)] pl-2">
          {item.children!.map((child) => (
            <ContentItemNode
              key={child.id}
              item={child}
              subjectId={subjectId}
              categoryId={categoryId}
              activeItemId={activeItemId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 检查 item 是否为 activeItemId 的祖先 */
function isAncestorOf(item: ContentItem, targetId: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (c) => c.id === targetId || isAncestorOf(c, targetId),
  );
}

export default function Sidebar({ subjectId, categoryId, itemId }: SidebarProps) {
  const subject = getSubject(subjectId);
  const category = getCategory(subjectId, categoryId);

  return (
    <aside className="flex h-full flex-col border-r border-[var(--line)] bg-[var(--bg-panel)]">
      {/* 科目选择 */}
      <div className="border-b border-[var(--line)] px-2 py-2">
        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          科目
        </div>
        <div className="flex flex-wrap gap-1">
          {contentTree.subjects.map((s) => (
            <Link
              key={s.id}
              href={`/${s.id}/${categoryId}/${itemId}`}
              className={clsx(
                "rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
                s.id === subjectId
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--line)]",
              )}
            >
              {s.name.length > 6 ? s.name.slice(0, 6) + "…" : s.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 分类选择 */}
      <div className="border-b border-[var(--line)] px-2 py-2">
        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          分类
        </div>
        <div className="flex gap-1">
          {subject?.categories.map((c) => (
            <Link
              key={c.id}
              href={`/${subjectId}/${c.id}/${itemId}`}
              className={clsx(
                "rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
                c.id === categoryId
                  ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--line)]",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 内容目录 */}
      <div className="scroll-y flex-1 px-2 py-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          {category?.name ?? "目录"}
        </p>
        {category?.items.map((item) => (
          <ContentItemNode
            key={item.id}
            item={item}
            subjectId={subjectId}
            categoryId={categoryId}
            activeItemId={itemId}
          />
        ))}
        {(!category || category.items.length === 0) && (
          <p className="px-2 text-[12px] text-[var(--ink-faint)]">暂无内容</p>
        )}
      </div>
      <div className="border-t border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink-faint)]">
        {subject?.name ?? ""} · {category?.items.length ?? 0} 项内容
      </div>
    </aside>
  );
}
