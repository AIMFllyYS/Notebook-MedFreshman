"use client";

import { useSettings } from "@/lib/hooks/useSettings";
import { TOGGLEABLE_TOOLS as TOOLS } from "@/lib/chat/toolPresentation";
import { MAX_TOOL_ROUNDS_CAP, MAX_TOOL_STEPS, MIN_TOOL_ROUNDS } from "@/lib/ai/agent/toolRounds";
import {
  DEFAULT_MAX_WAIT_MS,
  MAX_MAX_WAIT_MS,
  MIN_MAX_WAIT_MS,
} from "@/lib/chat/createStallWatchdog";
import { Toggle, h3Cls } from "./_shared";
import { useT } from "@/lib/i18n";

export function ToolsSection() {
  const disabledTools = useSettings((s) => s.disabledTools);
  const toggleTool = useSettings((s) => s.toggleTool);
  const artifactFullscreenTarget = useSettings((s) => s.artifactFullscreenTarget);
  const setArtifactFullscreenTarget = useSettings((s) => s.setArtifactFullscreenTarget);
  const maxToolRounds = useSettings((s) => s.maxToolRounds);
  const setMaxToolRounds = useSettings((s) => s.setMaxToolRounds);
  const maxWaitMs = useSettings((s) => s.maxWaitMs);
  const setMaxWaitMs = useSettings((s) => s.setMaxWaitMs);
  const t = useT();
  const maxWaitSeconds = Math.round((maxWaitMs ?? DEFAULT_MAX_WAIT_MS) / 1000);

  return (
    <>
      <section className="flex flex-col gap-2">
        <h3 className={h3Cls}>{t("settings.tools.title")}</h3>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              {t("settings.tools.maxRounds")}
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.tools.maxRoundsDesc", { rounds: MAX_TOOL_STEPS })}
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
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{t("settings.tools.roundsUnit")}</span>
          </label>
        </div>
        <p
          data-testid="max-tool-rounds-hint"
          className="text-[11px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]"
        >
          {t("settings.tools.hint", { recommended: MAX_TOOL_STEPS, cap: MAX_TOOL_ROUNDS_CAP })}
        </p>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              {t("settings.tools.maxWait")}
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.tools.maxWaitDesc")}
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-1.5">
            <input
              type="number"
              min={MIN_MAX_WAIT_MS / 1000}
              max={MAX_MAX_WAIT_MS / 1000}
              value={maxWaitSeconds}
              onChange={(e) => setMaxWaitMs(Number(e.target.value) * 1000)}
              data-testid="max-wait-seconds"
              className="w-14 rounded-md border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2 py-1 text-right text-[12.5px] text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
            />
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{t("settings.tools.waitUnit")}</span>
          </label>
        </div>
        <p
          data-testid="max-wait-hint"
          className="text-[11px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]"
        >
          {t("settings.tools.waitHint", {
            min: MIN_MAX_WAIT_MS / 1000,
            max: MAX_MAX_WAIT_MS / 1000,
            default: DEFAULT_MAX_WAIT_MS / 1000,
          })}
        </p>
        {TOOLS.map((tool) => {
          const enabled = !disabledTools.includes(tool.name);
          return (
            <div
              key={tool.name}
              className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                  {t(tool.labelKey)}
                </div>
                <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  {t(tool.descriptionKey)}
                </div>
              </div>
              <Toggle on={enabled} onClick={() => toggleTool(tool.name, !enabled)} />
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className={h3Cls}>{t("settings.tools.demo.title")}</h3>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              {t("settings.tools.demo.target")}
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.tools.demo.targetDesc")}
            </div>
          </div>
          <div className="flex shrink-0 rounded-md bg-[var(--md-sys-color-surface-container-highest)] p-0.5">
            {([
              { id: "notes" as const, label: t("settings.tools.demo.notes") },
              { id: "viewport" as const, label: t("settings.tools.demo.viewport") },
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
