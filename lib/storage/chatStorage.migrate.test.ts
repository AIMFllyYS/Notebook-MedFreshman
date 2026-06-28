import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import { PERSIST_KEYS } from "./idbStorage.ts";

const storage = new Map<string, string>();

function installBrowserMocks() {
  (globalThis as { window?: unknown }).window = {};
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
  installBrowserMocks();
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { indexedDB?: object }).indexedDB;
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

test("migrateFromV1IfNeeded：v1 单体 JSON 拆分为 manifest + per-session", async () => {
  const v1 = {
    state: {
      activeSessionId: "s1",
      sessions: [
        {
          id: "s1",
          title: "测试",
          createdAt: 1,
          updatedAt: 2,
          messages: [
            {
              id: "m1",
              role: "user",
              content: "hi",
              timestamp: 3,
            },
          ],
        },
      ],
    },
  };
  storage.set(PERSIST_KEYS.chatHistory, JSON.stringify(v1));

  const { migrateFromV1IfNeeded, loadManifest, loadSessionMessages } = await import("./chatStorage.ts");

  const migrated = await migrateFromV1IfNeeded();
  assert.equal(migrated, true);

  const manifest = await loadManifest();
  assert.ok(manifest);
  assert.equal(manifest!.version, 2);
  assert.equal(manifest!.sessions.length, 1);
  assert.equal(manifest!.activeSessionId, "s1");

  const messages = await loadSessionMessages("s1");
  assert.ok(messages);
  assert.equal(messages!.length, 1);
  assert.equal(messages![0].content, "hi");

  assert.equal(storage.get(PERSIST_KEYS.chatHistory), undefined);

  const again = await migrateFromV1IfNeeded();
  assert.equal(again, false);
});
