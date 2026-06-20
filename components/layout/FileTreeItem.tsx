"use client";

import { memo } from "react";
import { ChevronRight, Folder, FolderOpen, FileText } from "lucide-react";
import type { ContentItem } from "@/lib/types/content";

interface FileTreeItemProps {
  item: ContentItem;
  depth: number;
  /** 命名空间化的展开/选中键 */
  nsKey: string;
  subjectId: string;
  categoryId: string;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (nsKey: string) => void;
  onSelect: (subjectId: string, categoryId: string, item: ContentItem) => void;
}

function FileTreeItem({
  item,
  depth,
  nsKey,
  subjectId,
  categoryId,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: FileTreeItemProps) {
  // 仅当存在 children 时才视为文件夹；叶子小节（如 1.1）应触发跳转而非展开
  const isFolder = !!(item.children && item.children.length > 0);

  return (
    <div>
      <button
        onClick={
          isFolder
            ? () => onToggle(nsKey)
            : () => onSelect(subjectId, categoryId, item)
        }
        className="flex w-full items-center gap-1 border-0 bg-transparent text-left outline-none"
        style={{
          paddingLeft: depth * 16 + 4,
          height: 28,
          lineHeight: "28px",
          fontSize: 13,
          background: isSelected
            ? "var(--md-sys-color-primary-container)"
            : undefined,
          color: isSelected
            ? "var(--md-sys-color-on-primary-container)"
            : "var(--md-sys-color-on-surface-variant)",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background =
              "var(--md-sys-color-surface-container-high)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isSelected
            ? "var(--md-sys-color-primary-container)"
            : "";
        }}
      >
        {/* 展开箭头 */}
        <span
          className="inline-flex shrink-0 items-center justify-center"
          style={{
            width: 16,
            height: 16,
            transition: "transform 0.35s cubic-bezier(0.05,0.7,0.1,1.0)",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            opacity: isFolder ? 1 : 0,
          }}
        >
          <ChevronRight size={14} />
        </span>

        {/* 图标 */}
        <span className="inline-flex shrink-0 items-center justify-center" style={{ width: 18, height: 18 }}>
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={15} style={{ color: "var(--md-sys-color-primary)" }} />
            ) : (
              <Folder size={15} style={{ color: "var(--md-sys-color-outline)" }} />
            )
          ) : (
            <FileText size={14} style={{ color: "var(--md-sys-color-outline)" }} />
          )}
        </span>

        {/* 标题 */}
        <span className="truncate" style={{ fontSize: 13 }}>
          {item.title}
        </span>
      </button>
    </div>
  );
}

// memo + 稳定回调：仅当某行自身的 props（isExpanded/isSelected 等）变化时才重渲染，
// 避免一次展开/选中导致整棵树所有行重渲染。
export default memo(FileTreeItem);
