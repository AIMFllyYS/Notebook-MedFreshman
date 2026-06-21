import NoteSkeleton from "@/components/notes/NoteSkeleton";
import { FileText, Lightbulb, ClipboardCheck } from "lucide-react";

/**
 * Next.js route-level loading UI。
 * 页面导航时由框架自动渲染：侧边栏和右面板保持可见，
 * 只有中间内容区替换为骨架屏，避免整页空白。
 *
 * DOM 结构与 ContentPageClient 严格对齐（根容器、tab 栏、滚动区、article 布局），
 * 确保 Suspense 切换时 PanelGroup 不会因布局差异触发 reflow，
 * 进而避免侧边栏 AnimatedCollapse 闪动。
 */
export default function ContentLoading() {
  return (
    <div className="relative flex h-full flex-col bg-[var(--bg-app)]">
      {/* Tab 栏 —— 与 ContentPageClient 完全一致 */}
      <div className="flex shrink-0 border-b border-[var(--line)] bg-[var(--bg-app)]">
        {[
          { icon: <FileText size={14} />, label: "正文", active: true },
          { icon: <Lightbulb size={14} />, label: "例题", active: false },
          { icon: <ClipboardCheck size={14} />, label: "题目测试", active: false },
        ].map((t) => (
          <div
            key={t.label}
            className={[
              "relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-colors",
              t.active
                ? "text-[var(--md-sys-color-primary)]"
                : "text-[var(--md-sys-color-on-surface-variant)] opacity-50",
            ].join(" ")}
          >
            {t.icon}
            {t.label}
            {t.active && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[var(--md-sys-color-primary)]" />
            )}
          </div>
        ))}
      </div>

      {/* 内容区 —— 与 ContentPageClient 的 scroll 容器结构一致 */}
      <div data-notes-root className="scroll-y flex-1">
        <article className="mx-auto w-full max-w-3xl px-8 py-10">
          <NoteSkeleton />
        </article>
      </div>
    </div>
  );
}
