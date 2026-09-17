"use client";

/** Class 模式占位。完整班级功能由后续代理实现。 */
export default function ClassPlaceholder() {
  return (
    <div
      className="flex h-full items-center justify-center bg-[var(--bg-app)] p-6"
      data-class-placeholder
    >
      <section
        className="w-full max-w-[420px] rounded-[28px] border border-[var(--line)] bg-[var(--bg-panel)] p-6"
        aria-labelledby="class-placeholder-title"
      >
        <p className="text-[12px] font-semibold tracking-wide text-[var(--ink-faint)]">
          StudySolo · Class
        </p>
        <h1
          id="class-placeholder-title"
          className="mt-2 text-[22px] font-bold tracking-tight text-[var(--ink)]"
        >
          开发中
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
          班级与课程功能还在搭建。可先使用 Studio 学习，或切换到 Agent 对话。
        </p>
        <dl className="mt-5 space-y-2 text-[13px]">
          <div className="flex items-center justify-between rounded-xl bg-[var(--bg-muted)] px-3 py-2.5">
            <dt className="text-[var(--ink-soft)]">班级名称</dt>
            <dd className="font-medium text-[var(--ink-faint)]">尚未开放</dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[var(--bg-muted)] px-3 py-2.5">
            <dt className="text-[var(--ink-soft)]">加入方式</dt>
            <dd className="font-medium text-[var(--ink-faint)]">尚未开放</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
