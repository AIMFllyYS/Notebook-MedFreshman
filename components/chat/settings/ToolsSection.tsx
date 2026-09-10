"use client";

import { useSettings } from "@/lib/hooks/useSettings";
import { TOGGLEABLE_TOOLS as TOOLS } from "@/lib/chat/toolPresentation";
import { Toggle, h3Cls } from "./_shared";

export function ToolsSection() {
  const disabledTools = useSettings((s) => s.disabledTools);
  const toggleTool = useSettings((s) => s.toggleTool);
  const artifactFullscreenTarget = useSettings((s) => s.artifactFullscreenTarget);
  const setArtifactFullscreenTarget = useSettings((s) => s.setArtifactFullscreenTarget);

  return (
    <>
      <section className="flex flex-col gap-2">
        <h3 className={h3Cls}>工具调用</h3>
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
