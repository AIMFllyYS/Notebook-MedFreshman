import type { Translate } from "@/lib/i18n";
import type { TaskSchedule } from "./schedule";

/**
 * 定时任务文案工具：把 TaskSchedule / 时间戳翻成「列表里那一行」的可读文本。
 * 全部是纯函数（拿 t 当参数），组件与单测共用。
 */

export function formatClock(hour: number, minute: number): string {
  const pad = (n: number) => String(Math.max(0, Math.min(59, n))).padStart(2, "0");
  return `${String(Math.max(0, Math.min(23, hour))).padStart(2, "0")}:${pad(minute)}`;
}

/** 「每 30 分钟 / 每天 09:00 / 每周三 14:00 / Cron · …」一行摘要。 */
export function describeSchedule(schedule: TaskSchedule, t: Translate): string {
  switch (schedule.kind) {
    case "interval":
      return t("agent.scheduled.everyLabel", {
        every: schedule.every,
        unit: t(`agent.scheduled.unit.${schedule.unit}`),
      });
    case "daily":
      return t("agent.scheduled.dailyLabel", { time: formatClock(schedule.hour, schedule.minute) });
    case "weekly":
      return t("agent.scheduled.weeklyLabel", {
        weekday: t(`agent.scheduled.weekday.${schedule.weekday}`),
        time: formatClock(schedule.hour, schedule.minute),
      });
    case "cron":
      return t("agent.scheduled.cronLabel", { expression: schedule.expression });
  }
}

const JUST_NOW_MS = 90_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * 相对时间：90 秒内=刚刚；之后分/时/天取整，未来的在前面带「in」。
 * 超过 30 天退化为日期时刻（再远的相对表述没意义）。
 */
export function formatRelative(ts: number, now: number, t: Translate): string {
  const diff = ts - now;
  const abs = Math.abs(diff);
  const future = diff > 0;
  if (abs < JUST_NOW_MS) return t("agent.scheduled.justNow");
  if (abs < HOUR_MS) {
    const n = Math.round(abs / 60_000);
    return future ? t("agent.scheduled.inMinutes", { n }) : t("agent.scheduled.minutesAgo", { n });
  }
  if (abs < DAY_MS) {
    const n = Math.round(abs / HOUR_MS);
    return future ? t("agent.scheduled.inHours", { n }) : t("agent.scheduled.hoursAgo", { n });
  }
  if (abs < 30 * DAY_MS) {
    const n = Math.round(abs / DAY_MS);
    return future ? t("agent.scheduled.inDays", { n }) : t("agent.scheduled.daysAgo", { n });
  }
  return formatAbsolute(ts);
}

/** 绝对时刻：M月D日 HH:mm / locale 化短日期 + 时间。 */
export function formatAbsolute(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 耗时：60 秒内「42 秒」，否则「3 分」「3 分 20 秒」。 */
export function formatDuration(ms: number, t: Translate): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  if (totalSeconds < 60) return t("agent.scheduled.durationUnit.second", { n: totalSeconds });
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const min = t("agent.scheduled.durationUnit.minute", { n: minutes });
  if (!seconds) return min;
  return `${min} ${t("agent.scheduled.durationUnit.second", { n: seconds })}`;
}
