"use client";

import { useStore } from "@/lib/store";
import { getVideo } from "@/content/media";
import { getInteractive } from "@/components/interactives/registry";
import LazyVisible from "@/components/ui/LazyVisible";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

const CALLOUT_META: Record<string, { label: string; cls: string }> = {
  definition: { label: "定义", cls: "callout-definition" },
  theorem: { label: "定理", cls: "callout-theorem" },
  example: { label: "例", cls: "callout-example" },
  insight: { label: "直觉", cls: "callout-insight" },
  pitfall: { label: "易错点", cls: "callout-pitfall" },
  note: { label: "注", cls: "callout-note" },
};

export function Callout({ node, children }: NodeProps) {
  const kind = String(node?.properties?.kind ?? "note");
  const label = String(node?.properties?.label ?? "");
  const meta = CALLOUT_META[kind] ?? CALLOUT_META.note;
  return (
    <div className={`callout ${meta.cls}`}>
      <div className="callout-label">
        {meta.label}
        {label ? ` · ${label}` : ""}
      </div>
      {children}
    </div>
  );
}

export function Derivation({ node, children }: NodeProps) {
  const label = String(node?.properties?.label ?? "推导过程");
  return (
    <details className="derivation">
      <summary>{label}</summary>
      <div className="derivation-body">{children}</div>
    </details>
  );
}

function VideoEmbed({ id }: { id: string }) {
  const openPip = useStore((s) => s.openPip);
  const video = getVideo(id);
  if (!video) {
    return (
      <div className="my-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-muted)] px-4 py-3 text-[13px] text-[var(--ink-faint)]">
        动画视频「{id}」即将生成。
      </div>
    );
  }
  return (
    <button
      onClick={() => openPip(video)}
      className="hover-lift group my-4 flex w-full items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--md-sys-color-surface-container-lowest)] px-4 py-3 text-left transition-shadow"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--accent-weak)] text-[var(--accent-ink)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold text-[var(--ink)]">{video.title}</span>
        <span className="block text-[12px] text-[var(--ink-faint)]">点击在小窗中播放动画讲解</span>
      </span>
    </button>
  );
}

function InteractiveEmbed({ id }: { id: string }) {
  const item = getInteractive(id);
  if (!item) {
    return (
      <div className="my-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-muted)] px-4 py-3 text-[13px] text-[var(--ink-faint)]">
        交互组件「{id}」即将生成。
      </div>
    );
  }
  const C = item.Component;
  return (
    <LazyVisible placeholder={<div className="my-5 h-48 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-muted)]" />}>
      <div className="my-5">
        <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[var(--ink-soft)]">
          <span className="grid h-5 w-5 place-items-center rounded bg-[var(--accent-weak)] text-[var(--accent-ink)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          </span>
          {item.title}
        </div>
        <C />
      </div>
    </LazyVisible>
  );
}

export function MediaEmbed({ node }: NodeProps) {
  const kind = String(node?.properties?.kind ?? "");
  const eid = String(node?.properties?.eid ?? "");
  if (kind === "video") return <VideoEmbed id={eid} />;
  if (kind === "interactive") return <InteractiveEmbed id={eid} />;
  return null;
}
