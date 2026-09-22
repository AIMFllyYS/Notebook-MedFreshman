import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { createPersistedStore } from "@/lib/stores/_persist";
import { nextRunAfter, type TaskSchedule } from "@/lib/scheduler/schedule";

/**
 * Agent 定时任务：任务定义 + 运行历史，Storage v2（IndexedDB）持久化。
 *
 * 调度是**客户端常驻**的（产品口径：不做服务端常驻调度）——页面关闭/离线就不跑；
 * 页面挂后台标签页也不派发新的运行，回到前台才补跑一次（运行记录上标 delayed）。
 *
 * 会话归属：每次运行落到 `project-scheduled` 系统项目下的 kind='scheduled' 会话
 * （见 chatHistory.createSession），不抢占用户当前 active 对话。
 *
 * 并发：最多 MAX_CONCURRENT_RUNS 个任务同时在跑；同一任务的两次运行不重叠。
 * 心跳：运行中的 run 由 driver 周期性写 heartbeatAt；页面崩了/关了，
 * 下次 tick 发现心跳失联超过 RUN_STALE_MS → 标记 interrupted（而不是永远 running）。
 */

export type { TaskSchedule } from "@/lib/scheduler/schedule";

export type ScheduledRunStatus = "running" | "success" | "error" | "interrupted";

export interface ScheduledRun {
  id: string;
  /** 计划触发时刻（补跑的 delayed 运行会明显晚于它）。手动触发 = 点击时刻。 */
  scheduledFor: number;
  /** 派发时刻的 prompt 快照：历史里看的是「当时跑了什么」，不随任务后续编辑改变。 */
  prompt: string;
  startedAt: number;
  finishedAt?: number;
  status: ScheduledRunStatus;
  /** 比计划晚 DELAYED_AFTER_MS 以上才触发（页面休眠/隐藏期间错过班次）。 */
  delayed: boolean;
  /** driver 心跳；失联超时 → interrupted。 */
  heartbeatAt: number;
  /** 这次运行落地的会话（kind='scheduled'），UI 里「查看对话」跳 /c/<id>。 */
  sessionId?: string;
  summary?: string;
  error?: string;
  artifactIds: string[];
}

export interface ScheduledTask {
  id: string;
  name: string;
  /** 发给 agent 的指令原文。 */
  prompt: string;
  schedule: TaskSchedule;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  lastRunAt?: number;
  /** 下一次计划触发时刻；禁用时为空（不显示/不派发）。 */
  nextRunAt?: number;
  /** 失败重试计数：一次计划槽位最多自动重试 RETRY_MAX 次。 */
  retryAttempts: number;
  runHistory: ScheduledRun[];
}

export interface ScheduledTaskInput {
  name: string;
  prompt: string;
  schedule: TaskSchedule;
  enabled?: boolean;
}

/** tick 领取结果：runtime 据此建会话、挂 driver。 */
export interface ClaimedRun {
  taskId: string;
  runId: string;
  prompt: string;
  taskName: string;
}

export const MAX_SCHEDULED_TASKS = 50;
/** 每个任务保留的最近运行条数（IndexedDB 体积上界）。 */
export const RUN_HISTORY_LIMIT = 20;
export const MAX_CONCURRENT_RUNS = 2;
export const RUN_HEARTBEAT_MS = 15_000;
export const RUN_STALE_MS = 120_000;
/** 比计划晚这么多触发 → 记 delayed（约 1 个 cron 粒度）。 */
export const DELAYED_AFTER_MS = 60_000;
/** 失败后自动重试一次的等待时长。 */
export const RETRY_DELAY_MS = 5 * 60_000;
const RETRY_MAX = 1;

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function capHistory(runs: ScheduledRun[]): ScheduledRun[] {
  return runs.length > RUN_HISTORY_LIMIT ? runs.slice(runs.length - RUN_HISTORY_LIMIT) : runs;
}

function hasRunningRun(task: ScheduledTask): boolean {
  return task.runHistory.some((run) => run.status === "running");
}

interface ScheduledTasksState {
  order: string[];
  byId: Record<string, ScheduledTask>;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  upsert: (input: ScheduledTaskInput & { id?: string }, now?: number) => string | null;
  remove: (id: string) => void;
  setEnabled: (id: string, enabled: boolean, now?: number) => void;
  /**
   * 一次 tick：先把失联的运行标记 interrupted，再按空闲并发槽领取到期任务。
   * hidden=true（后台标签页）只扫失联、不派发——错过的班次下次可见时以 delayed 补跑。
   * 返回新领取的运行（sessionId 由 runtime 另行 attach）。
   */
  tick: (input: { now: number; hidden?: boolean; maxConcurrent?: number }) => ClaimedRun[];
  /** 手动「立即运行」：不动 nextRunAt 排程，仍受并发上限约束。 */
  runNow: (id: string, now?: number) => ClaimedRun | null;
  attachSession: (taskId: string, runId: string, sessionId: string) => void;
  heartbeatRun: (taskId: string, runId: string, now?: number) => void;
  completeRun: (input: {
    taskId: string;
    runId: string;
    ok: boolean;
    sessionId?: string;
    summary?: string;
    error?: string;
    artifactIds?: string[];
    now?: number;
  }) => void;
  clearHistory: (id: string) => void;
}

export const useScheduledTasks = createPersistedStore<ScheduledTasksState>(
  (set, get) => {
    /** 把 now 时刻心跳失联的运行标记 interrupted；返回改后的 byId（没变则原样）。 */
    const sweepStale = (
      byId: Record<string, ScheduledTask>,
      now: number,
      staleMs: number,
    ): Record<string, ScheduledTask> => {
      let changed: Record<string, ScheduledTask> | null = null;
      for (const task of Object.values(byId)) {
        const stale = task.runHistory.some(
          (run) => run.status === "running" && now - run.heartbeatAt > staleMs,
        );
        if (!stale) continue;
        const next: ScheduledTask = {
          ...task,
          // 中断的运行不算失败、不消耗重试额度。
          retryAttempts: 0,
          runHistory: task.runHistory.map((run) =>
            run.status === "running" && now - run.heartbeatAt > staleMs
              ? { ...run, status: "interrupted", finishedAt: now }
              : run,
          ),
        };
        changed = changed ?? { ...byId };
        changed[task.id] = next;
      }
      return changed ?? byId;
    };

    const claim = (
      task: ScheduledTask,
      scheduledFor: number,
      now: number,
      delayed: boolean,
    ): { task: ScheduledTask; claimed: ClaimedRun } => {
      const run: ScheduledRun = {
        id: genId("run"),
        scheduledFor,
        prompt: task.prompt,
        startedAt: now,
        status: "running",
        delayed,
        heartbeatAt: now,
        artifactIds: [],
      };
      return {
        claimed: { taskId: task.id, runId: run.id, prompt: task.prompt, taskName: task.name },
        task: {
          ...task,
          updatedAt: now,
          lastRunAt: now,
          // 跳过的班次不逐个补：从「现在」排下一次（漏跑只补一次，见产品口径）。
          nextRunAt: nextRunAfter(task.schedule, now) ?? undefined,
          runHistory: capHistory([...task.runHistory, run]),
        },
      };
    };

    return {
      order: [],
      byId: {},
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      upsert: (input, now = Date.now()) => {
        const name = input.name.trim();
        const prompt = input.prompt.trim();
        if (!name || !prompt) return null;
        const state = get();
        const enabled = input.enabled ?? (input.id ? state.byId[input.id]?.enabled ?? true : true);
        const nextRunAt = enabled ? nextRunAfter(input.schedule, now) ?? undefined : undefined;
        if (input.id && state.byId[input.id]) {
          const existing = state.byId[input.id];
          const scheduleChanged = JSON.stringify(existing.schedule) !== JSON.stringify(input.schedule);
          const enableChanged = existing.enabled !== enabled;
          set((s) => ({
            byId: {
              ...s.byId,
              [input.id!]: {
                ...existing,
                name,
                prompt,
                schedule: input.schedule,
                enabled,
                updatedAt: now,
                // 改了周期或启停才重排；只改名/prompt 不动既有节奏（下一次还按原计划到点）。
                // 缺 nextRunAt（比如旧数据）时补排一次，不让启用中的任务永远空转。
                nextRunAt:
                  scheduleChanged || enableChanged || (enabled && !existing.nextRunAt)
                    ? nextRunAt
                    : existing.nextRunAt,
                retryAttempts: scheduleChanged || enableChanged ? 0 : existing.retryAttempts,
              },
            },
          }));
          return input.id;
        }
        if (state.order.length >= MAX_SCHEDULED_TASKS) return null;
        const id = genId("task");
        const task: ScheduledTask = {
          id,
          name,
          prompt,
          schedule: input.schedule,
          enabled,
          createdAt: now,
          updatedAt: now,
          nextRunAt,
          retryAttempts: 0,
          runHistory: [],
        };
        set((s) => ({ byId: { ...s.byId, [id]: task }, order: [...s.order, id] }));
        return id;
      },

      remove: (id) =>
        set((state) => {
          if (!state.byId[id]) return state;
          const byId = { ...state.byId };
          delete byId[id];
          return { byId, order: state.order.filter((item) => item !== id) };
        }),

      setEnabled: (id, enabled, now = Date.now()) =>
        set((state) => {
          const task = state.byId[id];
          if (!task || task.enabled === enabled) return state;
          return {
            byId: {
              ...state.byId,
              [id]: {
                ...task,
                enabled,
                updatedAt: now,
                // 启用即从现在重排（沿用创建/上次语义）；禁用清空——UI 也就不显示「下次运行」。
                nextRunAt: enabled ? nextRunAfter(task.schedule, now) ?? undefined : undefined,
                retryAttempts: 0,
              },
            },
          };
        }),

      tick: ({ now, hidden = false, maxConcurrent = MAX_CONCURRENT_RUNS }) => {
        const state = get();
        const byId = sweepStale(state.byId, now, RUN_STALE_MS);
        if (byId !== state.byId) set({ byId });
        if (hidden || !state._hasHydrated) return [];
        const latest = get().byId;
        const runningCount = Object.values(latest).filter(hasRunningRun).length;
        const slots = maxConcurrent - runningCount;
        if (slots <= 0) return [];
        const due = state.order
          .map((id) => latest[id])
          .filter((task): task is ScheduledTask =>
            Boolean(task) && task.enabled && !hasRunningRun(task) && task.nextRunAt !== undefined && task.nextRunAt <= now,
          )
          .sort((a, b) => (a.nextRunAt ?? 0) - (b.nextRunAt ?? 0))
          .slice(0, slots);
        if (due.length === 0) return [];
        const claimed: ClaimedRun[] = [];
        const nextById = { ...latest };
        for (const task of due) {
          const scheduledFor = task.nextRunAt ?? now;
          const result = claim(task, scheduledFor, now, now - scheduledFor > DELAYED_AFTER_MS);
          nextById[task.id] = result.task;
          claimed.push(result.claimed);
        }
        set({ byId: nextById });
        return claimed;
      },

      runNow: (id, now = Date.now()) => {
        const state = get();
        const task = state.byId[id];
        if (!task || !state._hasHydrated || hasRunningRun(task)) return null;
        const runningCount = Object.values(state.byId).filter(hasRunningRun).length;
        if (runningCount >= MAX_CONCURRENT_RUNS) return null;
        const result = claim(task, now, now, false);
        // 手动插单跑不动排程：claim 会把 nextRunAt 从现在重排，这里还原回计划班次；
        // 已过的班次由 completeRun 在收口时推到未来（那时才算「这班跑过了」）。
        set((s) => ({ byId: { ...s.byId, [id]: { ...result.task, nextRunAt: task.nextRunAt } } }));
        return result.claimed;
      },

      attachSession: (taskId, runId, sessionId) =>
        set((state) => {
          const task = state.byId[taskId];
          if (!task) return state;
          return {
            byId: {
              ...state.byId,
              [taskId]: {
                ...task,
                runHistory: task.runHistory.map((run) =>
                  run.id === runId && run.status === "running" ? { ...run, sessionId } : run,
                ),
              },
            },
          };
        }),

      heartbeatRun: (taskId, runId, now = Date.now()) =>
        set((state) => {
          const task = state.byId[taskId];
          if (!task) return state;
          const run = task.runHistory.find((item) => item.id === runId);
          if (!run || run.status !== "running") return state;
          return {
            byId: {
              ...state.byId,
              [taskId]: {
                ...task,
                runHistory: task.runHistory.map((item) =>
                  item.id === runId ? { ...item, heartbeatAt: now } : item,
                ),
              },
            },
          };
        }),

      completeRun: ({ taskId, runId, ok, sessionId, summary, error, artifactIds, now = Date.now() }) =>
        set((state) => {
          const task = state.byId[taskId];
          if (!task) return state;
          const run = task.runHistory.find((item) => item.id === runId);
          if (!run || run.status !== "running") return state;
          const attempts = task.retryAttempts;
          // 简单重试：失败后最多自动补跑一次；再失败（或已重试过）回归正常排程。
          const retry = !ok && attempts < RETRY_MAX;
          // 收口时把「还在过去」的 nextRunAt 推到未来——覆盖两种来源：
          // 手动 runNow 不动排程留下的已到期班次，以及跑了很久把下一班也跑过头的班次。
          const settledNextRunAt = retry && task.enabled
            ? now + RETRY_DELAY_MS
            : task.enabled
              ? task.nextRunAt !== undefined && task.nextRunAt > now
                ? task.nextRunAt
                : nextRunAfter(task.schedule, now) ?? undefined
              : undefined;
          return {
            byId: {
              ...state.byId,
              [taskId]: {
                ...task,
                updatedAt: now,
                retryAttempts: retry ? attempts + 1 : 0,
                nextRunAt: settledNextRunAt,
                runHistory: task.runHistory.map((item) =>
                  item.id === runId
                    ? {
                        ...item,
                        status: ok ? "success" : "error",
                        finishedAt: now,
                        sessionId: sessionId ?? item.sessionId,
                        summary: summary ?? item.summary,
                        error: error ?? item.error,
                        artifactIds: artifactIds ?? item.artifactIds,
                      }
                    : item,
                ),
              },
            },
          };
        }),

      clearHistory: (id) =>
        set((state) => {
          const task = state.byId[id];
          if (!task) return state;
          // 只清已终结的；正在跑的那条留着（否则 UI 会突然丢行）。
          return {
            byId: {
              ...state.byId,
              [id]: { ...task, runHistory: task.runHistory.filter((run) => run.status === "running") },
            },
          };
        }),
    };
  },
  {
    name: PERSIST_KEYS.scheduledTasks,
    storage: "idb",
    partialize: (s) => ({ byId: s.byId, order: s.order }),
    onRehydrateStorage: () => (state) => {
      state?._setHasHydrated(true);
    },
  },
);

/** 任务当前那条正在跑的 run（没有则 undefined）。 */
export function runningRunOf(task: ScheduledTask): ScheduledRun | undefined {
  return task.runHistory.find((run) => run.status === "running");
}
