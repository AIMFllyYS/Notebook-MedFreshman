import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import { flushPendingWrites, PERSIST_KEYS, chatSessionKey, __resetIdbStoragePendingForTests } from "@/lib/storage/idbStorage";
import type { ChatMessage } from "@/lib/types/chat";
import type { SessionMeta } from "@/lib/storage/chatStorage";

const storage = new Map<string, string>();

function installBrowserMocks() {
  (globalThis as { window?: unknown }).window = {
    addEventListener: () => {},
  };
  (globalThis as { document?: unknown }).document = {
    addEventListener: () => {},
    visibilityState: "visible",
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

function msg(id: string, content: string): ChatMessage {
  return { id, role: "assistant", content, timestamp: Number(id.replace(/\D/g, "")) || 1 };
}

function meta(id: string): SessionMeta {
  return {
    id,
    title: id,
    createdAt: 1,
    updatedAt: 1,
    messageCount: 1,
    artifactIds: [],
  };
}

async function waitForPendingWrites() {
  flushPendingWrites();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(async () => {
  storage.clear();
  __resetIdbStoragePendingForTests();
  installBrowserMocks();
  const { useChatHistory } = await import("./useChatHistory.ts");
  useChatHistory.setState({
    sessionsMeta: [],
    messagesById: {},
    activeSessionId: null,
    sessionLoadState: {},
    loadedSessionIds: [],
    pinnedSessionIds: [],
    _hasHydrated: false,
    _activeMessagesReady: false,
  });
});

afterEach(() => {
  __resetIdbStoragePendingForTests();
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { document?: unknown }).document;
  delete (globalThis as { indexedDB?: object }).indexedDB;
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

test("deleteSession：删除 active 会话后加载新的 active 会话消息", async () => {
  const { useChatHistory } = await import("./useChatHistory.ts");
  storage.set(chatSessionKey("s2"), JSON.stringify([msg("m2", "loaded")]));
  useChatHistory.setState({
    sessionsMeta: [meta("s1"), meta("s2")],
    messagesById: { s1: [msg("m1", "old")] },
    activeSessionId: "s1",
    sessionLoadState: { s1: "loaded" },
    loadedSessionIds: ["s1"],
    pinnedSessionIds: [],
    _hasHydrated: true,
    _activeMessagesReady: true,
  });

  useChatHistory.getState().deleteSession("s1");
  await new Promise((resolve) => setTimeout(resolve, 0));

  const state = useChatHistory.getState();
  assert.equal(state.activeSessionId, "s2");
  assert.equal(state.sessionLoadState.s2, "loaded");
  assert.equal(state._activeMessagesReady, true);
  assert.equal(state.messagesById.s2?.[0]?.content, "loaded");
});

test("updateMessage：content-only 流式更新只写 session，不写 manifest", async () => {
  const { useChatHistory } = await import("./useChatHistory.ts");
  useChatHistory.setState({
    sessionsMeta: [meta("s1")],
    messagesById: { s1: [msg("m1", "old")] },
    activeSessionId: "s1",
    sessionLoadState: { s1: "loaded" },
    loadedSessionIds: ["s1"],
    pinnedSessionIds: [],
    _hasHydrated: true,
    _activeMessagesReady: true,
  });

  useChatHistory.getState().updateMessage("s1", "m1", { content: "new" });
  await waitForPendingWrites();

  assert.equal(JSON.parse(storage.get(chatSessionKey("s1")) ?? "[]")[0].content, "new");
  assert.equal(storage.get(PERSIST_KEYS.chatManifest), undefined);
});

test("updateMessage：新增 artifactId 时写 manifest 供冷 prune 使用", async () => {
  const { useChatHistory } = await import("./useChatHistory.ts");
  useChatHistory.setState({
    sessionsMeta: [meta("s1")],
    messagesById: { s1: [msg("m1", "old")] },
    activeSessionId: "s1",
    sessionLoadState: { s1: "loaded" },
    loadedSessionIds: ["s1"],
    pinnedSessionIds: [],
    _hasHydrated: true,
    _activeMessagesReady: true,
  });

  useChatHistory.getState().updateMessage("s1", "m1", {
    toolCalls: [{ id: "tc1", name: "renderInteractive", arguments: {}, status: "success", artifactId: "a1" }],
  });
  await waitForPendingWrites();

  const manifest = JSON.parse(storage.get(PERSIST_KEYS.chatManifest) ?? "{}");
  assert.deepEqual(manifest.sessions[0].artifactIds, ["a1"]);
});
