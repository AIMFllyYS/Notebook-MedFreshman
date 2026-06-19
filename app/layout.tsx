import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "期末复习工作站 · 多学科辅助学习",
  description:
    "课堂录音驱动的深度学习助手：详尽原创笔记、AI 对话、Manim 动画讲解与可交互内容，覆盖概率论、有机化学、近现代史等多学科。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-[var(--ink-faint)]">加载中…</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
