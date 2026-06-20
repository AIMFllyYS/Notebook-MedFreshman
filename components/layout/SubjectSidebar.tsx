"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import { useStore } from "@/lib/store";
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
  const pathname = usePathname();
  const expandedIds = useStore((s) => s.expandedIds);
  const toggleExpand = useStore((s) => s.toggleExpand);
  // 折叠状态与 AppShell 左面板共用同一真相源（此前各持一份，导致此处的折叠按钮失效）。
  const isCollapsed = useStore((s) => s.sidebarCollapsed);
  const setCollapsed = useStore((s) => s.setSidebarCollapsed);
  const [isLight, setIsLight] = useState(false);

  // 选中态由路由派生（单一真相源）：/[subject]/[category]/[id] → `${subject}/${category}/${id}`。
  // 这样刷新/深链时也能正确高亮，且天然命名空间化，不会跨学科串扰。
  const selectedKey = useMemo(() => {
    const segs = pathname.split("/").filter(Boolean);
    return segs.length >= 3 ? `${segs[0]}/${segs[1]}/${segs[2]}` : null;
  }, [pathname]);

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  // 路由直接由渲染处已知的 (subjectId, categoryId) 构造，不再全局搜索 item.id。
  // 此前的全局搜索会因裸 id 跨学科碰撞（概率论排在首位）而把化学等学科的点击
  // 错误地解析到 /probability/...。选中键同样命名空间化，杜绝跨学科高亮串扰。
  const handleItemSelect = useCallback(
    (subjectId: string, categoryId: string, item: ContentItem) => {
      router.push(`/${subjectId}/${categoryId}/${item.id}`);
    },
    [router],
  );

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
                    transition: "transform 0.35s cubic-bezier(0.05,0.7,0.1,1.0)",
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
              <AnimatedCollapse isOpen={isSubjectExpanded}>
                {subject.categories.map((category) => {
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
                            transition: "transform 0.35s cubic-bezier(0.05,0.7,0.1,1.0)",
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
                      <AnimatedCollapse isOpen={isCatExpanded}>
                        <FileTree
                          items={category.items}
                          depth={3}
                          subjectId={subject.id}
                          categoryId={category.id}
                          selectedId={selectedKey}
                          onItemSelect={handleItemSelect}
                        />
                      </AnimatedCollapse>
                    </div>
                  );
                })}
              </AnimatedCollapse>
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
