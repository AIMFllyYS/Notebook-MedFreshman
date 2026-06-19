"use client";

import { useEffect, useRef, useState } from "react";
import { Loader, MonitorPlay, ChevronDown, ChevronUp } from "lucide-react";
import { useArtifacts } from "@/lib/hooks/useArtifacts";

/** 对话顶部横幅：流式生成时显示并可展开半屏看实时源码；完成后固定并提供「查看」（弹窗渲染）。 */
export default function ArtifactBanner() {
  const order = useArtifacts((s) => s.order);
  const byId = useArtifacts((s) => s.byId);
  const openViewer = useArtifacts((s) => s.openViewer);
  const [expanded, setExpanded] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const latest = order.length ? byId[order[order.length - 1]] : null;
  const streaming = latest?.status === "streaming";

  // 流式时自动展开，方便实时观看；自动滚到底部
  useEffect(() => {
    if (streaming) setExpanded(true);
  }, [streaming]);
  useEffect(() => {
    if (expanded && preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [latest?.html, expanded]);

  if (!latest) return null;

  return (
    <div className="shrink-0 border-b border-[var(--line)] bg-[var(--accent-weak)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {streaming ? (
          <Loader size={14} className="animate-spin shrink-0 text-[var(--accent-ink)]" />
        ) : (
          <MonitorPlay size={14} className="shrink-0 text-[var(--accent-ink)]" />
        )}
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--accent-ink)]">
          {streaming ? `正在生成交互演示：${latest.title}…` : `交互演示已就绪：${latest.title}`}
        </span>
        {latest.status === "done" && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              openViewer(latest.id);
            }}
            className="press shrink-0 rounded-md bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--md-sys-color-on-primary)]"
          >
            查看
          </span>
        )}
        {expanded ? (
          <ChevronUp size={14} className="shrink-0 text-[var(--accent-ink)]" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-[var(--accent-ink)]" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col" style={{ height: "42vh" }}>
          <pre
            ref={preRef}
            className="hide-scrollbar flex-1 overflow-auto bg-[var(--md-sys-color-surface-container-lowest)] px-3 py-2 text-[11px] leading-relaxed text-[var(--ink-soft)]"
            style={{ fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}
          >
            {latest.html || "正在生成 HTML…"}
          </pre>
          {latest.status === "done" && (
            <div className="shrink-0 border-t border-[var(--line)] bg-[var(--bg-panel)] px-3 py-1.5 text-right">
              <button
                onClick={() => openViewer(latest.id)}
                className="press inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--md-sys-color-on-primary)]"
              >
                <MonitorPlay size={12} /> 用弹窗查看渲染效果
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
