import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import { PERSIST_KEYS } from "./idbStorage.ts";

const storage = new Map<string, string>();
let failSetItemForPrefix: string | null = null;

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
      if (failSetItemForPrefix && key.startsWith(failSetItemForPrefix)) {
        throw new Error(`forced write failure: ${key}`);
      }
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
  failSetItemForPrefix = null;
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

test("migrateFromV1IfNeeded：v2 写入失败时保留 legacy 以便重试", async () => {
  const v1 = {
    state: {
      activeSessionId: "s1",
      sessions: [
        {
          id: "s1",
          title: "测试",
          createdAt: 1,
          updatedAt: 2,
          messages: [{ id: "m1", role: "user", content: "hi", timestamp: 3 }],
        },
      ],
    },
  };
  const legacyRaw = JSON.stringify(v1);
  storage.set(PERSIST_KEYS.chatHistory, legacyRaw);
  failSetItemForPrefix = "chat-session:";

  const { migrateFromV1IfNeeded, loadManifest } = await import("./chatStorage.ts");

  const migrated = await migrateFromV1IfNeeded();

  assert.equal(migrated, false);
  assert.equal(storage.get(PERSIST_KEYS.chatHistory), legacyRaw);
  assert.equal(await loadManifest(), null);
});

test("migrateFromV1IfNeeded：inline 图片迁移为 blob ref 且可 hydrate 回 API 附件", async () => {
  const dataUrl = "data:image/png;base64,abc";
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
              content: "看图",
              timestamp: 3,
              attachments: [{ type: "image", mimeType: "image/png", base64: dataUrl }],
            },
          ],
        },
      ],
    },
  };
  storage.set(PERSIST_KEYS.chatHistory, JSON.stringify(v1));

  const { migrateFromV1IfNeeded, loadSessionMessages, hydrateAttachmentsForApi } = await import("./chatStorage.ts");

  assert.equal(await migrateFromV1IfNeeded(), true);
  const stored = await loadSessionMessages("s1");
  assert.ok(stored);
  assert.equal("id" in stored![0].attachments![0], true);
  assert.equal("base64" in stored![0].attachments![0], false);

  const hydrated = await hydrateAttachmentsForApi(stored!);
  assert.equal(hydrated[0].attachments?.[0].base64, dataUrl);
});
