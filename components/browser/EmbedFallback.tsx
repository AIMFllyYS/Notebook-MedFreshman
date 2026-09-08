"use client";

import { ExternalLink, ShieldAlert } from "lucide-react";

export default function EmbedFallback({
  url,
  reason,
  onForce,
  title = "无法内嵌该页面",
  actionLabel = "打开原页面",
}: {
  url: string;
  reason?: string;
  onForce: () => void;
  title?: string;
  actionLabel?: string;
}) {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep original */
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--ink-soft)]">
        <ShieldAlert size={28} />
      </div>
      <p className="text-[15px] font-semibold text-[var(--ink)]">{title}</p>
      <p className="mt-1 max-w-[320px] text-[12px] leading-relaxed text-[var(--ink-soft)]">
        <span className="font-medium text-[var(--ink)]">{host}</span>{" "}
        拒绝在当前窗口中显示（安全策略或访问受限）。请到原网站查看，以保留完整功能。
      </p>
      {reason ? (
        <p className="mt-2 max-w-[320px] text-[11px] leading-relaxed text-[var(--ink-faint)]">{reason}</p>
      ) : null}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-on-primary)]"
      >
        <ExternalLink size={15} /> {actionLabel}
      </a>

      <button
        type="button"
        onClick={onForce}
        className="press mt-3 text-[11.5px] text-[var(--ink-faint)] underline-offset-2 hover:underline"
      >
        仍要尝试内嵌（可能显示空白）
      </button>
    </div>
  );
}
