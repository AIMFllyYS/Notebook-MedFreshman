"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  FileText,
  CircleCheck,
  CircleDashed,
  Circle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getSiblings } from "@/lib/content-data";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import type { ContentItem } from "@/lib/types/content";

const STATUS_ICON: Record<
  string,
  { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string }
> = {
  done: { icon: CircleCheck, color: "var(--md-sys-color-primary)" },
  draft: { icon: CircleDashed, color: "#f59e0b" },
  stub: { icon: Circle, color: "var(--md-sys-color-outline)" },
};

function StatusIcon({ status }: { status?: string }) {
  const entry = STATUS_ICON[status ?? ""] ?? STATUS_ICON.stub;
  const Icon = entry.icon;
  return <Icon size={13} style={{ color: entry.color }} />;
}

const SiblingItem = memo(function SiblingItem({
  item,
  isActive,
  onClick,
}: {
  item: ContentItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-sibling-active={isActive}
      title={item.title}
      className="flex w-full items-center gap-1 border-0 bg-transparent text-left outline-none"
      style={{
        paddingLeft: 12,
        height: 28,
        lineHeight: "28px",
        fontSize: 13,
        background: isActive
          ? "var(--md-sys-color-primary-container)"
          : undefined,
        color: isActive
          ? "var(--md-sys-color-on-primary-container)"
          : "var(--md-sys-color-on-surface-variant)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background =
            "var(--md-sys-color-surface-container-high)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive
          ? "var(--md-sys-color-primary-container)"
          : "";
      }}
    >
      {/* 状态图标 */}
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ width: 16, height: 16 }}
      >
        <StatusIcon status={item.status} />
      </span>

      {/* 文件图标 */}
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ width: 18, height: 18 }}
      >
        <FileText
          size={14}
          style={{
            color: isActive
              ? "var(--md-sys-color-on-primary-container)"
              : "var(--md-sys-color-outline)",
          }}
        />
      </span>

      {/* 标题 */}
      <span className="truncate" style={{ fontSize: 13 }}>
        {item.title}
      </span>
    </button>
  );
});

export default function SiblingFilesPanel() {
  const router = useRouter();
  const subjectId = useStore((s) => s.activeSubjectId);
  const categoryId = useStore((s) => s.activeCategoryId);
  const itemId = useStore((s) => s.activeItemId);

  const { parent, siblings } = useMemo(
    () => getSiblings(subjectId, categoryId, itemId),
    [subjectId, categoryId, itemId],
  );

  const [collapsed, setCollapsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // 当前文件在兄弟列表中的索引
  const currentIndex = siblings.findIndex((s) => s.id === itemId);

  // 切换文件后自动滚动到当前文件
  useEffect(() => {
    if (collapsed || !listRef.current) return;
    const activeEl = listRef.current.querySelector(
      '[data-sibling-active="true"]',
    );
    activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [itemId, collapsed]);

  // 仅 1 个兄弟（无兄弟）时不显示面板
  if (siblings.length <= 1) return null;

  const handleSelect = (item: ContentItem) => {
    router.push(`/${subjectId}/${categoryId}/${item.id}`);
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--md-sys-color-outline-variant)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        maxHeight: "50%",
      }}
    >
      {/* 标题栏 — 点击折叠/展开 */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-1 border-0 bg-transparent text-left outline-none"
        style={{
          height: 32,
          paddingLeft: 8,
          paddingRight: 8,
          background: "var(--md-sys-color-surface-container-low)",
          borderBottom: collapsed
            ? "none"
            : "1px solid var(--md-sys-color-outline-variant)",
          cursor: "pointer",
        }}
      >
        <span
          className="inline-flex shrink-0 items-center justify-center"
          style={{
            width: 16,
            height: 16,
            transition: "transform 0.35s cubic-bezier(0.05,0.7,0.1,1.0)",
            transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
          }}
        >
          <ChevronRight
            size={14}
            style={{ color: "var(--md-sys-color-outline)" }}
          />
        </span>
        <span
          className="truncate"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--md-sys-color-outline)",
            flex: 1,
          }}
        >
          {parent?.title ?? "全部文件"}
        </span>
        <span
          className="shrink-0"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--md-sys-color-outline)",
          }}
        >
          {currentIndex >= 0 ? `${currentIndex + 1}/${siblings.length}` : `${siblings.length}`}
        </span>
      </button>

      {/* 文件列表 — AnimatedCollapse 折叠 */}
      <AnimatedCollapse isOpen={!collapsed}>
        <div
          ref={listRef}
          className="scroll-y"
          style={{
            overflowY: "auto",
            padding: "2px 0",
          }}
        >
          {siblings.map((item) => (
            <SiblingItem
              key={item.id}
              item={item}
              isActive={item.id === itemId}
              onClick={() => handleSelect(item)}
            />
          ))}
        </div>
      </AnimatedCollapse>
    </div>
  );
}
