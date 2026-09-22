import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { __resetIdbStoragePendingForTests } from "@/lib/storage/idbStorage";
import {
  DELAYED_AFTER_MS,
  MAX_SCHEDULED_TASKS,
  RETRY_DELAY_MS,
  RUN_STALE_MS,
  useScheduledTasks,
  type ScheduledTask,
} from "./scheduledTasks";

/**
 * 调度器 store 的单测：到期判定、并发上限、页面休眠漏跑补偿（delayed）、
 * stale → interrupted、失败重试一次、禁用的边界。
 * 时间全部走注入的 `now` 参数 —— 不打 fake timers，可读性更好。
 */

function resetStore() {
  useScheduledTasks.setState({ order: [], byId: {}, _hasHydrated: true });
}

beforeEach(() => {
  (globalThis as { window?: unknown }).window = { addEventListener: () => {} };
  (globalThis as { document?: unknown }).document = {
    addEventListener: () => {},
    visibilityState: "visible",
  };
  (globalThis as { indexedDB?: object }).indexedDB = {};
  resetStore();
});

afterEach(() => {
  __resetIdbStoragePendingForTests();
  resetStore();
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { document?: unknown }).document;
  delete (globalThis as { indexedDB?: object }).indexedDB;
});

const NOW = new Date(2026, 8, 22, 10, 0, 0).getTime();
const EVERY_MINUTE: import("./scheduledTasks").TaskSchedule = { kind: "interval", every: 1, unit: "minutes" };

function addTask(overrides: Partial<import("./scheduledTasks").ScheduledTaskInput> = {}, now = NOW): string {
  const id = useScheduledTasks.getState().upsert(
    {
      name: overrides.name ?? `task-${now}`,
      prompt: overrides.prompt ?? "整理一下笔记",
      schedule: overrides.schedule ?? EVERY_MINUTE,
      enabled: overrides.enabled ?? true,
      ...overrides,
    },
    now,
  );
  assert.ok(id, "upsert 应返回任务 id");
  return id;
}

function task(id: string): ScheduledTask {
  const t = useScheduledTasks.getState().byId[id];
  assert.ok(t);
  return t;
}

test("upsert 建任务：写 nextRunAt，tick 到期领取", () => {
  const id = addTask();
  const t1 = task(id);
  assert.equal(t1.nextRunAt, NOW + 60_000);
  assert.equal(t1.lastRunAt, undefined);

  // 未到点不领取
  assert.deepEqual(useScheduledTasks.getState().tick({ now: NOW + 30_000 }), []);

  // 到点领取一条 running
  const claimed = useScheduledTasks.getState().tick({ now: NOW + 60_000 });
  assert.equal(claimed.length, 1);
  assert.equal(claimed[0].taskId, id);
  assert.equal(claimed[0].prompt, "整理一下笔记");
  const t2 = task(id);
  assert.equal(t2.runHistory.length, 1);
  assert.equal(t2.runHistory[0].status, "running");
  assert.equal(t2.runHistory[0].delayed, false);
  // 领取即推进下一次：同任务不会在同 tick 里连环补跑
  assert.equal(t2.nextRunAt, NOW + 120_000);
  assert.equal(t2.lastRunAt, NOW + 60_000);
});

test("漏跑补偿：页面休眠醒来后只补一次、标 delayed，并从现在重排", () => {
  const id = addTask();
  // 「睡了一小时」：nextRunAt 早就过了
  const wake = NOW + 60 * 60_000;
  const claimed = useScheduledTasks.getState().tick({ now: wake });
  assert.equal(claimed.length, 1);
  const t = task(id);
  const run = t.runHistory[0];
  assert.equal(run.status, "running");
  assert.equal(run.scheduledFor, NOW + 60_000); // 记的是计划班次
  assert.ok(run.startedAt - run.scheduledFor > DELAYED_AFTER_MS);
  assert.equal(run.delayed, true);
  // 下一次从「醒来的时刻」排，不逐个追补
  assert.equal(t.nextRunAt, wake + 60_000);
});

test("hidden=true 只扫 stale 不派发；回到前台再补跑", () => {
  const id = addTask();
  const claimed = useScheduledTasks.getState().tick({ now: NOW + 60_000, hidden: true });
  assert.equal(claimed.length, 0);
  assert.equal(task(id).runHistory.length, 0);
  // 可见后补跑（此时已过计划时刻，delayed 是否置位取决于迟了多久）
  const claimed2 = useScheduledTasks.getState().tick({ now: NOW + 60_000, hidden: false });
  assert.equal(claimed2.length, 1);
});

test("并发上限：最多 MAX 个任务同时在跑，超额排队", () => {
  const ids = [addTask(), addTask(), addTask()];
  // 三条都到期
  const claimed1 = useScheduledTasks.getState().tick({ now: NOW + 60_000, maxConcurrent: 2 });
  assert.equal(claimed1.length, 2);
  // 第三条还在跑/等下个槽：本 tick 内不再领取
  const claimed2 = useScheduledTasks.getState().tick({ now: NOW + 60_000, maxConcurrent: 2 });
  assert.equal(claimed2.length, 0);
  // 完成一条 → 空出一个槽，下一个 tick 领取第三条
  const firstTaskId = claimed1[0].taskId;
  const firstRunId = claimed1[0].runId;
  useScheduledTasks.getState().completeRun({ taskId: firstTaskId, runId: firstRunId, ok: true, now: NOW + 61_000 });
  const claimed3 = useScheduledTasks.getState().tick({ now: NOW + 61_000, maxConcurrent: 2 });
  assert.equal(claimed3.length, 1);
  assert.equal(claimed3[0].taskId, ids[2]);
});

test("同一任务正在跑时不重叠领取", () => {
  const id = addTask();
  useScheduledTasks.getState().tick({ now: NOW + 60_000 });
  // 再过一个周期：run 还在跑 → 不领第二条
  const claimed = useScheduledTasks.getState().tick({ now: NOW + 120_000 });
  assert.equal(claimed.length, 0);
  assert.equal(task(id).runHistory.length, 1);
});

test("心跳失联超时 → interrupted，且不消耗重试额度", () => {
  const id = addTask();
  const [claimed] = useScheduledTasks.getState().tick({ now: NOW + 60_000 });
  useScheduledTasks.getState().attachSession(id, claimed.runId, "sess-1");

  // 心跳一直更新 → 不判失联
  useScheduledTasks.getState().heartbeatRun(id, claimed.runId, NOW + 100_000);
  useScheduledTasks.getState().tick({ now: NOW + 100_000 + RUN_STALE_MS });
  assert.equal(task(id).runHistory[0].status, "running");

  // 心跳停更超过 RUN_STALE_MS → interrupted
  useScheduledTasks.getState().tick({ now: NOW + 100_000 + RUN_STALE_MS + 1 });
  const t = task(id);
  assert.equal(t.runHistory[0].status, "interrupted");
  assert.equal(t.retryAttempts, 0);
});

test("失败自动重试一次；再失败回归正常排程", () => {
  const id = addTask();
  const [c1] = useScheduledTasks.getState().tick({ now: NOW + 60_000 });
  useScheduledTasks.getState().attachSession(id, c1.runId, "s1");
  useScheduledTasks.getState().completeRun({ taskId: id, runId: c1.runId, ok: false, error: "boom", now: NOW + 61_000 });

  let t = task(id);
  assert.equal(t.runHistory[0].status, "error");
  assert.equal(t.retryAttempts, 1);
  // 重试时间 = 失败时刻 + RETRY_DELAY_MS（盖过原排程）
  assert.equal(t.nextRunAt, NOW + 61_000 + RETRY_DELAY_MS);

  // 重试到点再跑；这次也失败 → 回到原排程、不再重试
  const [c2] = useScheduledTasks.getState().tick({ now: NOW + 61_000 + RETRY_DELAY_MS });
  assert.equal(c2.taskId, id);
  useScheduledTasks.getState().attachSession(id, c2.runId, "s2");
  useScheduledTasks.getState().completeRun({
    taskId: id, runId: c2.runId, ok: false, error: "again", now: NOW + 62_000 + RETRY_DELAY_MS,
  });
  t = task(id);
  assert.equal(t.retryAttempts, 0);
  assert.equal(t.runHistory.length, 2);
  assert.equal(t.runHistory[1].status, "error");
  // 正常排程：从上次 claim 推进的 nextRunAt（claim 时已过）
  assert.ok(t.nextRunAt !== undefined && t.nextRunAt > NOW + 62_000 + RETRY_DELAY_MS);
});

test("禁用：清空 nextRunAt、不派发；重新启用后重排", () => {
  const id = addTask();
  useScheduledTasks.getState().setEnabled(id, false, NOW + 30_000);
  assert.equal(task(id).nextRunAt, undefined);
  assert.deepEqual(useScheduledTasks.getState().tick({ now: NOW + 600_000 }), []);
  useScheduledTasks.getState().setEnabled(id, true, NOW + 600_000);
  assert.equal(task(id).nextRunAt, NOW + 660_000);
});

test("runNow 手动触发：不动排程，受并发约束", () => {
  const id = addTask();
  const claimed = useScheduledTasks.getState().runNow(id, NOW + 10_000);
  assert.ok(claimed);
  const t = task(id);
  assert.equal(t.runHistory[0].scheduledFor, NOW + 10_000);
  assert.equal(t.runHistory[0].delayed, false);
  // 手动跑不改下次计划班次
  assert.equal(t.nextRunAt, NOW + 60_000);
  // 正在跑时不能再次 runNow
  assert.equal(useScheduledTasks.getState().runNow(id, NOW + 11_000), null);
});

test("任务上限与清空历史", () => {
  for (let i = 0; i < MAX_SCHEDULED_TASKS; i++) addTask({ name: `t${i}` });
  assert.equal(
    useScheduledTasks.getState().upsert({ name: "extra", prompt: "x", schedule: EVERY_MINUTE }),
    null,
  );
  const id = Object.keys(useScheduledTasks.getState().byId)[0];
  assert.ok(id);
  useScheduledTasks.getState().tick({ now: NOW + 60_000 });
  const t = task(id);
  useScheduledTasks.getState().completeRun({
    taskId: id, runId: t.runHistory[0].id, ok: true, now: NOW + 62_000,
  });
  useScheduledTasks.getState().clearHistory(id);
  assert.equal(task(id).runHistory.length, 0);
});

test("capHistory：runHistory 最多留 20 条", () => {
  const id = addTask();
  // 塞 25 条假历史
  useScheduledTasks.setState((s) => ({
    byId: {
      ...s.byId,
      [id]: {
        ...s.byId[id],
        runHistory: Array.from({ length: 25 }, (_, i) => ({
          id: `r${i}`,
          scheduledFor: i,
          prompt: "p",
          startedAt: i,
          finishedAt: i,
          status: "success" as const,
          delayed: false,
          heartbeatAt: i,
          artifactIds: [],
        })),
      },
    },
  }));
  const [claimed] = useScheduledTasks.getState().tick({ now: NOW + 60_000 });
  assert.ok(claimed);
  const t = task(id);
  assert.equal(t.runHistory.length, 20);
  assert.equal(t.runHistory[t.runHistory.length - 1].id, claimed.runId);
});
