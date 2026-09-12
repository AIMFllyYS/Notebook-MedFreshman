import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { ChatMessage } from "@/lib/types/chat";
import type { Artifact } from "@/lib/stores/artifacts";
import type { StoredDocument } from "@/lib/documents/types";
import type { SessionMeta } from "@/lib/storage/chatStorage";
import { createMemorySyncClient } from "./client.ts";
import {
  __resetCloudSyncForTests,
  __setCloudSyncDebounceForTests,
  __setCloudSyncStoresForTests,
  __setSyncClientForTests,
  enqueueTombstone,
  enqueueUpsert,
  flushCloudSyncForTests,
  pullAndPushAll,
  type CloudSyncStores,
} from "./engine.ts";
import { __resetCloudSyncStatusForTests, getCloudSyncStatus } from "./status.ts";
import { MAX_ARTIFACT_BYTES, MAX_USER_SYNC_BYTES, SCHEMA_SYNC_KINDS, type ChatSessionSyncPayload } from "./types.ts";
import { setCloudSyncEnabled, isCloudSyncEnabled } from "./schedule.ts";

function msg(id: string, text: string, extra?: Partial<ChatMessage>): ChatMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
    timestamp: Number(id.replace(/\D/g, "")) || 1,
    ...extra,
  };
}

function sessionMeta(id: string, updatedAt = 10): SessionMeta {
  return {
    id,
    title: id,
    createdAt: 1,
    updatedAt,
    messageCount: 1,
    artifactIds: [],
  };
}

function createMemoryStores() {
  const sessions = new Map<string, { meta: SessionMeta; messages: ChatMessage[] }>();
  const artifacts = new Map<string, Artifact>();
  const documents = new Map<string, StoredDocument>();
  const stores: CloudSyncStores = {
    listSessionMetas: () => [...sessions.values()].map((row) => row.meta),
    loadSession: async (id) => sessions.get(id) ?? null,
    applySession: (payload: ChatSessionSyncPayload) => {
      sessions.set(payload.meta.id, { meta: payload.meta, messages: payload.messages });
    },
    forgetSession: (id) => {
      sessions.delete(id);
    },
    listArtifactIds: () => [...artifacts.keys()],
    getArtifact: (id) => artifacts.get(id) ?? null,
    applyArtifact: (artifact) => {
      artifacts.set(artifact.id, artifact);
    },
    forgetArtifact: (id) => {
      artifacts.delete(id);
    },
    listDocumentIds: () => [...documents.keys()],
    getDocument: (id) => documents.get(id) ?? null,
    applyDocument: (doc) => {
      documents.set(doc.id, doc);
    },
    forgetDocument: (id) => {
      documents.delete(id);
    },
  };
  return { stores, sessions, artifacts, documents };
}

describe("cloud sync engine", { concurrency: false }, () => {
  beforeEach(() => {
    __resetCloudSyncForTests();
    __resetCloudSyncStatusForTests();
    __setCloudSyncDebounceForTests(0);
  });

  afterEach(() => {
    __resetCloudSyncForTests();
    __resetCloudSyncStatusForTests();
    setCloudSyncEnabled(false);
  });

  test("pull restores chat-session and artifact onto empty local stores", async () => {
    const memory = createMemoryStores();
    const api = createMemorySyncClient();
    await api.upsert({
      kind: "chat-session",
      client_id: "s-remote",
      deleted: false,
      payload: {
        v: 1,
        meta: sessionMeta("s-remote"),
        messages: [msg("m1", "from-cloud")],
      },
    });
    await api.upsert({
      kind: "artifact",
      client_id: "art-1",
      deleted: false,
      payload: { id: "art-1", title: "demo", html: "<p>ok</p>", status: "done" },
    });
    __setCloudSyncStoresForTests(memory.stores);
    __setSyncClientForTests(api);
    api.upserts.length = 0;
    await pullAndPushAll();
    const session = memory.sessions.get("s-remote");
    const textPart = session?.messages[0]?.parts[0];
    assert.equal(textPart && textPart.type === "text" ? textPart.text : "", "from-cloud");
    assert.equal(memory.artifacts.get("art-1")?.html, "<p>ok</p>");
  });

  test("push strips base64 images and never writes settings or skill", async () => {
    const memory = createMemoryStores();
    memory.sessions.set("s1", {
      meta: sessionMeta("s1"),
      messages: [
        msg("m1", "photo", {
          attachments: [{ type: "image", mimeType: "image/png", base64: "data:image/png;base64,QUJDRA==" }],
        }),
      ],
    });
    memory.artifacts.set("a1", { id: "a1", title: "t", html: "<div>hi</div>", status: "done" });
    memory.documents.set("d1", {
      id: "d1",
      spec: { title: "Doc", format: "markdown", genre: "article", brief: "b" },
      sections: [{ title: "Intro", markdown: "# Hi", status: "done" }],
      status: "done",
      createdAt: 1,
      updatedAt: 2,
    });
    const api = createMemorySyncClient();
    __setCloudSyncStoresForTests(memory.stores);
    __setSyncClientForTests(api);
    await pullAndPushAll();
    const kinds = api.upserts.map((row) => row.kind);
    assert.ok(kinds.includes("chat-session"));
    assert.ok(kinds.includes("artifact"));
    assert.ok(kinds.includes("document"));
    assert.ok(SCHEMA_SYNC_KINDS.includes("settings"));
    assert.ok(SCHEMA_SYNC_KINDS.includes("skill"));
    assert.equal(kinds.includes("settings"), false);
    assert.equal(kinds.includes("skill"), false);
    const chat = api.upserts.find((row) => row.kind === "chat-session");
    const json = JSON.stringify(chat?.payload);
    assert.equal(json.includes("data:image"), false);
    assert.equal(json.includes("QUJDRA=="), false);
    assert.equal(json.includes('"base64"'), false);
    assert.equal(json.includes('"apiKey"'), false);
  });

  test("multi-device chat merge keeps both sides' messages", async () => {
    const memory = createMemoryStores();
    memory.sessions.set("s1", {
      meta: sessionMeta("s1", 40),
      messages: [msg("m1", "shared"), msg("m-local", "from-a")],
    });
    const api = createMemorySyncClient();
    await api.upsert({
      kind: "chat-session",
      client_id: "s1",
      deleted: false,
      payload: {
        v: 1,
        meta: sessionMeta("s1", 50),
        messages: [msg("m1", "shared"), msg("m-remote", "from-b")],
      },
    });
    __setCloudSyncStoresForTests(memory.stores);
    __setSyncClientForTests(api);
    enqueueUpsert("chat-session", "s1");
    await flushCloudSyncForTests();
    const pushed = api.rows.get("chat-session:s1");
    const payload = pushed?.payload as { messages: Array<{ id: string }> };
    const ids = payload.messages.map((row) => row.id).sort();
    assert.deepEqual(ids, ["m-local", "m-remote", "m1"].sort());
    assert.deepEqual(memory.sessions.get("s1")?.messages.map((row) => row.id).sort(), ids);
  });

  test("kind over-limit does not upsert and sets a readable error", async () => {
    const memory = createMemoryStores();
    memory.artifacts.set("huge", {
      id: "huge",
      title: "huge",
      html: "y".repeat(MAX_ARTIFACT_BYTES + 32),
      status: "done",
    });
    const api = createMemorySyncClient();
    __setCloudSyncStoresForTests(memory.stores);
    __setSyncClientForTests(api);
    enqueueUpsert("artifact", "huge");
    await flushCloudSyncForTests();
    assert.equal(api.rows.has("artifact:huge"), false);
    assert.match(getCloudSyncStatus().message ?? "", /未上传云端/);
  });

  test("user total over-limit refuses the new row", async () => {
    const memory = createMemoryStores();
    memory.artifacts.set("extra", { id: "extra", title: "e", html: "<p>more</p>", status: "done" });
    const api = createMemorySyncClient();
    await api.upsert({
      kind: "artifact",
      client_id: "filler",
      deleted: false,
      payload: { id: "filler", html: "z".repeat(MAX_USER_SYNC_BYTES - 8), status: "done", title: "f" },
    });
    __setCloudSyncStoresForTests(memory.stores);
    __setSyncClientForTests(api);
    api.upserts.length = 0;
    enqueueUpsert("artifact", "extra");
    await flushCloudSyncForTests();
    assert.equal(api.rows.has("artifact:extra"), false);
    assert.match(getCloudSyncStatus().message ?? "", /上限/);
  });

  test("schedule stays off until login enables it", () => {
    setCloudSyncEnabled(false);
    assert.equal(isCloudSyncEnabled(), false);
    setCloudSyncEnabled(true);
    assert.equal(isCloudSyncEnabled(), true);
    setCloudSyncEnabled(false);
  });

  test("tombstone marks deleted instead of removing the row", async () => {
    const api = createMemorySyncClient();
    await api.upsert({ kind: "chat-session", client_id: "gone", payload: { v: 1 }, deleted: false });
    __setCloudSyncStoresForTests(createMemoryStores().stores);
    __setSyncClientForTests(api);
    enqueueTombstone("chat-session", "gone");
    await flushCloudSyncForTests();
    const row = api.rows.get("chat-session:gone");
    assert.equal(row?.deleted, true);
    assert.equal(api.rows.size, 1);
  });
});
