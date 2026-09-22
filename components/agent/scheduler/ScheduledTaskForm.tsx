"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/lib/i18n";
import type { ScheduledTaskInput } from "@/lib/stores/scheduledTasks";
import type { ScheduleUnit, TaskSchedule } from "@/lib/scheduler/schedule";
import { validateSchedule } from "@/lib/scheduler/schedule";

/**
 * 定时任务的新建/编辑对话框。
 * 调度选择器按 Codex 习惯分两层：常用预设（每隔 N / 每天 / 每周）为主，
 * cron 只在高级模式里露出来；表单即时校验，保存按钮在非法输入下直接置灰。
 */

const UNITS: ScheduleUnit[] = ["minutes", "hours", "days", "weeks"];
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

type FormKind = TaskSchedule["kind"];

export interface ScheduledTaskFormProps {
  /** 传了就按它初始化（编辑）；不传是新建。 */
  initial?: ScheduledTaskInput;
  title: string;
  submitLabel: string;
  onSubmit: (input: ScheduledTaskInput) => void;
  onCancel: () => void;
}

interface Draft {
  name: string;
  prompt: string;
  kind: FormKind;
  every: number;
  unit: ScheduleUnit;
  hour: number;
  minute: number;
  weekday: number;
  cron: string;
  enabled: boolean;
}

function toDraft(initial?: ScheduledTaskInput): Draft {
  const base: Draft = {
    name: initial?.name ?? "",
    prompt: initial?.prompt ?? "",
    kind: "interval",
    every: 30,
    unit: "minutes",
    hour: 9,
    minute: 0,
    weekday: 1,
    cron: "*/30 9-18 * * 1-5",
    enabled: initial?.enabled ?? true,
  };
  const s = initial?.schedule;
  if (!s) return base;
  if (s.kind === "interval") return { ...base, kind: "interval", every: s.every, unit: s.unit };
  if (s.kind === "daily") return { ...base, kind: "daily", hour: s.hour, minute: s.minute };
  if (s.kind === "weekly") return { ...base, kind: "weekly", weekday: s.weekday, hour: s.hour, minute: s.minute };
  return { ...base, kind: "cron", cron: s.expression };
}

function draftSchedule(draft: Draft): TaskSchedule {
  if (draft.kind === "interval") return { kind: "interval", every: draft.every, unit: draft.unit };
  if (draft.kind === "daily") return { kind: "daily", hour: draft.hour, minute: draft.minute };
  if (draft.kind === "weekly") return { kind: "weekly", weekday: draft.weekday, hour: draft.hour, minute: draft.minute };
  return { kind: "cron", expression: draft.cron.trim() };
}

const FIELD_CLASS =
  "w-full rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel)] px-2.5 py-1.5 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--md-sys-color-primary)]";

export default function ScheduledTaskForm({ initial, title, submitLabel, onSubmit, onCancel }: ScheduledTaskFormProps) {
  const t = useT();
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));

  const schedule = useMemo(() => draftSchedule(draft), [draft]);
  const scheduleError = validateSchedule(schedule);
  const valid = draft.name.trim().length > 0 && draft.prompt.trim().length > 0 && scheduleError === null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const patch = (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next }));

  const kinds: { id: FormKind; label: string }[] = [
    { id: "interval", label: t("agent.scheduled.kind.interval") },
    { id: "daily", label: t("agent.scheduled.kind.daily") },
    { id: "weekly", label: t("agent.scheduled.kind.weekly") },
    { id: "cron", label: t("agent.scheduled.kind.cron") },
  ];

  const dialog = (
    <div
      className="app-dialog-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="scheduled-task-form"
        className="app-dialog flex w-[min(480px,100%)] flex-col gap-3.5"
      >
        <h2 className="m-0 text-[17px] font-semibold text-[var(--ink)]">{title}</h2>

        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-medium text-[var(--ink-soft)]">{t("agent.scheduled.name")}</span>
          <input
            autoFocus
            value={draft.name}
            maxLength={60}
            placeholder={t("agent.scheduled.namePlaceholder")}
            onChange={(e) => patch({ name: e.target.value })}
            className={FIELD_CLASS}
            data-testid="scheduled-name"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-medium text-[var(--ink-soft)]">{t("agent.scheduled.prompt")}</span>
          <textarea
            value={draft.prompt}
            rows={4}
            maxLength={4000}
            placeholder={t("agent.scheduled.promptPlaceholder")}
            onChange={(e) => patch({ prompt: e.target.value })}
            className={`${FIELD_CLASS} resize-y leading-relaxed`}
            data-testid="scheduled-prompt"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 rounded-lg border border-[var(--line-soft)] p-0.5">
            {kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={draft.kind === k.id}
                onClick={() => patch({ kind: k.id })}
                className={`press flex-1 rounded-md px-2 py-1 text-[12px] font-medium ${
                  draft.kind === k.id
                    ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
                }`}
                data-testid={`scheduled-kind-${k.id}`}
              >
                {k.label}
              </button>
            ))}
          </div>

          {draft.kind === "interval" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10000}
                value={draft.every}
                onChange={(e) => patch({ every: Number(e.target.value) })}
                className={`${FIELD_CLASS} w-24 text-center`}
                aria-label={t("agent.scheduled.every")}
                data-testid="scheduled-every"
              />
              <select
                value={draft.unit}
                onChange={(e) => patch({ unit: e.target.value as ScheduleUnit })}
                className="h-8 rounded-lg border border-[var(--line-soft)] bg-transparent px-2 text-[12.5px] text-[var(--ink)] outline-none"
                aria-label={t("agent.scheduled.unitField")}
                data-testid="scheduled-unit"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {t(`agent.scheduled.unit.${u}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {draft.kind === "daily" && (
            <input
              type="time"
              value={`${String(draft.hour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                if (Number.isFinite(h) && Number.isFinite(m)) patch({ hour: h, minute: m });
              }}
              className={`${FIELD_CLASS} w-32`}
              aria-label={t("agent.scheduled.time")}
              data-testid="scheduled-time"
            />
          )}

          {draft.kind === "weekly" && (
            <div className="flex items-center gap-2">
              <select
                value={draft.weekday}
                onChange={(e) => patch({ weekday: Number(e.target.value) })}
                className="h-8 rounded-lg border border-[var(--line-soft)] bg-transparent px-2 text-[12.5px] text-[var(--ink)] outline-none"
                aria-label={t("agent.scheduled.weekdayField")}
                data-testid="scheduled-weekday"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {t(`agent.scheduled.weekday.${d}`)}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={`${String(draft.hour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  if (Number.isFinite(h) && Number.isFinite(m)) patch({ hour: h, minute: m });
                }}
                className={`${FIELD_CLASS} w-32`}
                aria-label={t("agent.scheduled.time")}
                data-testid="scheduled-time-weekly"
              />
            </div>
          )}

          {draft.kind === "cron" && (
            <input
              value={draft.cron}
              placeholder={t("agent.scheduled.cronPlaceholder")}
              onChange={(e) => patch({ cron: e.target.value })}
              className={`${FIELD_CLASS} font-mono text-[12.5px]`}
              aria-label={t("agent.scheduled.kind.cron")}
              data-testid="scheduled-cron"
            />
          )}
        </div>

        {scheduleError ? (
          <p className="m-0 text-[11.5px] text-[var(--md-sys-color-error)]">
            {scheduleError === "invalid-cron" ? t("agent.scheduled.cronInvalid") : t("agent.scheduled.invalidSchedule")}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={draft.enabled}
            onClick={() => patch({ enabled: !draft.enabled })}
            className="flex items-center gap-2 text-[12.5px] text-[var(--ink-soft)]"
            data-testid="scheduled-enabled"
          >
            <span
              aria-hidden
              className={`relative h-[18px] w-[32px] rounded-full transition-colors ${
                draft.enabled ? "bg-[var(--md-sys-color-primary)]" : "bg-[var(--line)]"
              }`}
            >
              <span
                className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${
                  draft.enabled ? "left-[16px]" : "left-[2px]"
                }`}
              />
            </span>
            {t("agent.scheduled.enable")}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-[12.5px] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={!valid}
              onClick={() => {
                if (!valid) return;
                onSubmit({
                  name: draft.name,
                  prompt: draft.prompt,
                  schedule,
                  enabled: draft.enabled,
                });
              }}
              className="press rounded-lg bg-[var(--md-sys-color-primary)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--md-sys-color-on-primary)] disabled:opacity-45"
              data-testid="scheduled-submit"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
