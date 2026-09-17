"use client";

import { useSettings } from "@/lib/hooks/useSettings";
import { TOGGLEABLE_TOOLS as TOOLS } from "@/lib/chat/toolPresentation";
import { MAX_TOOL_ROUNDS_CAP, MAX_TOOL_STEPS, MIN_TOOL_ROUNDS } from "@/lib/ai/agent/toolRounds";
import { Toggle, h3Cls } from "./_shared";

export function ToolsSection() {
  const disabledTools = useSettings((s) => s.disabledTools);
  const toggleTool = useSettings((s) => s.toggleTool);
  const artifactFullscreenTarget = useSettings((s) => s.artifactFullscreenTarget);
  const setArtifactFullscreenTarget = useSettings((s) => s.setArtifactFullscreenTarget);
  const maxToolRounds = useSettings((s) => s.maxToolRounds);
  const setMaxToolRounds = useSettings((s) => s.setMaxToolRounds);

  return (
    <>
      <section className="flex flex-col gap-2">
        <h3 className={h3Cls}>工具调用</h3>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              最大工具调用轮数
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              接到 Agent ToolLoop（默认 {MAX_TOOL_STEPS} 轮）。斜杠 / 加号菜单读不到此值时仍走本设置。
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-1.5">
            <input
              type="number"
              min={MIN_TOOL_ROUNDS}
              max={MAX_TOOL_ROUNDS_CAP}
              value={maxToolRounds}
              onChange={(e) => setMaxToolRounds(Number(e.target.value))}
              data-testid="max-tool-rounds"
              className="w-14 rounded-md border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2 py-1 text-right text-[12.5px] text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
            />
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">轮</span>
          </label>
        </div>
        <p
          data-testid="max-tool-rounds-hint"
          className="text-[11px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]"
        >
          推荐 {MAX_TOOL_STEPS} 轮：与 studyAgent 默认一致，一般问答够用。
          上限 {MAX_TOOL_ROUNDS_CAP} 轮对齐 AI SDK ToolLoopAgent 的默认 stopWhen，再高没有架构适配收益。
        </p>
        {TOOLS.map((t) => {
          const enabled = !disabledTools.includes(t.name);
          return (
            <div
              key={t.name}
              className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                  {t.label}
                </div>
                <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  {t.desc}
                </div>
              </div>
              <Toggle on={enabled} onClick={() => toggleTool(t.name, !enabled)} />
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className={h3Cls}>HTML 演示窗口</h3>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              演示全屏时覆盖
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Artifact 是 AppShell 挂到页面的全局浮窗，不属于笔记区或右侧面板
            </div>
          </div>
          <div className="flex shrink-0 rounded-md bg-[var(--md-sys-color-surface-container-highest)] p-0.5">
            {([
              { id: "notes" as const, label: "笔记区" },
              { id: "viewport" as const, label: "整个窗口" },
            ]).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setArtifactFullscreenTarget(opt.id)}
                className={
                  "rounded px-2 py-1 text-[11px] font-medium " +
                  (artifactFullscreenTarget === opt.id
                    ? "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-sm"
                    : "text-[var(--md-sys-color-on-surface-variant)]")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
