"use client";

import { useCallback } from "react";
import { BookOpen, Globe, Link2 } from "lucide-react";
import { openSourceTrace, sourceItemKey } from "@/lib/chat/openSourceTrace";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useStore } from "@/lib/stores/ui";
import { SOURCES_PANEL_INSET as INSET, clampSourcesPanelSize, useAgentCenter } from "@/lib/stores/agentCenter";
import { useT } from "@/lib/i18n";
import { labelRounds } from "./sourceRoundLabel";

type ResizeAxes = "x" | "y" | "xy";

/** 卡片副标题：网页取 host，笔记取面包屑路径。 */
function sourceMeta(source: TraceSource): string {
  if (source.kind === "note") return source.path || "";
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return source.url || "";
  }
}

/**
 * 来源**悬浮窗**（用户口径，也是 Perplexity / Codex 的做法）。
 *
 * 它不是侧栏：侧栏那种要占满一列的东西才该进 Agent 右侧统一面板；
 * 这块是浮在正文之上、**可以拖动改大小**的轻量预览 —— 看一眼来源就够了，
 * 想细看再点卡片开右侧面板。
 *
 * 位置恒在右上角（跟另外两个顶栏按钮一样不跟鼠标乱跑），只让用户改宽高。
 */
export default function AgentSourcePanel({
  rounds,
  sources,
}: {
  rounds: SourceRound[];
  sources: TraceSource[];
}) {
  const t = useT();
  const size = useAgentCenter((state) => state.sourcesPanelSize);
  const setSize = useAgentCenter((state) => state.setSourcesPanelSize);
  const setAgentDockCollapsed = useStore((state) => state.setAgentDockCollapsed);

  const openAt = useCallback(
    (source: TraceSource, index: number) => {
      if (!sources.length) return;
      openSourceTrace(sources, { rounds: labelRounds(rounds, t), activeKey: sourceItemKey(source, index) });
      // 点开就是「我要细看」：把它交给右侧统一面板，悬浮窗随右栏展开自动让位。
      setAgentDockCollapsed(false);
    },
    [rounds, setAgentDockCollapsed, sources, t],
  );

  /**
   * 拖动改大小。锚点在右上角，所以：
   * - 左边缘向左拖 = 变宽（用起始宽度减去位移）；
   * - 下边缘向下拖 = 变高。
   * 用指针捕获 + 原生监听，拖出面板外也不会断。
   */
  const startResize = useCallback(
    (axes: ResizeAxes) => (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const handle = event.currentTarget;
      const startX = event.clientX;
      const startY = event.clientY;
      const startSize = size;
      const pointerId = event.pointerId;
      try {
        handle.setPointerCapture(pointerId);
      } catch {
        /* jsdom / 老旧浏览器：没有捕获也能靠 document 上的监听走完。 */
      }
      const onMove = (move: PointerEvent) => {
        setSize(
          clampSourcesPanelSize({
            width: axes.includes("x") ? startSize.width - (move.clientX - startX) : startSize.width,
            height: axes.includes("y") ? startSize.height + (move.clientY - startY) : startSize.height,
          }),
        );
      };
      const onEnd = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onEnd);
        handle.removeEventListener("pointercancel", onEnd);
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onEnd);
      handle.addEventListener("pointercancel", onEnd);
    },
    // size 进依赖：pointerdown 读的必须是当次渲染的尺寸，否则连续拖动会跳回旧值。
    [setSize, size],
  );

  if (sources.length === 0) return null;

  return (
    /**
     * 这一列**占真实宽度**（卡片宽 + 两侧留白）：中间的对话列因此被压窄，正文永远不会钻到卡片底下。
     * 卡片本身仍是浮起来的（圆角 + 阴影 + 左上留白），看起来是悬浮窗而不是侧栏。
     * 隐藏时整列消失，对话列拿回整宽 —— flex 兄弟会自动让它在「左栏右侧那块区域」里重新居中。
     */
    <aside
      data-testid="agent-source-column"
      className="relative flex h-full shrink-0 flex-col"
      style={{ width: size.width + INSET * 2 }}
    >
    <div
      data-testid="agent-source-panel"
      className="relative ml-3 mt-3 flex min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel)] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
      style={{ height: size.height }}
    >
      <header className="flex h-9 shrink-0 items-center gap-1.5 border-b border-[var(--line-soft)] px-3">
        <Link2 size={13} className="shrink-0 text-[var(--accent)]" />
        <span className="text-[12px] font-semibold text-[var(--ink)]">
          {t("agent.sources.count", { count: sources.length })}
        </span>
      </header>

      <div className="scroll-y flex min-h-0 flex-1 flex-col gap-1.5 p-2">
        {sources.map((source, index) => (
          <button
            key={sourceItemKey(source, index)}
            type="button"
            onClick={() => openAt(source, index)}
            title={t("agent.sources.openPanel")}
            className="press flex w-full min-w-0 flex-col gap-1 rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel)] px-2.5 py-2 text-left hover:border-[var(--accent)] hover:bg-[var(--bg-muted)]"
          >
            <span className="flex min-w-0 items-start gap-1.5">
              <span className="mt-[1px] shrink-0 text-[11px] font-semibold tabular-nums text-[var(--ink-faint)]">
                {index + 1}
              </span>
              {source.kind === "web" ? (
                <Globe size={13} className="mt-[2px] shrink-0 text-[var(--ink-faint)]" />
              ) : (
                <BookOpen size={13} className="mt-[2px] shrink-0 text-[var(--ink-faint)]" />
              )}
              <span className="line-clamp-2 min-w-0 flex-1 text-[12.5px] font-medium leading-[1.35] text-[var(--ink)]">
                {source.title}
              </span>
            </span>
            {source.snippet ? (
              <span className="line-clamp-3 pl-[18px] text-[11.5px] leading-[1.5] text-[var(--ink-soft)]">
                {source.snippet}
              </span>
            ) : null}
            <span className="truncate pl-[18px] text-[10.5px] text-[var(--ink-faint)]">
              {sourceMeta(source) || t("agent.sources.noLink")}
            </span>
          </button>
        ))}
      </div>

      {/* 三个拖动把手：左边缘改宽、下边缘改高、左下角同时改。 */}
      <span
        data-testid="agent-source-panel-resize-x"
        onPointerDown={startResize("x")}
        className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize"
      />
      <span
        data-testid="agent-source-panel-resize-y"
        onPointerDown={startResize("y")}
        className="absolute bottom-0 left-0 h-1.5 w-3/4 cursor-ns-resize"
      />
      <span
        data-testid="agent-source-panel-resize-xy"
        onPointerDown={startResize("xy")}
        className="absolute bottom-0 left-0 h-3.5 w-3.5 cursor-nesw-resize"
      />
    </div>
    </aside>
  );
}
