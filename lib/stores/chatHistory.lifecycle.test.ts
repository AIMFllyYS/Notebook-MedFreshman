import assert from "node:assert/strict";
import { beforeEach, afterEach, describe, test } from "node:test";
import { flushPendingWrites, PERSIST_KEYS, chatBlobKey, chatSessionKey, __resetIdbStoragePendingForTests } from "@/lib/storage/idbStorage";
import { cancelOrphanChatGc } from "@/lib/storage/chatStorage";
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
    key(index: number) {
      return [...storage.keys()][index] ?? null;
    },
  };
}

function msg(id: string, content: string): ChatMessage {
  return { id, role: "assistant", parts: [{ type: "text", text: content }], timestamp: Number(id.replace(/\D/g, "")) || 1 };
}

function textOf(m: ChatMessage | undefined): string | undefined {
  const part = m?.parts.find((p) => p.type === "text");
  return part && part.type === "text" ? part.text : undefined;
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

describe("chatHistory.lifecycle", { concurrency: false }, () => {
beforeEach(async () => {
  cancelOrphanChatGc();
  storage.clear();
  __resetIdbStoragePendingForTests();
  installBrowserMocks();
  const { useChatHistory } = await import("./chatHistory.ts");
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
  cancelOrphanChatGc();
  __resetIdbStoragePendingForTests();
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { document?: unknown }).document;
  delete (globalThis as { indexedDB?: object }).indexedDB;
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

test("deleteSession：删除 active 会话后加载新的 active 会话消息", async () => {
  const { useChatHistory } = await import("./chatHistory.ts");
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
  assert.equal(textOf(state.messagesById.s2?.[0]), "loaded");
});

test("updateMessage：content-only 流式更新只写 session，不写 manifest", async () => {
  const { useChatHistory } = await import("./chatHistory.ts");
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

  useChatHistory.getState().updateMessage("s1", "m1", { parts: [{ type: "text", text: "new" }] });
  await waitForPendingWrites();

  assert.equal(textOf(JSON.parse(storage.get(chatSessionKey("s1")) ?? "[]")[0]), "new");
  assert.equal(storage.get(PERSIST_KEYS.chatManifest), undefined);
});

test("updateMessage：新增 artifactId 时写 manifest 供冷 prune 使用", async () => {
  const { useChatHistory } = await import("./chatHistory.ts");
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
    parts: [
      {
        type: "tool-renderInteractive",
        toolCallId: "tc1",
        state: "output-available",
        input: { title: "t", prompt: "p" },
        output: { text: "", artifactId: "a1", title: "t", prompt: "p" },
      },
    ],
  });
  await waitForPendingWrites();

  const manifest = JSON.parse(storage.get(PERSIST_KEYS.chatManifest) ?? "{}");
  assert.deepEqual(manifest.sessions[0].artifactIds, ["a1"]);
});

test("createSession uses UUID ids that do not collide in the same millisecond", async () => {
  const { useChatHistory } = await import("./chatHistory.ts");
  const first = useChatHistory.getState().createSession();
  const second = useChatHistory.getState().createSession();
  assert.notEqual(first, second);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.match(second, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test("evicting past MAX_SESSIONS deletes blobs and drops messagesById", async () => {
  const { useChatHistory } = await import("./chatHistory.ts");
  const evicted = "old-49";
  const metas = Array.from({ length: 50 }, (_, index) => meta(`old-${String(index).padStart(2, "0")}`));
  const blobId = "blob-evicted";
  storage.set(
    chatSessionKey(evicted),
    JSON.stringify([
      {
        id: "m-old",
        role: "user",
        parts: [{ type: "text", text: "pic" }],
        timestamp: 1,
        attachments: [{ id: blobId, type: "image", mimeType: "image/png" }],
      },
    ]),
  );
  storage.set(chatBlobKey(blobId), "data:image/png;base64,QUJD");
  useChatHistory.setState({
    sessionsMeta: metas,
    messagesById: {
      [evicted]: [
        {
          id: "m-old",
          role: "user",
          parts: [{ type: "text", text: "pic" }],
          timestamp: 1,
          attachments: [{ id: blobId, type: "image", mimeType: "image/png" }],
        },
      ],
    },
    activeSessionId: evicted,
    sessionLoadState: { [evicted]: "loaded" },
    loadedSessionIds: [evicted],
    pinnedSessionIds: [],
    _hasHydrated: true,
    _activeMessagesReady: true,
  });

  useChatHistory.getState().createSession();
  await new Promise((resolve) => setTimeout(resolve, 20));
  await waitForPendingWrites();

  assert.equal(useChatHistory.getState().messagesById[evicted], undefined);
  assert.equal(storage.has(chatBlobKey(blobId)), false);
  assert.equal(storage.has(chatSessionKey(evicted)), false);
  const ids = useChatHistory.getState().sessionsMeta.map((item) => item.id);
  assert.equal(ids.includes(evicted), false);
  assert.equal(ids.length, 50);
});

test("updateMessage on an evicted session does not write the shard back", async () => {
  const { useChatHistory } = await import("./chatHistory.ts");
  const evicted = "old-49";
  const metas = Array.from({ length: 50 }, (_, index) => meta(`old-${String(index).padStart(2, "0")}`));
  useChatHistory.setState({
    sessionsMeta: metas,
    messagesById: { [evicted]: [msg("m1", "stay")] },
    activeSessionId: evicted,
    sessionLoadState: { [evicted]: "loaded" },
    loadedSessionIds: [evicted],
    pinnedSessionIds: [],
    _hasHydrated: true,
    _activeMessagesReady: true,
  });
  useChatHistory.getState().createSession();
  storage.delete(chatSessionKey(evicted));
  useChatHistory.getState().updateMessage(evicted, "m1", { parts: [{ type: "text", text: "ghost" }] });
  await waitForPendingWrites();
  assert.equal(storage.get(chatSessionKey(evicted)), undefined);
});
});
