// Note: this is a Next.js App Router convention.
// This file will be automatically rendered by Next.js when the route segment is loading.
// See: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

import { FileText, Lightbulb, ClipboardCheck } from "lucide-react";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--bg-muted)] ${className}`} />;
}

// 骨架屏的 UI 结构与 ContentPageClient 保持一致，在真实内容（尤其是概率论大试卷）
// 的 RSC payload 从服务端流式到达前，提供一个视觉上高度相似的占位。
// 这能让用户在点击侧边栏后立即看到"页面已切换"的反馈，显著改善"切换卡顿"的体感。
export default function ContentLoading() {
  return (
    <div className="relative flex h-full flex-col bg-[var(--bg-app)]">
      {/* Content tab bar skeleton */}
      <div className="flex shrink-0 items-center border-b border-[var(--line)] bg-[var(--bg-app)]">
        <div className="relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-primary)]">
          <FileText size={14} />
          <span>正文</span>
          <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[var(--md-sys-color-primary)]" />
        </div>
        <div className="relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
          <Lightbulb size={14} />
          <span>例题</span>
        </div>
        <div className="relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
          <ClipboardCheck size={14} />
          <span>题目测试</span>
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="scroll-y flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-5 sm:mb-7">
            <Skeleton className="mb-2 h-4 w-1/4" />
            <Skeleton className="mb-3 h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-5/6" />
          </div>
          <div className="prose-notes">
            <Skeleton className="mb-4 h-5 w-1/3" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-6 h-4 w-11/12" />

            <Skeleton className="mb-4 h-5 w-1/2" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-6 h-4 w-5/6" />

            <Skeleton className="mb-4 h-5 w-1/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </article>
      </div>
    </div>
  );
}
