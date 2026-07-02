"use client";

import { memo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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

// hover 停留 120ms 才触发 prefetch，避免鼠标滑过整列时对每一项都创建 RSC 请求。
// 概率论 kaoqian-moni（24 项）/ shizhan-yanlian（11 项）单卷体积大，滥 prefetch 反而挤压主线程。
const PREFETCH_HOVER_DELAY_MS = 120;

// 会话级去重：一次访问同一路由只 prefetch 一次，防止反复 hover 时重复触发。
const prefetchedPaths = new Set<string>();

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
  const router = useRouter();
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 仅当存在 children 时才视为文件夹；叶子小节（如 1.1）应触发跳转而非展开
  const isFolder = !!(item.children && item.children.length > 0);
  // 叶子项对应的实际路由（与 handleItemSelect 里的 router.push 保持一致）
  const leafPath = isFolder ? null : `/${subjectId}/${categoryId}/${item.id}`;

  const schedulePrefetch = useCallback(() => {
    if (!leafPath || isSelected) return;
    if (prefetchedPaths.has(leafPath)) return;
    if (prefetchTimerRef.current) return;
    prefetchTimerRef.current = setTimeout(() => {
      prefetchTimerRef.current = null;
      // Next 16：router.prefetch 会对目标 route 拉取 RSC payload 并放入客户端缓存，
      // 用户点击时无需再等服务端渲染 → 概率论大试卷 (real-XX 40KB) 切换从"卡顿"变"瞬开"。
      try {
        router.prefetch(leafPath);
        prefetchedPaths.add(leafPath);
      } catch {
        // Next 版本差异或路由未预备好时静默失败——绝不阻塞交互
      }
    }, PREFETCH_HOVER_DELAY_MS);
  }, [leafPath, isSelected, router]);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  }, []);

  return (
    <div>
      <button
        onClick={
          isFolder
            ? () => onToggle(nsKey)
            : () => onSelect(subjectId, categoryId, item)
        }
        onFocus={schedulePrefetch}
        onBlur={cancelPrefetch}
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
          schedulePrefetch();
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isSelected
            ? "var(--md-sys-color-primary-container)"
            : "";
          cancelPrefetch();
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
