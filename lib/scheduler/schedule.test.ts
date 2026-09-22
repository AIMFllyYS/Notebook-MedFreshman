import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  MINUTE_MS,
  intervalMs,
  nextRunAfter,
  parseCronExpression,
  validateSchedule,
  type TaskSchedule,
} from "./schedule";

/**
 * 定时任务调度核心的单测：下次运行计算（interval/daily/weekly/cron）、
 * cron 解析边界（含 Vixie 日/周 OR 规则）、表单校验。
 * 全用本地时区构造时刻，不依赖 UTC —— 与实现口径一致。
 */

function at(year: number, month: number, day: number, hour = 0, minute = 0): number {
  return new Date(year, month, day, hour, minute).getTime();
}

describe("interval", () => {
  test("nextRunAfter = after + every*unit，不做墙钟对齐", () => {
    const after = at(2026, 8, 22, 10, 30);
    assert.equal(nextRunAfter({ kind: "interval", every: 5, unit: "minutes" }, after), after + 5 * MINUTE_MS);
    assert.equal(nextRunAfter({ kind: "interval", every: 2, unit: "hours" }, after), after + 2 * 60 * MINUTE_MS);
    assert.equal(nextRunAfter({ kind: "interval", every: 3, unit: "days" }, after), after + 3 * 24 * 60 * MINUTE_MS);
    assert.equal(nextRunAfter({ kind: "interval", every: 1, unit: "weeks" }, after), after + 7 * 24 * 60 * MINUTE_MS);
    assert.equal(intervalMs({ kind: "interval", every: 1, unit: "minutes" }), MINUTE_MS);
  });
});

describe("daily", () => {
  test("当天时间未到 → 今天；已过 → 明天（严格晚于 after）", () => {
    // 09:30 时下一次 10:00 = 今天 10:00
    assert.equal(
      nextRunAfter({ kind: "daily", hour: 10, minute: 0 }, at(2026, 8, 22, 9, 30)),
      at(2026, 8, 22, 10, 0),
    );
    // 10:00 整点「已过」→ 严格晚于 → 明天
    assert.equal(
      nextRunAfter({ kind: "daily", hour: 10, minute: 0 }, at(2026, 8, 22, 10, 0)),
      at(2026, 8, 23, 10, 0),
    );
    // 10:01 已错过 → 明天
    assert.equal(
      nextRunAfter({ kind: "daily", hour: 10, minute: 0 }, at(2026, 8, 22, 10, 1)),
      at(2026, 8, 23, 10, 0),
    );
  });

  test("跨月：月末当晚的下一次落到次月 1 号", () => {
    // 2026-09-30 23:00 的下一次 06:00 = 2026-10-01
    assert.equal(
      nextRunAfter({ kind: "daily", hour: 6, minute: 0 }, at(2026, 8, 30, 23, 0)),
      at(2026, 9, 1, 6, 0),
    );
  });
});

describe("weekly", () => {
  // 2026-09-22 是周二（getDay()=2）
  const TUE = at(2026, 8, 22, 8, 0);

  test("同星期当天时间未到 → 今天；已过 → 下周同一天", () => {
    // 周二 08:00，目标 周二 09:00 → 今天 09:00
    assert.equal(nextRunAfter({ kind: "weekly", weekday: 2, hour: 9, minute: 0 }, TUE), at(2026, 8, 22, 9, 0));
    // 周二 08:00，目标 周二 07:00（已过）→ 下周二 07:00
    assert.equal(nextRunAfter({ kind: "weekly", weekday: 2, hour: 7, minute: 0 }, TUE), at(2026, 8, 29, 7, 0));
  });

  test("别的星期 → 最近的下一周该日", () => {
    // 周二 08:00，目标周日 18:00 → 9/27（周日）
    assert.equal(nextRunAfter({ kind: "weekly", weekday: 0, hour: 18, minute: 0 }, TUE), at(2026, 8, 27, 18, 0));
    // 目标周一 18:00 → 9/28
    assert.equal(nextRunAfter({ kind: "weekly", weekday: 1, hour: 18, minute: 0 }, TUE), at(2026, 8, 28, 18, 0));
  });
});

describe("cron", () => {
  test("非法表达式 parseCronExpression 返回 null", () => {
    assert.equal(parseCronExpression(""), null);
    assert.equal(parseCronExpression("* * * *"), null); // 少一段
    assert.equal(parseCronExpression("* * * * * *"), null); // 多一段
    assert.equal(parseCronExpression("60 * * * *"), null); // 分钟越界
    assert.equal(parseCronExpression("* 24 * * *"), null); // 小时越界
    assert.equal(parseCronExpression("a b c d e"), null);
    assert.equal(parseCronExpression("5-1 * * * *"), null); // 反向区间
    assert.equal(parseCronExpression("*/0 * * * *"), null); // 0 步长
    assert.equal(parseCronExpression("* * 0 * *"), null); // dom 下限是 1
  });

  test("每分钟都跑：*/1 与 * 的下一分钟", () => {
    const after = at(2026, 8, 22, 10, 30);
    const cron = parseCronExpression("* * * * *")!;
    assert.equal(nextRunAfter({ kind: "cron", expression: "* * * * *" }, after), at(2026, 8, 22, 10, 31));
    assert.ok(cron.minute.any);
    assert.ok(cron.dom.any && cron.dow.any);
  });

  test("*/30 9-18 * * 1-5：工作日半点/整点", () => {
    // 周二 10:40 → 下一次 11:00
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "*/30 9-18 * * 1-5" }, at(2026, 8, 22, 10, 40)),
      at(2026, 8, 22, 11, 0),
    );
    // 周二 18:30（过了 18:30 末班车——18:30 本身命中 */30 的 :00/:30，但 after=18:30 → 严格晚于）→ 次日 09:00
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "*/30 9-18 * * 1-5" }, at(2026, 8, 22, 18, 30)),
      at(2026, 8, 23, 9, 0),
    );
    // 周六（9/26）10:00 → 周一 09:00（周末不命中）
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "*/30 9-18 * * 1-5" }, at(2026, 8, 26, 10, 0)),
      at(2026, 8, 28, 9, 0),
    );
  });

  test("日/周双限制按 Vixie OR：每月 1 号或每周一", () => {
    // 「0 9 1 * 1」= 每月 1 号 09:00 或 每周一 09:00。
    // 9/22 周二 → 下一个命中是 9/28 周一（早于 10/1）。
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "0 9 1 * 1" }, at(2026, 8, 22, 12, 0)),
      at(2026, 8, 28, 9, 0),
    );
    // 9/29 周二 → 10/1 周四 09:00（日命中）
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "0 9 1 * 1" }, at(2026, 8, 29, 12, 0)),
      at(2026, 9, 1, 9, 0),
    );
  });

  test("周日写 7 与 0 等价", () => {
    const a = nextRunAfter({ kind: "cron", expression: "0 9 * * 7" }, at(2026, 8, 22, 12, 0));
    const b = nextRunAfter({ kind: "cron", expression: "0 9 * * 0" }, at(2026, 8, 22, 12, 0));
    assert.equal(a, b);
    assert.equal(a, at(2026, 8, 27, 9, 0)); // 9/27 是周日
  });

  test("逗号列表与 a/n 步进", () => {
    // 10,20,50 分
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "10,20,50 12 * * *" }, at(2026, 8, 22, 12, 15)),
      at(2026, 8, 22, 12, 20),
    );
    // 「5/15」= 5,20,35,50
    assert.equal(
      nextRunAfter({ kind: "cron", expression: "5/15 * * * *" }, at(2026, 8, 22, 10, 6)),
      at(2026, 8, 22, 10, 20),
    );
  });
});

describe("validateSchedule", () => {
  test("合法输入返回 null", () => {
    const ok: TaskSchedule[] = [
      { kind: "interval", every: 1, unit: "minutes" },
      { kind: "interval", every: 10000, unit: "weeks" },
      { kind: "daily", hour: 0, minute: 0 },
      { kind: "daily", hour: 23, minute: 59 },
      { kind: "weekly", weekday: 0, hour: 9, minute: 30 },
      { kind: "weekly", weekday: 6, hour: 9, minute: 30 },
      { kind: "cron", expression: "*/5 * * * *" },
    ];
    for (const s of ok) assert.equal(validateSchedule(s), null, JSON.stringify(s));
  });

  test("非法输入返回原因码", () => {
    assert.equal(validateSchedule({ kind: "interval", every: 0, unit: "minutes" }), "invalid-interval");
    assert.equal(validateSchedule({ kind: "interval", every: 2.5, unit: "hours" }), "invalid-interval");
    assert.equal(validateSchedule({ kind: "interval", every: 10001, unit: "days" }), "interval-too-large");
    assert.equal(validateSchedule({ kind: "daily", hour: 24, minute: 0 }), "invalid-time");
    assert.equal(validateSchedule({ kind: "weekly", weekday: 7, hour: 9, minute: 0 }), "invalid-weekday");
    assert.equal(validateSchedule({ kind: "cron", expression: "not a cron" }), "invalid-cron");
  });
});
