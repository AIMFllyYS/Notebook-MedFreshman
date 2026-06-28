import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  idbStorage,
  flushPendingWrites,
  WRITE_DEBOUNCE_MS,
  __resetIdbStoragePendingForTests,
} from "./idbStorage.ts";

const storage = new Map<string, string>();

function installBrowserMocks() {
  const listeners = new Map<string, Set<() => void>>();
  (globalThis as { window?: unknown }).window = {
    addEventListener: (type: string, fn: () => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
  };
  (globalThis as { indexedDB?: object }).indexedDB = {};
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return storage.size;
    },
    clear() {
      storage.clear();
    },
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
    key() {
      return null;
    },
  };
}

beforeEach(() => {
  storage.clear();
  __resetIdbStoragePendingForTests();
  installBrowserMocks();
});

afterEach(() => {
  __resetIdbStoragePendingForTests();
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { indexedDB?: object }).indexedDB;
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

test("setItem：防抖窗口内多次写入只落盘最后一次", async () => {
  let writes = 0;
  const originalSetItem = globalThis.localStorage!.setItem.bind(globalThis.localStorage);
  globalThis.localStorage!.setItem = (key: string, value: string) => {
    writes += 1;
    originalSetItem(key, value);
  };

  idbStorage.setItem("chat-history", '{"v":1}');
  idbStorage.setItem("chat-history", '{"v":2}');
  idbStorage.setItem("chat-history", '{"v":3}');

  assert.equal(writes, 0, "防抖期内不应写盘");

  await new Promise((r) => setTimeout(r, WRITE_DEBOUNCE_MS + 50));
  assert.equal(writes, 1, "防抖结束后应只写一次");
  assert.equal(storage.get("chat-history"), '{"v":3}');
});

test("getItem：未落盘时返回 pending 最新值", async () => {
  idbStorage.setItem("chat-history", '{"pending":true}');
  const val = await idbStorage.getItem("chat-history");
  assert.equal(val, '{"pending":true}');
});

test("flushPendingWrites：立即落盘所有挂起 key", () => {
  let writes = 0;
  const originalSetItem = globalThis.localStorage!.setItem.bind(globalThis.localStorage);
  globalThis.localStorage!.setItem = (key: string, value: string) => {
    writes += 1;
    originalSetItem(key, value);
  };

  idbStorage.setItem("a", "1");
  idbStorage.setItem("b", "2");
  flushPendingWrites();
  assert.equal(writes, 2);
  assert.equal(storage.get("a"), "1");
  assert.equal(storage.get("b"), "2");
});
