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
} as const;

// 专属 IDB store 实例（非默认 keyval-store 库）
const idbStore = createStore(DB_NAME, STORE_NAME);

// ── SSR / 环境守卫 ──────────────────────────────────────────────
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

// ── zustand StateStorage 适配 ────────────────────────────────────
export const idbStorage = {
  async getItem(name: string): Promise<string | null> {
    if (!isBrowser()) return null;
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

  async setItem(name: string, value: string): Promise<void> {
    if (!isBrowser()) return;
    try {
      await idbSet(name, value, idbStore);
    } catch {
      // IndexedDB 写入失败 → 降级尝试 localStorage
      try {
        localStorage.setItem(name, value);
      } catch {
        // 静默失败，同项目既有行为
      }
    }
  },

  async removeItem(name: string): Promise<void> {
    if (!isBrowser()) return;
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
  for (const key of Object.values(PERSIST_KEYS)) {
    try {
      await idbDel(key, idbStore);
    } catch {
      // ignore
    }
  }
}
