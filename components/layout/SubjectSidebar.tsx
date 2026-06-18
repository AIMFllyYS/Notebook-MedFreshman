"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Sun,
  Moon,
  Calculator,
  Atom,
  FlaskConical,
  BookOpen,
  ScrollText,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import FileTree from "./FileTree";
import { useSidebarStore } from "@/lib/store/useSidebarStore";
import { contentTree } from "@/content/manifest";
import { SUBJECT_ICONS } from "@/lib/constants/subjects";
import type { SubjectId, ContentItem } from "@/lib/types/content";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Calculator,
  Atom,
  FlaskConical,
  BookOpen,
  ScrollText,
  Folder,
  FolderOpen,
};

function SubjectIcon({ name, size = 15 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Folder;
  return <Icon size={size} />;
}

export default function SubjectSidebar() {
  const router = useRouter();
  const expandedIds = useSidebarStore((s) => s.expandedIds);
  const selectedId = useSidebarStore((s) => s.selectedId);
  const toggleExpand = useSidebarStore((s) => s.toggleExpand);
  const setSelected = useSidebarStore((s) => s.setSelected);
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  const handleItemSelect = (item: ContentItem) => {
    setSelected(item.id);
    // Find the subject and category for this item to build route
    for (const subject of contentTree.subjects) {
      for (const category of subject.categories) {
        const found = findItemInList(category.items, item.id);
        if (found) {
          router.push(`/${subject.id}/${category.id}/${item.id}`);
          return;
        }
      }
    }
  };

  return (
    <aside
      className="flex h-full flex-col"
      style={{
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRight: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {/* 顶部标题区 */}
      <div
        className="flex shrink-0 items-center justify-between"
        style={{
          height: 36,
          padding: "0 8px 0 12px",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--md-sys-color-outline)",
          }}
        >
          期末复习栈
        </span>
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="flex items-center justify-center rounded"
          style={{
            width: 22,
            height: 22,
            color: "var(--md-sys-color-outline)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          {isCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* 科目列表 */}
      <div className="scroll-y flex-1" style={{ padding: "4px 0" }}>
        {contentTree.subjects.map((subject) => {
          const isSubjectExpanded = expandedIds.has(subject.id);
          const iconName = SUBJECT_ICONS[subject.id as SubjectId] ?? "Folder";

          return (
            <div key={subject.id}>
              {/* 科目行 */}
              <button
                onClick={() => toggleExpand(subject.id)}
                className="flex w-full items-center gap-1 border-0 bg-transparent text-left outline-none"
                style={{
                  height: 28,
                  paddingLeft: 8,
                  paddingRight: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--md-sys-color-on-surface)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "var(--md-sys-color-surface-container-high)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "";
                }}
              >
                <span
                  className="inline-flex shrink-0 items-center justify-center"
                  style={{
                    width: 16,
                    height: 16,
                    transition: "transform 0.15s ease",
                    transform: isSubjectExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronRight size={14} />
                </span>
                <span className="inline-flex shrink-0 items-center justify-center" style={{ width: 18, height: 18 }}>
                  <SubjectIcon name={iconName} />
                </span>
                <span className="truncate">{subject.name}</span>
              </button>

              {/* 分类列表 */}
              {isSubjectExpanded &&
                subject.categories.map((category) => {
                  const catId = `${subject.id}-${category.id}`;
                  const isCatExpanded = expandedIds.has(catId);

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleExpand(catId)}
                        className="flex w-full items-center gap-1 border-0 bg-transparent text-left outline-none"
                        style={{
                          height: 28,
                          paddingLeft: 24,
                          paddingRight: 8,
                          fontSize: 13,
                          color: "var(--md-sys-color-on-surface-variant)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--md-sys-color-surface-container-high)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "";
                        }}
                      >
                        <span
                          className="inline-flex shrink-0 items-center justify-center"
                          style={{
                            width: 16,
                            height: 16,
                            transition: "transform 0.15s ease",
                            transform: isCatExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          }}
                        >
                          <ChevronRight size={14} />
                        </span>
                        <span className="inline-flex shrink-0 items-center justify-center" style={{ width: 18, height: 18 }}>
                          {isCatExpanded ? (
                            <FolderOpen size={15} style={{ color: "var(--md-sys-color-primary)" }} />
                          ) : (
                            <Folder size={15} style={{ color: "var(--md-sys-color-outline)" }} />
                          )}
                        </span>
                        <span className="truncate">{category.name}</span>
                      </button>

                      {/* 内容项 */}
                      {isCatExpanded && (
                        <FileTree
                          items={category.items}
                          depth={3}
                          selectedId={selectedId}
                          onItemSelect={handleItemSelect}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* 底部主题切换 */}
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          height: 32,
          borderTop: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <button
          onClick={() => {
            const html = document.documentElement;
            const nextIsLight = html.getAttribute("data-theme") !== "light";
            html.setAttribute("data-theme", nextIsLight ? "light" : "dark");
            setIsLight(nextIsLight);
          }}
          className="flex items-center justify-center rounded"
          style={{
            width: 28,
            height: 24,
            color: "var(--md-sys-color-outline)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title="切换主题"
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </aside>
  );
}

function findItemInList(items: ContentItem[], targetId: string): boolean {
  for (const item of items) {
    if (item.id === targetId) return true;
    if (item.children && findItemInList(item.children, targetId)) return true;
  }
  return false;
}
