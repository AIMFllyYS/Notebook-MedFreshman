/**
 * 定时任务的周期模型与「下一次运行时间」计算——纯函数，无 DOM / store 依赖。
 *
 * 周期分两类：
 * - `interval`：每 N 分钟/小时/天/周，按毫秒差向后滚（不做墙钟对齐）；
 * - `daily` / `weekly` / `cron`：本地时区的具体时间点（cron 粒度=分钟）。
 *
 * 「禁用任务不排下一次」由调用方保证（store 禁用时清空 nextRunAt）；
 * 这里只管「给定 after，下一个触发时刻是几号」。
 */

export type ScheduleUnit = "minutes" | "hours" | "days" | "weeks";

export type TaskSchedule =
  | { kind: "interval"; every: number; unit: ScheduleUnit }
  | { kind: "daily"; hour: number; minute: number }
  | { kind: "weekly"; weekday: number; hour: number; minute: number }
  | { kind: "cron"; expression: string };

export const MINUTE_MS = 60_000;

const UNIT_MS: Record<ScheduleUnit, number> = {
  minutes: MINUTE_MS,
  hours: 60 * MINUTE_MS,
  days: 24 * 60 * MINUTE_MS,
  weeks: 7 * 24 * 60 * MINUTE_MS,
};

export const MIN_INTERVAL_EVERY = 1;
export const MAX_INTERVAL_EVERY = 10_000;

/** interval 周期的实际毫秒数。 */
export function intervalMs(schedule: Extract<TaskSchedule, { kind: "interval" }>): number {
  return schedule.every * UNIT_MS[schedule.unit];
}

function nextDailyAt(after: number, hour: number, minute: number): number {
  const base = new Date(after);
  const candidate = new Date(
    base.getFullYear(), base.getMonth(), base.getDate(), hour, minute, 0, 0,
  );
  if (candidate.getTime() <= after) candidate.setDate(candidate.getDate() + 1);
  return candidate.getTime();
}

function nextWeeklyAt(after: number, weekday: number, hour: number, minute: number): number {
  const base = new Date(after);
  const candidate = new Date(
    base.getFullYear(), base.getMonth(), base.getDate(), hour, minute, 0, 0,
  );
  const delta = (weekday - candidate.getDay() + 7) % 7;
  candidate.setDate(candidate.getDate() + delta);
  // delta=0 且时间已过 → 推到下周同一天；delta>0 时 candidate 一定在未来。
  if (candidate.getTime() <= after) candidate.setDate(candidate.getDate() + 7);
  return candidate.getTime();
}

// ── cron（5 段：分 时 日 月 周）──────────────────────────────────

interface CronField {
  /** `*`：不限制（日/周字段的 any 还参与 OR 规则）。 */
  any: boolean;
  values: Set<number>;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dom: CronField;
  month: CronField;
  dow: CronField;
}

/** cron 检索上限：任何合法表达式一年内必有下一次（366 天封顶跨年闰日）。 */
const CRON_SEARCH_LIMIT_MS = 366 * 24 * 60 * MINUTE_MS;

function parseCronField(
  token: string,
  { min, max, sundayAsZero = false }: { min: number; max: number; sundayAsZero?: boolean },
): CronField | null {
  const values = new Set<number>();
  let any = false;
  for (const item of token.split(",")) {
    const trimmed = item.trim();
    if (!trimmed) return null;
    const addRange = (from: number, to: number, step: number): boolean => {
      if (step <= 0 || from > to) return false;
      for (let v = from; v <= to; v += step) {
        // 周日段允许写 7（等同 0），先归一再存。
        const normalized = sundayAsZero && v === 7 ? 0 : v;
        values.add(normalized);
      }
      return true;
    };
    if (trimmed === "*") {
      any = true;
      if (!addRange(min, max, 1)) return null;
      continue;
    }
    const stepMatch = trimmed.match(/^(.+)\/(\d+)$/);
    const step = stepMatch ? Number.parseInt(stepMatch[2], 10) : 1;
    const body = stepMatch ? stepMatch[1] : trimmed;
    if (Number.isNaN(step)) return null;
    if (body === "*") {
      if (!addRange(min, max, step)) return null;
      continue;
    }
    const rangeMatch = body.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      if (!addRange(Number.parseInt(rangeMatch[1], 10), Number.parseInt(rangeMatch[2], 10), step)) return null;
      continue;
    }
    const single = Number.parseInt(body, 10);
    if (Number.isNaN(single) || single < min || single > max) return null;
    if (stepMatch) {
      // `a/n` = a 到上限按步长取（Vixie 语义）。
      if (!addRange(single, max, step)) return null;
      continue;
    }
    values.add(sundayAsZero && single === 7 ? 0 : single);
  }
  return { any, values };
}

/**
 * 解析五段 cron（`分 时 日 月 周`）。非法返回 null——表单用它做即时校验，
 * store 收到 null 时不排期。
 * 支持：通配符、步进（`x/n`）、单值、区间 `a-b`（可带步进）、`a/n`、逗号列表；周日段 0 与 7 都表示周日。
 */
export function parseCronExpression(expression: string): ParsedCron | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const minute = parseCronField(parts[0], { min: 0, max: 59 });
  const hour = parseCronField(parts[1], { min: 0, max: 23 });
  const dom = parseCronField(parts[2], { min: 1, max: 31 });
  const month = parseCronField(parts[3], { min: 1, max: 12 });
  const dow = parseCronField(parts[4], { min: 0, max: 7, sundayAsZero: true });
  if (!minute || !hour || !dom || !month || !dow) return null;
  return { minute, hour, dom, month, dow };
}

function cronMatches(cron: ParsedCron, date: Date): boolean {
  if (!cron.minute.values.has(date.getMinutes())) return false;
  if (!cron.hour.values.has(date.getHours())) return false;
  if (!cron.month.values.has(date.getMonth() + 1)) return false;
  // Vixie OR 规则：日、周两段都被限制时，任一命中即可；只有一段被限制时以它为准。
  const { dom, dow } = cron;
  if (dom.any && dow.any) return true;
  const domHit = dom.values.has(date.getDate());
  const dowHit = dow.values.has(date.getDay());
  if (dom.any) return dowHit;
  if (dow.any) return domHit;
  return domHit || dowHit;
}

/** cron 的下一个触发时刻（分钟粒度，严格晚于 after）。找不到返回 null。 */
export function nextCronAt(cron: ParsedCron, after: number): number | null {
  const end = after + CRON_SEARCH_LIMIT_MS;
  let t = Math.floor(after / MINUTE_MS) * MINUTE_MS + MINUTE_MS;
  while (t <= end) {
    if (cronMatches(cron, new Date(t))) return t;
    t += MINUTE_MS;
  }
  return null;
}

// ── 统一入口 ─────────────────────────────────────────────────────

/**
 * 给定「上一次触发/当前时刻」算下一次运行。
 * cron 表达式非法时返回 null：调用方据此不排期（而不是静默跑一个错误周期）。
 */
export function nextRunAfter(schedule: TaskSchedule, after: number): number | null {
  switch (schedule.kind) {
    case "interval":
      return after + intervalMs(schedule);
    case "daily":
      return nextDailyAt(after, schedule.hour, schedule.minute);
    case "weekly":
      return nextWeeklyAt(after, schedule.weekday, schedule.hour, schedule.minute);
    case "cron": {
      const cron = parseCronExpression(schedule.expression);
      return cron ? nextCronAt(cron, after) : null;
    }
  }
}

/** 表单即时校验：返回 null=合法，否则是非法原因（给 UI 做提示，不进词典）。 */
export function validateSchedule(schedule: TaskSchedule): string | null {
  switch (schedule.kind) {
    case "interval": {
      const { every } = schedule;
      if (!Number.isFinite(every) || !Number.isInteger(every) || every < MIN_INTERVAL_EVERY) {
        return "invalid-interval";
      }
      if (every > MAX_INTERVAL_EVERY) return "interval-too-large";
      return null;
    }
    case "daily":
      return schedule.hour >= 0 && schedule.hour <= 23 && schedule.minute >= 0 && schedule.minute <= 59
        ? null
        : "invalid-time";
    case "weekly":
      if (schedule.weekday < 0 || schedule.weekday > 6) return "invalid-weekday";
      return schedule.hour >= 0 && schedule.hour <= 23 && schedule.minute >= 0 && schedule.minute <= 59
        ? null
        : "invalid-time";
    case "cron":
      return parseCronExpression(schedule.expression) ? null : "invalid-cron";
  }
}
