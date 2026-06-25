// IndexedDB 存储适配器 —— 为 zustand persist 中间件提供异步 StateStorage。
// 替代 localStorage 存储对话历史与交互演示 artifact，容量数百 MB，重启不丢失。
//
// 设计要点：
// 1. 单库单 store（gailvlun-db/keyval），所有持久化 key 同库共存，便于统一清理/导出。
// 2. 透明迁移：getItem 首次读不到 IndexedDB 时回退读旧 localStorage 并播种，幂等安全。
// 3. SSR 安全：所有方法在 typeof window === "undefined" 时降级返回 null/no-op。
// 4. 隐私模式/禁用 IndexedDB 时降级为 no-op，内存态仍可用（同 localStorage 失败行为）。

import { createStore, get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";

// ── 常量（单一真相源）────────────────────────────────────────────
const DB_NAME = "gailvlun-db";
const STORE_NAME = "keyval";

/** 各持久化 key 集中定义，禁止散落硬编码。 */
export const PERSIST_KEYS = {
  chatHistory: "chat-history",
  artifacts: "artifacts",
  skills: "skills",
  reviewCards: "review-cards",
} as const;

// 专属 IDB store 实例（非默认 keyval-store 库）
const idbStore = createStore(DB_NAME, STORE_NAME);

// ── SSR / 环境守卫 ──────────────────────────────────────────────
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

// ── 写入防抖（根治流式 OOM）────────────────────────────────────
// zustand persist 每次 set() 都会同步 JSON.stringify(整段状态) 并调 setItem 写盘。
// 流式对话每 token 一次 updateMessage → 每 token 写一次「整段 chat-history」。无防抖时
// 每次 setItem 都 `await idbSet(...)`（异步），高频 token 下大量写入并发在飞、各自持有
// 一份不断变大的历史字符串 → O(n²) 活跃内存 → 渲染进程 OOM（调试器实证断在此 setItem）。
// 方案：按 key 尾随防抖，最新值胜出，高频写合并为一次；页面卸载/隐藏时立即落盘，零丢失。
const WRITE_DEBOUNCE_MS = 800;
const pendingValues = new Map<string, string>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function writeNow(name: string, value: string): Promise<void> {
  try {
    await idbSet(name, value, idbStore);
  } catch {
    try {
      localStorage.setItem(name, value);
    } catch {
      // 静默失败，同项目既有行为
    }
  }
}

function flushKey(name: string): void {
  const timer = pendingTimers.get(name);
  if (timer) {
    clearTimeout(timer);
    pendingTimers.delete(name);
  }
  const value = pendingValues.get(name);
  if (value === undefined) return;
  pendingValues.delete(name);
  void writeNow(name, value);
}

/** 立即落盘所有挂起的写（卸载/隐藏/清空时调用）。 */
export function flushPendingWrites(): void {
  for (const name of [...pendingValues.keys()]) flushKey(name);
}

if (typeof window !== "undefined") {
  const flush = () => flushPendingWrites();
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

// ── zustand StateStorage 适配 ────────────────────────────────────
export const idbStorage = {
  async getItem(name: string): Promise<string | null> {
    if (!isBrowser()) return null;
    // 命中尚未落盘的最新值，避免「写后立即读」拿到旧数据
    const pending = pendingValues.get(name);
    if (pending !== undefined) return pending;
    try {
      // 1. 先读 IndexedDB
      const val = await idbGet<string>(name, idbStore);
      if (val != null) return val;

      // 2. IndexedDB 无 → 回退读旧 localStorage（透明迁移）
      const legacy = localStorage.getItem(name);
      if (legacy != null) {
        // 播种到 IndexedDB，下次直接命中
        await idbSet(name, legacy, idbStore);
        // 释放旧 localStorage 空间
        localStorage.removeItem(name);
        return legacy;
      }
      return null;
    } catch {
      // IndexedDB 不可用（隐私模式等）→ 尝试 localStorage 兜底
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    }
  },

  // 防抖写：仅暂存最新值并重置计时；真正落盘在 WRITE_DEBOUNCE_MS 后或卸载时。
  // 返回 void（同步调度）——persist 不依赖其完成，避免每 token 一次真实 IDB 写。
  setItem(name: string, value: string): void {
    if (!isBrowser()) return;
    pendingValues.set(name, value);
    const existing = pendingTimers.get(name);
    if (existing) clearTimeout(existing);
    pendingTimers.set(name, setTimeout(() => flushKey(name), WRITE_DEBOUNCE_MS));
  },

  async removeItem(name: string): Promise<void> {
    if (!isBrowser()) return;
    // 取消尚未落盘的写，避免删除后又被旧值覆盖回来
    const timer = pendingTimers.get(name);
    if (timer) {
      clearTimeout(timer);
      pendingTimers.delete(name);
    }
    pendingValues.delete(name);
    try {
      await idbDel(name, idbStore);
    } catch {
      // ignore
    }
    // 同时清除可能残留的 localStorage 旧 key
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

// ── 工具函数 ────────────────────────────────────────────────────

/** 估算 IndexedDB 中某 key 的数据大小（字节）。 */
export async function estimateSize(key: string): Promise<number> {
  if (!isBrowser()) return 0;
  try {
    const val = await idbGet<string>(key, idbStore);
    if (!val) return 0;
    return new Blob([val]).size;
  } catch {
    return 0;
  }
}

/** 清空全部持久化数据（设置面板"清空所有"可复用）。 */
export async function clearAll(): Promise<void> {
  if (!isBrowser()) return;
  // 先取消所有挂起写，避免清空后被旧值写回
  for (const timer of pendingTimers.values()) clearTimeout(timer);
  pendingTimers.clear();
  pendingValues.clear();
  for (const key of Object.values(PERSIST_KEYS)) {
    try {
      await idbDel(key, idbStore);
    } catch {
      // ignore
    }
  }
}
