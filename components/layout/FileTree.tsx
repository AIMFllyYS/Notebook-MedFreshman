"use client";

import FileTreeItem from "./FileTreeItem";
import { useSidebarStore } from "@/lib/store/useSidebarStore";
import type { ContentItem } from "@/lib/types/content";

interface FileTreeProps {
  items: ContentItem[];
  depth?: number;
  selectedId: string | null;
  onItemSelect: (item: ContentItem) => void;
}

export default function FileTree({
  items,
  depth = 0,
  selectedId,
  onItemSelect,
}: FileTreeProps) {
  const expandedIds = useSidebarStore((s) => s.expandedIds);
  const toggleExpand = useSidebarStore((s) => s.toggleExpand);

  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id);
        const isSelected = selectedId === item.id;
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.id}>
            <FileTreeItem
              item={item}
              depth={depth}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggle={() => toggleExpand(item.id)}
              onSelect={() => onItemSelect(item)}
            />
            {isExpanded && hasChildren && (
              <FileTree
                items={item.children!}
                depth={depth + 1}
                selectedId={selectedId}
                onItemSelect={onItemSelect}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
